from datetime import timedelta
from django.utils import timezone
from rest_framework.response import Response

# Single source of truth: what each tier gets.
# None = unlimited. Set monthly_sales_cap to your real free-tier number.
PLANS = {
    'free': {
        'features': {'dashboard',},
        'history_days': 30,
        'max_users': 1,
        'monthly_sales_cap': 100,
    },
    'paid': {
        'features': {
            'dashboard', 'stock_movement', 'pos', 'suppliers',
            'orders', 'receipts', 'ai_insights', 'multi_user',
        },
        'history_days': None,
        'max_users': None,
        'monthly_sales_cap': None,
    },
}


def require_feature(business, feature):
    """Returns a 403 Response if the plan lacks `feature`, else None."""
    if business.has_feature(feature):
        return None
    return Response({
        'error': f"Your plan doesn't include '{feature}'. Upgrade to unlock it.",
        'code': 'upgrade_required',  # frontend checks this to open the upgrade page
        'feature': feature,
    }, status=403)

#Checks oldest date this plan may see, or None for unlimited history
def history_cutoff(business):    
    days = business.plan['history_days']
    return timezone.now() - timedelta(days=days) if days else None

# First moment of the current month in the project's local timezone
def month_start():    
    return timezone.localtime().replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def monthly_sales_used(business):
    return business.sales.filter(created_at__gte=month_start()).count()

#Returns a 403 Response if the monthly sale cap is hit, else None
def sale_cap_response(business):    
    cap = business.plan['monthly_sales_cap']
    if cap and monthly_sales_used(business) >= cap:
        return Response({
            'error': f'Monthly limit of {cap} sales reached. Upgrade to continue.',
            'code': 'limit_reached',
            'limit': cap,
        }, status=403)
    return None