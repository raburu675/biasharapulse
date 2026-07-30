from decimal import Decimal
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Business, Product, SaleRecord, Expense


@api_view(['GET'])
def dashboard_summary(request, business_id):
    # Find the business, or return a 404 if it doesn't exist
    try:
        business = Business.objects.get(id=business_id)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

    # Grab this business's data only
    sales = SaleRecord.objects.filter(business=business)
    expenses = Expense.objects.filter(business=business)
    products = Product.objects.filter(business=business)

    # ── Hero banner numbers ──
    net_revenue = sales.aggregate(total=Sum('amount'))['total'] or Decimal('0')
    total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0')
    net_profit = net_revenue - total_expenses
    net_margin = (net_profit / net_revenue * 100) if net_revenue > 0 else Decimal('0')
    active_inventory = products.aggregate(total=Sum('stock_count'))['total'] or 0

    # ── Payment channel split (as % of total sales amount) ──
    payment_split = []
    if net_revenue > 0:
        # Group sales by payment channel and sum each group
        by_channel = sales.values('payment_channel').annotate(total=Sum('amount'))
        for row in by_channel:
            percent = (row['total'] / net_revenue) * 100
            payment_split.append({
                'channel': row['payment_channel'],
                'percent': round(percent, 1),
            })

    # ── Category volume (as % of total stock) ──
    category_volume = []
    total_stock = active_inventory
    if total_stock > 0:
        # Group products by category and sum stock in each group
        by_category = products.values('category').annotate(total=Sum('stock_count'))
        for row in by_category:
            percent = (row['total'] / total_stock) * 100
            category_volume.append({
                'category': row['category'],
                'percent': round(percent, 1),
            })

    # ── Sales vs expense breakdown, by month ──
    # Groups each sale/expense by the month it happened in, then sums per month
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

    # ── Recent activity (last 5 sales) ──
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

    # Send everything back as one JSON response
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
        'recent_activity': recent_activity,
    })