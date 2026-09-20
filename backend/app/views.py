import io
import openpyxl
from openpyxl.styles import Font
import pandas as pd
from django.http import FileResponse
from decimal import Decimal
from collections import defaultdict
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Business, Product, SaleRecord, Expense, StockMovement, Order, OrderItem


TRUNC_FUNCS = {
    'daily': TruncDay,
    'weekly': TruncWeek,
    'monthly': TruncMonth,
}


@api_view(['GET'])
def dashboard_summary(request, business_id):
    """
    Executive dashboard data for one business: revenue, expenses, profit,
    payment/category breakdowns, period trends, and recent sales.
    Accepts ?period=daily|weekly|monthly (defaults to monthly) to control
    the granularity of the sales/expense/margin chart.
    """
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    period = request.GET.get('period', 'monthly')
    trunc_func = TRUNC_FUNCS.get(period, TruncMonth)

    sales = SaleRecord.objects.filter(business=business)
    expenses = Expense.objects.filter(business=business)
    products = Product.objects.filter(business=business)

    net_revenue = sales.aggregate(total=Sum('amount'))['total'] or Decimal('0')
    total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0')
    net_profit = max(Decimal('0'), net_revenue - total_expenses)
    net_margin = (net_profit / net_revenue * 100) if net_revenue > 0 else Decimal('0')
    active_inventory = products.aggregate(total=Sum('stock_count'))['total'] or 0

    payment_split = []
    if net_revenue > 0:
        by_channel = sales.values('payment_channel').annotate(total=Sum('amount'))
        for row in by_channel:
            percent = (row['total'] / net_revenue) * 100
            payment_split.append({
                'channel': row['payment_channel'],
                'percent': round(percent, 1),
            })

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

    # Period-aware grouping — daily/weekly/monthly, driven by trunc_func
    period_sales = (
        sales.annotate(period=trunc_func('created_at'))
        .values('period')
        .annotate(total=Sum('amount'))
        .order_by('period')
    )
    period_expenses = (
        expenses.annotate(period=trunc_func('created_at'))
        .values('period')
        .annotate(total=Sum('amount'))
        .order_by('period')
    )

    period_data = defaultdict(lambda: {'sales': Decimal('0'), 'expenses': Decimal('0')})
    for row in period_sales:
        period_data[row['period']]['sales'] = row['total']
    for row in period_expenses:
        period_data[row['period']]['expenses'] = row['total']

    period_margin = []
    for p, data in sorted(period_data.items()):
        p_sales = data['sales']
        p_expenses = data['expenses']
        margin = ((p_sales - p_expenses) / p_sales * 100) if p_sales > 0 else Decimal('0')
        period_margin.append({
            'period': p,
            'margin': round(margin, 1),
        })

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

    return Response({
        'net_revenue': net_revenue,
        'expenses': total_expenses,
        'net_profit': net_profit,
        'net_margin': round(net_margin, 1),
        'active_inventory': active_inventory,
        'payment_channel_split': payment_split,
        'category_volume': category_volume,
        'period': period,
        'period_sales': [{'period': r['period'], 'total': r['total']} for r in period_sales],
        'period_expenses': [{'period': r['period'], 'total': r['total']} for r in period_expenses],
        'period_margin': period_margin,
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

    product_list = []
    for p in products:
        sales = SaleRecord.objects.filter(business=business, product=p)
        units_sold = sales.aggregate(total=Sum('quantity'))['total'] or 0
        total_revenue = sales.aggregate(total=Sum('amount'))['total'] or Decimal('0')

        total_cost = Decimal(units_sold) * p.cost_price
        gross_profit = total_revenue - total_cost
        profit_margin = (gross_profit / total_revenue * 100) if total_revenue > 0 else Decimal('0')

        total_handled = units_sold + p.stock_count
        sell_through_rate = (Decimal(units_sold) / Decimal(total_handled) * 100) if total_handled > 0 else Decimal('0')

        if sell_through_rate >= 70:
            performance_tier = 'Star Performer'
        elif sell_through_rate >= 40:
            performance_tier = 'Steady'
        else:
            performance_tier = 'Slow Mover'

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

    total_inventory_value = sum((item['stock_quantity'] * item['cost_price'] for item in product_list), Decimal('0'))
    total_revenue = sum((item['total_revenue'] for item in product_list), Decimal('0'))
    total_profit = sum((item['gross_profit'] for item in product_list), Decimal('0'))
    avg_sell_through = (
        sum((item['sell_through_rate'] for item in product_list), Decimal('0')) / len(product_list)
        if product_list else Decimal('0')
    )

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
    """
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    if request.method == 'GET':
        movement_type = request.GET.get('type')

        movements = (
            StockMovement.objects.filter(business=business)
            .select_related('product', 'user')
            .order_by('-created_at')
        )

        if movement_type:
            movements = movements.filter(movement_type=movement_type)

        movements = movements[:20]

        log_data = []
        for m in movements:
            if m.movement_type == 'stock_in':
                qty_display = f"+{m.quantity_change} units"
            elif m.movement_type == 'waste_damage':
                qty_display = f"{m.quantity_change} units ({m.resulting_stock} left)"
            else:
                qty_display = f"{m.resulting_stock} units left"

            log_data.append({
                'id': m.id,
                'type': m.get_movement_type_display(),
                'item': m.product.name if m.product else 'Unknown',
                'qty': qty_display,
                'time': m.created_at,
                'user': m.user.username if m.user else 'System',
                'category': m.product.category if m.product else '',
                'currentStock': m.resulting_stock,
                'reorderPoint': m.product.reorder_point if m.product else 0,
            })

        return Response({'movements': log_data})

    product_id = request.data.get('product_id')
    movement_type = request.data.get('movement_type')
    quantity_change = request.data.get('quantity_change')
    note = request.data.get('note', '')

    if not product_id or not movement_type or quantity_change is None:
        return Response({'error': 'product_id, movement_type, and quantity_change are required'}, status=400)

    if movement_type not in ('stock_in', 'waste_damage'):
        return Response({'error': "movement_type must be 'stock_in' or 'waste_damage'"}, status=400)

    try:
        product = Product.objects.get(id=product_id, business=business)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    quantity_change = int(quantity_change)
    if movement_type == 'waste_damage' and quantity_change > 0:
        quantity_change = -quantity_change

    product.stock_count = max(0, product.stock_count + quantity_change)
    product.save(update_fields=['stock_count'])

    movement = StockMovement.objects.create(
        business=business,
        product=product,
        movement_type=movement_type,
        quantity_change=quantity_change,
        resulting_stock=product.stock_count,
        note=note,
    )

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
    call. 'amount' is calculated as product.price x quantity, never taken
    from the request.
    """
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    payment_channel = request.data.get('payment_channel')

    if not product_id or not payment_channel:
        return Response({'error': 'product_id and payment_channel are required'}, status=400)

    try:
        product = Product.objects.get(id=product_id, business=business)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    quantity = int(quantity)
    if quantity > product.stock_count:
        return Response({'error': f'Only {product.stock_count} units in stock'}, status=400)

    sale = SaleRecord.objects.create(
        business=business,
        product=product,
        quantity=quantity,
        payment_channel=payment_channel,
    )

    product.refresh_from_db()

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


@api_view(['GET'])
def order_list(request, business_id):
    """
    Returns all orders for a business, newest first, with their line items
    and computed total.
    """
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    orders = Order.objects.filter(business=business).prefetch_related('items').order_by('-created_at')

    order_data = []
    for o in orders:
        order_data.append({
            'id': o.id,
            'order_number': o.order_number,
            'customer_name': o.customer_name,
            'customer_phone': o.customer_phone,
            'shipping_address': o.shipping_address,
            'items': [
                {'name': item.name, 'qty': item.quantity}
                for item in o.items.all()
            ],
            'total_amount': o.total_amount,
            'payment_method': o.get_payment_method_display(),
            'created_at': o.created_at,
            'source': o.get_source_display(),
            'courier': o.courier,
            'tracking_number': o.tracking_number,
            'status': o.status,
        })

    return Response({'orders': order_data})


@api_view(['PATCH'])
def update_order_status(request, business_id, order_id):
    """
    Updates an order's status. Advancing to 'delivered' triggers
    Order.save() to create SaleRecords for each line item.
    """
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    try:
        order = Order.objects.get(id=order_id, business=business)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

    new_status = request.data.get('status')
    valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
    if new_status not in valid_statuses:
        return Response({'error': f'status must be one of {valid_statuses}'}, status=400)

    order.status = new_status
    order.save()

    return Response({
        'id': order.id,
        'order_number': order.order_number,
        'status': order.status,
    })


# Friendly spreadsheet headers -> actual model field names.
COLUMN_ALIASES = {
    'product name': 'name',
    'selling price (kes)': 'price',
    'cost price (kes)': 'cost_price',
    'stock count': 'stock_count',
    'reorder point': 'reorder_point',
}


@api_view(['POST'])
def import_products(request, business_id):
    """
    Bulk create/update Products from an uploaded spreadsheet (.xlsx or .csv).
    Matches existing products by name (case-insensitive); creates new ones
    if no match is found.
    """
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file uploaded'}, status=400)

    try:
        if file.name.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
    except Exception as e:
        return Response({'error': f'Could not read file: {e}'}, status=400)

    df.columns = [str(c).strip().lower() for c in df.columns]
    df = df.rename(columns=COLUMN_ALIASES)

    required = {'name', 'category', 'price'}
    missing = required - set(df.columns)
    if missing:
        return Response({
            'error': f"Missing columns: {', '.join(missing)}. Download the template and use those exact column names.",
            'found_columns': list(df.columns),
        }, status=400)

    created, updated, errors = 0, 0, []

    for i, row in df.iterrows():
        try:
            name = str(row['name']).strip()

            product, was_created = Product.objects.update_or_create(
                business=business,
                name__iexact=name,
                defaults={
                    'name': name,
                    'category': str(row['category']).strip(),
                    'price': float(row['price']),
                    'cost_price': float(row.get('cost_price', 0) or 0),
                    'stock_count': int(row.get('stock_count', 0) or 0),
                    'reorder_point': int(row.get('reorder_point', 5) or 5),
                },
            )
            created += was_created
            updated += not was_created
        except Exception as e:
            errors.append({'row': int(i) + 2, 'error': str(e)})

    return Response({'created': created, 'updated': updated, 'errors': errors})


@api_view(['GET'])
def import_template(request):
    """
    Generates the blank product import template on the fly and streams it
    straight back.
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Products"

    headers = ["Product Name", "Category", "Selling Price (KES)", "Cost Price (KES)", "Stock Count", "Reorder Point"]
    small_font = Font(size=10)

    ws.append(headers)
    for cell in ws[1]:
        cell.font = small_font

    widths = [24, 16, 18, 16, 14, 14]
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width = w

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return FileResponse(buffer, as_attachment=True, filename='product_import_template.xlsx')


@api_view(['POST'])
def create_order(request, business_id):
    """
    Creates a customer order with real Product-backed line items.
    total_amount is a computed property on Order (sum of line item
    totals) — never assigned or saved directly.
    order_number is left blank here; Order.save() auto-generates it.
    """
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    customer_name = request.data.get('customer_name')
    items = request.data.get('items', [])

    if not customer_name or not items:
        return Response({'error': 'customer_name and items are required'}, status=400)

    order = Order.objects.create(
        business=business,
        customer_name=customer_name,
        customer_phone=request.data.get('customer_phone', ''),
        shipping_address=request.data.get('shipping_address', ''),
        payment_method=request.data.get('payment_method', 'mpesa'),
        source=request.data.get('source', 'website'),
        courier=request.data.get('courier', ''),
        tracking_number=request.data.get('tracking_number', ''),
        status='pending',
    )

    for item in items:
        try:
            product = Product.objects.get(id=item['product_id'], business=business)
        except Product.DoesNotExist:
            continue
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=item.get('quantity', 1),
        )

    return Response({
        'id': order.id,
        'order_number': order.order_number,
        'total_amount': order.total_amount,
    }, status=201)