from rest_framework import serializers
from .models import Business, Product, SaleRecord, Expense

class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ['id','name','created_at']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'stock_count', 'reorder_point', 'price', 'created_at']

class SaleRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleRecord
        fields = ['id', 'product', 'amount', 'quantity', 'payment_channel', 'created_at']        

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'category', 'amount', 'note', 'created_at']   

        
