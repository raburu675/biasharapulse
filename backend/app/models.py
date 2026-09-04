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


class Order(models.Model):
    # Tracks orders through fulfillment (payment -> processing -> shipping
    # -> delivery). Distinct from a POS SaleRecord — this is for orders that
    # need to physically get to a customer, mainly from the website/Instagram.
    #
    # IMPORTANT DESIGN DECISION: an order only affects Product.stock_count,
    # SaleRecord, and Expense once it's marked DELIVERED — not at creation,
    # not while pending/processing/shipped. This is deliberate: if stock/
    # revenue were touched at creation, cancelling an order later would need
    # to "undo" that (give stock back, remove revenue) — the same reversal
    # problem we hit with Product.save()'s auto-Expense logic. Counting only
    # on delivery avoids that entirely: a cancelled order never touched
    # anything else, so there's nothing to reverse.
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    SOURCE_CHOICES = [
        ('website', 'Website'),
        ('instagram', 'Instagram'),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=30)
    shipping_address = models.CharField(max_length=255)
    payment_method = models.CharField(max_length=20, choices=SaleRecord.PAYMENT_CHOICES, default='mpesa')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    courier = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    # Internal guard — prevents creating duplicate SaleRecords if a
    # delivered order gets saved again (e.g. editing customer_phone later).
    delivery_processed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.order_number} - {self.customer_name}"

    def save(self, *args, **kwargs):
        # Auto-generate an order number the first time this is created
        if not self.order_number:
            last = Order.objects.filter(business=self.business).order_by('-id').first()
            next_num = (last.id + 1) if last else 1
            self.order_number = f'ORD-{3000 + next_num}'

        is_new = self._state.adding
        previous_status = None
        if not is_new:
            previous_status = Order.objects.filter(pk=self.pk).values_list('status', flat=True).first()

        super().save(*args, **kwargs)

        # Only fires the FIRST time status becomes 'delivered' — this is
        # where an order becomes real revenue and touches stock, via the
        # same SaleRecord.save() logic every other sale goes through.
        just_delivered = (
            self.status == 'delivered'
            and previous_status != 'delivered'
            and not self.delivery_processed
        )
        if just_delivered:
            for item in self.items.all():
                if item.product is not None:
                    SaleRecord.objects.create(
                        business=self.business,
                        product=item.product,
                        quantity=item.quantity,
                        payment_channel=self.payment_method,
                    )
            self.delivery_processed = True
            super().save(update_fields=['delivery_processed'])

    @property
    def total_amount(self):
        # Computed live from line items — never stored, so it can never
        # drift out of sync with what the items actually add up to.
        return sum((item.line_total for item in self.items.all()), 0)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    # SET_NULL: keep the line item's name/price even if the product is later deleted
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='order_items')
    name = models.CharField(max_length=255)  # denormalized so it survives product deletion
    quantity = models.PositiveIntegerField(default=1)
    price_at_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        # Lock in the product's price at the moment this line item is
        # created, so total_amount stays historically accurate even if the
        # product's price changes later. Same principle as SaleRecord.amount.
        if self._state.adding and self.product is not None and not self.price_at_order:
            self.price_at_order = self.product.price
            if not self.name:
                self.name = self.product.name
        super().save(*args, **kwargs)

    @property
    def line_total(self):
        return self.price_at_order * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.name}"