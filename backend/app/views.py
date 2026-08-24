from decimal import Decimal
from collections import defaultdict
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Business, Product, SaleRecord, Expense, StockMovement


@api_view(['GET'])
def dashboard_summary(request, business_id):
    """
    Executive dashboard data for one business: revenue, expenses, profit,
    payment/category breakdowns, monthly trends, and recent sales.
    Powers inventory.dart's whole dashboard screen.
    """
    # Look up the business — 404 if the ID doesn't exist
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    # Scope every query to just this business's data
    sales = SaleRecord.objects.filter(business=business)
    expenses = Expense.objects.filter(business=business)
    products = Product.objects.filter(business=business)

    # ── Hero banner numbers ──
    # Sum() adds up a column across all matching rows in one DB query
    net_revenue = sales.aggregate(total=Sum('amount'))['total'] or Decimal('0')
    total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0')
    net_profit = max(Decimal('0'), net_revenue - total_expenses)
    net_margin = (net_profit / net_revenue * 100) if net_revenue > 0 else Decimal('0')
    active_inventory = products.aggregate(total=Sum('stock_count'))['total'] or 0

    # ── Payment channel split (as % of total sales amount) ──
    # values('payment_channel').annotate(...) groups sales by channel and
    # sums each group — one query, not a loop over every sale
    payment_split = []
    if net_revenue > 0:
        by_channel = sales.values('payment_channel').annotate(total=Sum('amount'))
        for row in by_channel:
            percent = (row['total'] / net_revenue) * 100
            payment_split.append({
                'channel': row['payment_channel'],
                'percent': round(percent, 1),
            })

    # ── Category volume (as % of total stock) ──
    # Same grouping idea, but grouping products by category instead of
    # sales by payment channel
    category_volume = []
    total_stock = active_inventory
    if total_stock > 0:
        by_category = products.values('category').annotate(total=Sum('stock_count'))
        for row in by_category:
            percent = (row['total'] / total_stock) * 100
            category_volume.append({
                'category': row['category'],
                'percent': round(percent, 1),
            })

    # ── Sales vs expense breakdown, by month ──
    # TruncMonth() chops each row's exact timestamp down to just its month
    # (e.g. 2026-08-15 -> 2026-08-01), so rows in the same month group together
    monthly_sales = (
        sales.annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )
    monthly_expenses = (
        expenses.annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )

    # ── Monthly profit margin ──
    # monthly_sales and monthly_expenses are two separate querysets — this
    # merges them by month into one dict so we can compute margin per month
    monthly_data = defaultdict(lambda: {'sales': Decimal('0'), 'expenses': Decimal('0')})
    for row in monthly_sales:
        monthly_data[row['month']]['sales'] = row['total']
    for row in monthly_expenses:
        monthly_data[row['month']]['expenses'] = row['total']

    monthly_profit_margin = []
    for month, data in sorted(monthly_data.items()):
        month_sales = data['sales']
        month_expenses = data['expenses']
        margin = ((month_sales - month_expenses) / month_sales * 100) if month_sales > 0 else Decimal('0')
        # sorted() above + append() here keeps months in chronological order
        # (Jan before Feb before Mar...) instead of random dict order
        monthly_profit_margin.append({
            'month': month,
            'margin': round(margin, 1),
        })

    # ── Recent activity (last 5 sales) ──
    # order_by('-created_at') = newest first, [:5] = only the top 5
    recent_sales = sales.order_by('-created_at')[:5]
    recent_activity = [
        {
            'product': s.product.name if s.product else 'Unknown',
            'amount': s.amount,
            'payment_channel': s.payment_channel,
            'created_at': s.created_at,
        }
        for s in recent_sales
    ]

    # Bundle everything into one JSON response for the frontend
    return Response({
        'net_revenue': net_revenue,
        'expenses': total_expenses,
        'net_profit': net_profit,
        'net_margin': round(net_margin, 1),
        'active_inventory': active_inventory,
        'payment_channel_split': payment_split,
        'category_volume': category_volume,
        'monthly_sales': [{'month': r['month'], 'total': r['total']} for r in monthly_sales],
        'monthly_expenses': [{'month': r['month'], 'total': r['total']} for r in monthly_expenses],
        'monthly_profit_margin': monthly_profit_margin,
        'recent_activity': recent_activity,
    })


@api_view(['GET'])
def pos_summary(request, business_id):
    """
    Per-product analytics: cost, price, stock, units sold, profit margin,
    sell-through rate, and performance tier for every product this business
    has. Powers pos.dart's product list and summary tiles.
    """
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    products = Product.objects.filter(business=business)

    # One entry per product, with all its computed analytics attached
    product_list = []
    for p in products:
        sales = SaleRecord.objects.filter(business=business, product=p)
        units_sold = sales.aggregate(total=Sum('quantity'))['total'] or 0
        total_revenue = sales.aggregate(total=Sum('amount'))['total'] or Decimal('0')

        # Cost of goods sold = units sold x what we paid per unit
        total_cost = Decimal(units_sold) * p.cost_price
        gross_profit = total_revenue - total_cost
        profit_margin = (gross_profit / total_revenue * 100) if total_revenue > 0 else Decimal('0')

        # Sell-through = what % of everything we've ever handled has sold
        total_handled = units_sold + p.stock_count
        sell_through_rate = (Decimal(units_sold) / Decimal(total_handled) * 100) if total_handled > 0 else Decimal('0')

        # Bucket each product into a performance tier based on sell-through
        if sell_through_rate >= 70:
            performance_tier = 'Star Performer'
        elif sell_through_rate >= 40:
            performance_tier = 'Steady'
        else:
            performance_tier = 'Slow Mover'

        # Stock status compares current stock to the product's own reorder point
        if p.stock_count <= 0:
            stock_status = 'Out of Stock'
        elif p.stock_count <= p.reorder_point:
            stock_status = 'Low Stock'
        else:
            stock_status = 'In Stock'

        product_list.append({
            'id': p.id,
            'name': p.name,
            'category': p.category,
            'cost_price': p.cost_price,
            'selling_price': p.price,
            'stock_quantity': p.stock_count,
            'units_sold': units_sold,
            'total_revenue': total_revenue,
            'total_cost': total_cost,
            'gross_profit': gross_profit,
            'profit_margin': round(profit_margin, 1),
            'sell_through_rate': round(sell_through_rate, 1),
            'performance_tier': performance_tier,
            'stock_status': stock_status,
        })

    # ── Aggregate summary tiles (totals across all products) ──
    total_inventory_value = sum((item['stock_quantity'] * item['cost_price'] for item in product_list), Decimal('0'))
    total_revenue = sum((item['total_revenue'] for item in product_list), Decimal('0'))
    total_profit = sum((item['gross_profit'] for item in product_list), Decimal('0'))
    avg_sell_through = (
        sum((item['sell_through_rate'] for item in product_list), Decimal('0')) / len(product_list)
        if product_list else Decimal('0')
    )

    # ── Spotlight leaders — None if there are no products at all ──
    top_seller = max(product_list, key=lambda i: i['units_sold']) if product_list else None
    most_profitable = max(product_list, key=lambda i: i['gross_profit']) if product_list else None
    best_margin = max(product_list, key=lambda i: i['profit_margin']) if product_list else None

    return Response({
        'products': product_list,
        'total_inventory_value': total_inventory_value,
        'total_revenue': total_revenue,
        'total_profit': total_profit,
        'avg_sell_through': round(avg_sell_through, 1),
        'top_seller': top_seller,
        'most_profitable': most_profitable,
        'best_margin': best_margin,
    })


@api_view(['GET', 'POST'])
def stock_movements(request, business_id):
    """
    One view for everything StockMovement-related, split by HTTP method:
      GET  -> return the recent stock movement log (read)
      POST -> create a new Stock In / Waste-Damage adjustment (write)
    Merged into one function/URL since they're both about the same table.
    """
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    # ══════════════════ GET: return the log ══════════════════
    if request.method == 'GET':
        # Optional ?type=stock_in / waste_damage / low_stock_alert filter,
        # e.g. GET /stock-movements/?type=stock_in
        movement_type = request.GET.get('type')

        # select_related() pulls product/user in the same query instead of
        # a separate query per row (avoids the N+1 query problem)
        movements = (
            StockMovement.objects.filter(business=business)
            .select_related('product', 'user')
            .order_by('-created_at')
        )

        if movement_type:
            movements = movements.filter(movement_type=movement_type)

        movements = movements[:20]  # only the most recent 20

        log_data = []
        for m in movements:
            # Build a human-readable quantity string per movement type
            if m.movement_type == 'stock_in':
                qty_display = f"+{m.quantity_change} units"
            elif m.movement_type == 'waste_damage':
                qty_display = f"{m.quantity_change} units ({m.resulting_stock} left)"
            else:
                qty_display = f"{m.resulting_stock} units left"

            log_data.append({
                'id': m.id,
                'type': m.get_movement_type_display(),  # e.g. 'Stock In' not 'stock_in'
                'item': m.product.name if m.product else 'Unknown',
                'qty': qty_display,
                'time': m.created_at,
                'user': m.user.username if m.user else 'System',
                'category': m.product.category if m.product else '',
                'currentStock': m.resulting_stock,
                'reorderPoint': m.product.reorder_point if m.product else 0,
            })

        return Response({'movements': log_data})

    # ══════════════════ POST: create a new adjustment ══════════════════
    # Pull the submitted fields out of the request body
    product_id = request.data.get('product_id')
    movement_type = request.data.get('movement_type')  # 'stock_in' or 'waste_damage'
    quantity_change = request.data.get('quantity_change')
    note = request.data.get('note', '')

    # Basic validation before touching the database
    if not product_id or not movement_type or quantity_change is None:
        return Response({'error': 'product_id, movement_type, and quantity_change are required'}, status=400)

    if movement_type not in ('stock_in', 'waste_damage'):
        return Response({'error': "movement_type must be 'stock_in' or 'waste_damage'"}, status=400)

    try:
        product = Product.objects.get(id=product_id, business=business)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    quantity_change = int(quantity_change)
    # Force the sign to match the movement type, regardless of what was sent:
    # stock_in always adds, waste_damage always subtracts
    if movement_type == 'waste_damage' and quantity_change > 0:
        quantity_change = -quantity_change

    # Update the actual stock count — max(0, ...) stops it going negative
    product.stock_count = max(0, product.stock_count + quantity_change)
    product.save(update_fields=['stock_count'])

    # Create the audit log row for this adjustment — the descriptive,
    # human-readable trail (who, when, why, note).
    movement = StockMovement.objects.create(
        business=business,
        product=product,
        movement_type=movement_type,
        quantity_change=quantity_change,
        resulting_stock=product.stock_count,
        note=note,
    )

    # NOTE: no Expense.objects.create() here anymore — Product.save() above
    # (triggered by product.save(update_fields=['stock_count'])) already
    # detected the stock increase and logged the matching Expense
    # automatically. This is now the ONLY place that logic lives, so it
    # can't be duplicated or forgotten, regardless of how stock changes.

    # If this adjustment dropped stock to/below the reorder point,
    # automatically create a second row flagging it
    if product.stock_count <= product.reorder_point:
        StockMovement.objects.create(
            business=business,
            product=product,
            movement_type='low_stock_alert',
            quantity_change=0,
            resulting_stock=product.stock_count,
            note=f'Stock at {product.stock_count}, reorder point is {product.reorder_point}',
        )

    return Response({
        'id': movement.id,
        'product': product.name,
        'movement_type': movement.get_movement_type_display(),
        'quantity_change': movement.quantity_change,
        'resulting_stock': movement.resulting_stock,
        'created_at': movement.created_at,
    }, status=201)


@api_view(['POST'])
def create_sale(request, business_id):
    """
    Records a sale AND decrements the product's stock count in the same
    call — this is what keeps stock_count (and everything derived from it:
    Total Value, Sell-Through Rate, Low Stock Alerts) accurate after a sale.

    IMPORTANT: 'amount' is NOT taken from the request anymore. It's
    calculated here as product.price x quantity, so it's impossible for
    amount and quantity to drift out of sync the way they did when they
    were entered manually (e.g. amount=1300 with quantity=4 instead of
    amount=5200). If you need to support discounts later, add a separate
    'discount' field instead of letting the caller set amount directly.
    """
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    # Pull the submitted sale details out of the request body
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    payment_channel = request.data.get('payment_channel')

    # Basic validation before touching the database
    if not product_id or not payment_channel:
        return Response({'error': 'product_id and payment_channel are required'}, status=400)

    try:
        product = Product.objects.get(id=product_id, business=business)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    quantity = int(quantity)
    # Block overselling — can't sell more than what's physically in stock
    if quantity > product.stock_count:
        return Response({'error': f'Only {product.stock_count} units in stock'}, status=400)

    # amount and stock_count are no longer touched here — SaleRecord.save()
    # in models.py now handles both automatically the moment the record is
    # created, so this stays correct no matter how a sale gets created
    # (this endpoint, Django admin, the shell). See models.py for the logic.

    # 1. Create the sale record — amount gets calculated and stock gets
    # decremented automatically inside SaleRecord.save()
    sale = SaleRecord.objects.create(
        business=business,
        product=product,
        quantity=quantity,
        payment_channel=payment_channel,
    )

    # Refresh product from DB so we return the up-to-date stock_count
    # (save() above updated it in the DB, but this local `product` object
    # in memory still holds the old value until we reload it)
    product.refresh_from_db()

    # 2. If this sale dropped stock to/below reorder point, auto-log an alert.
    # (Sales themselves don't get a StockMovement row — SaleRecord and
    # recent_activity already cover "what sold". StockMovement is reserved
    # for manual adjustments and these alerts.)

    if product.stock_count <= product.reorder_point:
        StockMovement.objects.create(
            business=business,
            product=product,
            movement_type='low_stock_alert',
            quantity_change=0,
            resulting_stock=product.stock_count,
            note=f'Stock at {product.stock_count}, reorder point is {product.reorder_point}',
        )

    return Response({
        'id': sale.id,
        'product': product.name,
        'amount': sale.amount,
        'quantity': sale.quantity,
        'payment_channel': sale.payment_channel,
        'remaining_stock': product.stock_count,
        'created_at': sale.created_at,
    }, status=201)