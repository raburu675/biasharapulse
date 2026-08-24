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
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """
        THE SINGLE SOURCE OF TRUTH for keeping stock_count and Expenses in
        sync — no matter HOW stock_count gets changed (creating a new
        product, editing one directly in admin, the shell, the app's Stock
        In button, anywhere), this method catches it and logs the cost
        automatically. There is no other place in the codebase that should
        create an "Initial Stock" / stock-increase Expense — it all funnels
        through here now, so it can never be forgotten or done twice.
        """
        is_new = self._state.adding

        # For an EXISTING product, find out what stock_count was right
        # before this save, so we can tell if it went up (and by how much).
        previous_stock = None
        if not is_new:
            previous_stock = Product.objects.filter(pk=self.pk).values_list('stock_count', flat=True).first()

        super().save(*args, **kwargs)

        if is_new:
            # Brand new product, created with starting stock already set.
            if self.stock_count > 0:
                Expense.objects.create(
                    business=self.business,
                    category='Initial Stock',
                    amount=self.cost_price * self.stock_count,
                    note=f'Auto-logged: {self.stock_count} units of {self.name} added at creation.',
                )
        else:
            # Existing product — only react if stock_count actually went UP.
            # (A decrease here isn't a purchase, so it doesn't get an
            # Expense — that's what Waste/Damage or a sale already covers.)
            if previous_stock is not None and self.stock_count > previous_stock:
                increase = self.stock_count - previous_stock
                Expense.objects.create(
                    business=self.business,
                    category='Inventory Purchase',
                    amount=self.cost_price * increase,
                    note=f'Auto-logged: stock_count increased by {increase} units for {self.name} (direct edit).',
                )


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

    def save(self, *args, **kwargs):
        # _state.adding is True only the FIRST time this record is saved
        # (i.e. it's being created, not edited later). We need this check
        # so stock only gets decremented once per sale, not every time
        # someone re-saves the record (e.g. fixing a typo in payment_channel).
        is_new = self._state.adding

        # Always recalculate amount from the product's real selling price x
        # quantity, no matter where this save comes from (create_sale,
        # Django admin, the shell, anywhere). This makes it impossible for
        # amount and quantity to drift apart.
        if self.product is not None:
            self.amount = self.product.price * self.quantity

        super().save(*args, **kwargs)

        # Only decrement stock the first time this sale is ever saved.
        # NOTE: this goes through Product.save() (via .save(update_fields=...)
        # below), but since stock is DECREASING here, Product.save()'s
        # increase-detection logic won't fire an Expense — correct, since
        # a sale isn't a purchase.
        if is_new and self.product is not None:
            self.product.stock_count = max(0, self.product.stock_count - self.quantity)
            self.product.save(update_fields=['stock_count'])


class Expense(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='expenses')
    category = models.CharField(max_length=100)  # e.g. rent, supplies, shipping, Initial Stock, Inventory Purchase
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.amount}"


class StockMovement(models.Model):
    # This is the audit trail behind the "Stock Movement Log" section /
    # filter chips on the inventory dashboard (All Logs, Stock Adjustments,
    # Reorder Alerts). Every stock change should go through this model so
    # the frontend log is always real, not placeholder data.
    #
    # NOTE: Expense creation for stock increases now lives entirely in
    # Product.save() above — this model is purely the audit trail (who,
    # when, why, with a note) and does NOT create Expenses itself. The
    # stock_movements() view still creates these rows for the descriptive
    # log, but Product.save() independently handles the Expense side.
    MOVEMENT_CHOICES = [
        ('stock_in', 'Stock In'),
        ('waste_damage', 'Waste/Damage'),
        ('low_stock_alert', 'Low Stock Alert'),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='stock_movements')
    # SET_NULL: keep the movement history even if the product is later deleted
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='stock_movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_CHOICES)
    quantity_change = models.IntegerField()  # positive for stock in, negative for waste/damage, 0 for alerts
    resulting_stock = models.PositiveIntegerField()  # product.stock_count snapshot at the time of this movement
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='stock_movements')
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.movement_type} - {self.product} ({self.quantity_change})"