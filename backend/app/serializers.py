from rest_framework import serializers
from .models import Business, Product, SaleRecord, Expense

class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ['id','name','created_at']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'stock_count', 'reorder_point','cost_price', 'price', 'created_at']

class SaleRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleRecord
        fields = ['id', 'product', 'amount', 'quantity', 'payment_channel', 'created_at']        

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'category', 'amount', 'note', 'created_at']   

class StockMovementSerializer(serializers.ModelSerializer):
    # Human-readable label instead of the raw 'stock_in' / 'waste_damage' code
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True, default='Unknown')
    user_name = serializers.CharField(source='user.username', read_only=True, default='System')
 
    class Meta:
        model = StockMovement
        fields = [
            'id', 'business', 'product', 'product_name', 'movement_type',
            'movement_type_display', 'quantity_change', 'resulting_stock',
            'user', 'user_name', 'note', 'created_at',
        ]
 
