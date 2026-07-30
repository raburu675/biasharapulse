from django.db import models
from django.contrib.auth.models import User


class Business(models.Model):
    # Which user owns this business
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='businesses')
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    # Which business this product belongs to
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)  # e.g. MLB, NBA, NFL
    stock_count = models.PositiveIntegerField(default=0)
    reorder_point = models.PositiveIntegerField(default=5)  # alert when stock drops to this
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class SaleRecord(models.Model):
    # Allowed values for payment_channel
    PAYMENT_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('cash', 'Cash'),
        ('card', 'Card'),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='sales')
    # SET_NULL: if the product gets deleted, keep this sale record but blank out the product
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='sales')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    payment_channel = models.CharField(max_length=10, choices=PAYMENT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product} - {self.amount}"


class Expense(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='expenses')
    category = models.CharField(max_length=100)  # e.g. rent, supplies, shipping
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.amount}"