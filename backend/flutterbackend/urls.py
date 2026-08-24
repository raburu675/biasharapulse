"""
URL configuration for flutterbackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from app.views import dashboard_summary, pos_summary, stock_movements, create_sale

urlpatterns = [
    path('admin/', admin.site.urls),

    # Existing
    path('api/dashboard/<int:business_id>/summary/', dashboard_summary),
    path('pos-summary/<int:business_id>/', pos_summary, name='pos_summary'),

    # NEW — matches dashboard_service.dart's fetchStockMovements()
    # GET  -> read the stock movement log
    # POST -> create a Stock In / Waste-Damage adjustment
    path('api/dashboard/<int:business_id>/stock-movements/', stock_movements, name='stock_movements'),

    # NEW — matches product_service.dart's createSale()
    path('create-sale/<int:business_id>/', create_sale, name='create_sale'),
]