from datetime import timedelta
from django.utils import timezone
from rest_framework.response import Response

# What each plan includes. Feature names must match the `feature` names used
# in the sidebar and in the views. None = unlimited.
LITE_FEATURES = {'dashboard', 'pos', 'orders'}
GROWTH_FEATURES = LITE_FEATURES | {'stock_movement', 'product_performance', 'qr_scanning', 'email_reports'}
PRO_FEATURES = GROWTH_FEATURES | {'staff_accounts'}

PLANS = {
    # KES 0: one-time, first 100 sales only (POS sales + delivered orders), 30-day history
    'starter': {
        'features': LITE_FEATURES,
        'history_days': 30,
        'max_users': 1,
        'max_branches': 1,
        'total_sales_cap': 100,  # lifetime total, not monthly
    },
    # KES 1,299 / month
    'lite': {
        'features': LITE_FEATURES,
        'history_days': None,
        'max_users': 1,
        'max_branches': 1,
        'total_sales_cap': None,
    },
    # KES 2,500 / month: adds stock movement, product performance, QR scanning, email reports
    'growth': {
        'features': GROWTH_FEATURES,
        'history_days': None,
        'max_users': 1,
        'max_branches': 1,
        'total_sales_cap': None,
    },
    # KES 4,999 / month: adds staff accounts and up to 3 branches
    'pro': {
        'features': PRO_FEATURES,
        'history_days': None,
        'max_users': None,  # set a number here if staff accounts should be limited
        'max_branches': 3,
        'total_sales_cap': None,
    },
    # KES 7,999 / month: up to 5 branches
    'multi_branch': {
        'features': PRO_FEATURES,
        'history_days': None,
        'max_users': None,
        'max_branches': 5,
        'total_sales_cap': None,
    },
}


# Feature gate. Called at the top of a view with a feature name, e.g. 'orders'.
# If the business's plan includes it, returns None and the view carries on.
# If not, returns a 403 error response (code 'upgrade_required') for the view to send back.
def require_feature(business, feature):
    """Returns a 403 Response if the plan lacks `feature`, else None."""
    if business.has_feature(feature):
        return None
    return Response({
        'error': f"Your plan doesn't include '{feature}'. Upgrade to unlock it.",
        'code': 'upgrade_required',  # frontend checks this to show the upgrade prompt
        'feature': feature,
    }, status=403)


# History limit. Returns the oldest date this plan may see (30 days ago on Starter),
# or None when the plan has unlimited history. Views use it to filter out older records.
def history_cutoff(business):
    """Oldest date this plan may see, or None for unlimited history."""
    days = business.plan['history_days']
    return timezone.now() - timedelta(days=days) if days else None


# Counts every sale this business has ever recorded: POS sales, plus the sales
# created when an order is marked delivered. Pending or cancelled orders don't count.
def sales_used(business):
    return business.sales.count()


# Sales allowance check. Called before a sale is recorded (POS) or an order is delivered.
# If the plan has a cap (Starter: 100) and the business has reached it, returns a 403
def sale_cap_response(business):
    cap = business.plan['total_sales_cap']
    if cap and sales_used(business) >= cap:
        return Response({
            'error': f"You've used all {cap} sales included in Starter. Upgrade to Biashara Lite or above to keep recording sales.",
            'code': 'limit_reached',
            'limit': cap,
        }, status=403)
    return None