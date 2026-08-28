from django.contrib import admin
from .models import Business, Product, SaleRecord, Expense, StockMovement, Order, OrderItem

admin.site.register(Business)
admin.site.register(Product)
admin.site.register(SaleRecord)
admin.site.register(Expense)
admin.site.register(StockMovement)
admin.site.register(Order)
admin.site.register(OrderItem)