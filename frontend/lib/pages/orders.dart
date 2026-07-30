// lib/pages/orders.dart
//
// Tracks orders through fulfillment — payment, processing, shipping,
// delivery. Distinct from Receipts (proof of an already-completed POS sale)
// and Invoices (money owed) — this is specifically about orders that need
// to physically get to a customer, mainly from the website/Instagram.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'inventory.dart'; // reuses the BiasharaPulse color system — do not redefine colors locally

enum OrderStatus { pending, processing, shipped, delivered, cancelled }

class OrderLineItem {
  final String name;
  final int qty;

  OrderLineItem({required this.name, required this.qty});
}

class CustomerOrder {
  final String id;
  final String orderNumber;
  final String customerName;
  final String customerPhone;
  final String shippingAddress;
  final List<OrderLineItem> items;
  final double totalAmount;
  final String paymentMethod;
  final String orderDate;
  final String source; // 'Website' or 'Instagram'
  final String courier;
  final String trackingNumber;
  OrderStatus status;

  CustomerOrder({
    required this.id,
    required this.orderNumber,
    required this.customerName,
    required this.customerPhone,
    required this.shippingAddress,
    required this.items,
    required this.totalAmount,
    required this.paymentMethod,
    required this.orderDate,
    required this.source,
    this.courier = '',
    this.trackingNumber = '',
    this.status = OrderStatus.pending,
  });

  String get statusLabel {
    switch (status) {
      case OrderStatus.pending:
        return 'Pending Payment';
      case OrderStatus.processing:
        return 'Processing';
      case OrderStatus.shipped:
        return 'Shipped';
      case OrderStatus.delivered:
        return 'Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
    }
  }

  Color get statusColor {
    switch (status) {
      case OrderStatus.pending:
        return kAmberWarning;
      case OrderStatus.processing:
        return kAmberGold;
      case OrderStatus.shipped:
        return kBlueAccent;
      case OrderStatus.delivered:
        return kGreenAccent;
      case OrderStatus.cancelled:
        return kCherryRed;
    }
  }

  IconData get sourceIcon => source == 'Website' ? Icons.language : Icons.camera_alt_outlined;
}

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  // TODO: replace with real orders (fetched from the Django backend / Daraja callbacks)
  final List<CustomerOrder> _orders = [
    CustomerOrder(
      id: '1',
      orderNumber: 'ORD-3051',
      customerName: 'Ann Wanjiku',
      customerPhone: '+254 711 223 344',
      shippingAddress: 'Kilimani, Nairobi',
      items: [OrderLineItem(name: 'NY Yankees 59FIFTY Fitted', qty: 1), OrderLineItem(name: 'KC Chiefs Fitted', qty: 1)],
      totalAmount: 9000,
      paymentMethod: 'M-Pesa',
      orderDate: 'Today',
      source: 'Website',
      courier: 'G4S Courier',
      trackingNumber: 'G4S-88213',
      status: OrderStatus.shipped,
    ),
    CustomerOrder(
      id: '2',
      orderNumber: 'ORD-3050',
      customerName: 'Brian Otieno',
      customerPhone: '+254 722 556 677',
      shippingAddress: 'Nakuru Town',
      items: [OrderLineItem(name: 'LA Dodgers 59FIFTY Fitted', qty: 1)],
      totalAmount: 4500,
      paymentMethod: 'M-Pesa',
      orderDate: 'Yesterday',
      source: 'Instagram',
      status: OrderStatus.processing,
    ),
    CustomerOrder(
      id: '3',
      orderNumber: 'ORD-3049',
      customerName: 'Faith Njeri',
      customerPhone: '+254 733 998 877',
      shippingAddress: 'Mombasa Road, Nairobi',
      items: [
        OrderLineItem(name: 'LA Lakers Snapback', qty: 1),
        OrderLineItem(name: 'NY Yankees 59FIFTY Fitted', qty: 2),
      ],
      totalAmount: 13500,
      paymentMethod: 'M-Pesa',
      orderDate: '3 days ago',
      source: 'Website',
      courier: 'Wells Fargo Courier',
      trackingNumber: 'WF-4432',
      status: OrderStatus.delivered,
    ),
    CustomerOrder(
      id: '4',
      orderNumber: 'ORD-3048',
      customerName: 'Kevin Mutua',
      customerPhone: '+254 700 112 233',
      shippingAddress: 'Kisumu',
      items: [OrderLineItem(name: 'Chicago Bulls 59FIFTY Fitted', qty: 1)],
      totalAmount: 4200,
      paymentMethod: 'M-Pesa',
      orderDate: '4 days ago',
      source: 'Website',
      status: OrderStatus.pending,
    ),
    CustomerOrder(
      id: '5',
      orderNumber: 'ORD-3047',
      customerName: 'Grace Achieng',
      customerPhone: '+254 744 556 621',
      shippingAddress: 'Eldoret',
      items: [OrderLineItem(name: 'KC Chiefs Fitted', qty: 1)],
      totalAmount: 3800,
      paymentMethod: 'M-Pesa',
      orderDate: '5 days ago',
      source: 'Instagram',
      status: OrderStatus.cancelled,
    ),
  ];

  String _searchQuery = '';
  String _statusFilter = 'All';

  static const _filterOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  List<CustomerOrder> get _filteredOrders {
    return _orders.where((o) {
      final matchesSearch = o.orderNumber.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          o.customerName.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesStatus = _statusFilter == 'All' || o.statusLabel.startsWith(_statusFilter);
      return matchesSearch && matchesStatus;
    }).toList();
  }

  int get _pendingFulfillment =>
      _orders.where((o) => o.status == OrderStatus.pending || o.status == OrderStatus.processing).length;
  int get _inTransit => _orders.where((o) => o.status == OrderStatus.shipped).length;
  int get _delivered => _orders.where((o) => o.status == OrderStatus.delivered).length;

  void _advanceStatus(CustomerOrder order) {
    if (order.status == OrderStatus.cancelled || order.status == OrderStatus.delivered) return;
    setState(() {
      order.status = OrderStatus.values[order.status.index + 1];
    });
  }

  void _cancelOrder(CustomerOrder order) {
    setState(() => order.status = OrderStatus.cancelled);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlackRich,
      body: SafeArea(
        child: Column(
          children: [
            // ── Top Navigation Bar ─────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _iconButton(icon: Icons.arrow_back, onTap: () => Navigator.pop(context)),
                  Text(
                    'Orders',
                    style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 16, fontWeight: FontWeight.w800),
                  ),
                  _iconButton(icon: Icons.sort, onTap: () {
                    // TODO: sort by date, amount, or status
                  }),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── 2x2 Summary Grid ─────────────────
                    Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _summaryTile('Total Orders', '${_orders.length}', Icons.receipt_long_outlined),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _summaryTile('Pending Fulfillment', '$_pendingFulfillment',
                                  Icons.hourglass_empty_rounded, accent: kAmberWarning),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _summaryTile('In Transit', '$_inTransit', Icons.local_shipping_outlined,
                                  accent: kBlueAccent),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _summaryTile('Delivered', '$_delivered', Icons.check_circle_outline,
                                  accent: kGreenAccent),
                            ),
                          ],
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // ── Search ─────────────────────────
                    TextField(
                      onChanged: (val) => setState(() => _searchQuery = val),
                      style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 12),
                      decoration: InputDecoration(
                        hintText: 'Search by order no. or customer...',
                        hintStyle: GoogleFonts.inter(color: kMutedText, fontSize: 12),
                        prefixIcon: const Icon(Icons.search, color: kMutedText, size: 18),
                        filled: true,
                        fillColor: kCardSurface,
                        contentPadding: const EdgeInsets.symmetric(vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBorderSubtle)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBorderSubtle)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kOffWhiteText, width: 1.2)),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // ── Status Filter Chips ─────────────────────
                    SizedBox(
                      height: 34,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _filterOptions.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final filter = _filterOptions[index];
                          final selected = _statusFilter == filter;
                          return GestureDetector(
                            onTap: () => setState(() => _statusFilter = filter),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                              decoration: BoxDecoration(
                                color: selected ? kCherryRed : kCardSurface,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: selected ? kCherryRed : kBorderSubtle),
                              ),
                              child: Text(
                                filter,
                                style: GoogleFonts.inter(
                                  color: selected ? kOffWhiteText : kMutedText,
                                  fontSize: 10.5,
                                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 14),

                    // ── Order List ─────────────────────
                    _filteredOrders.isEmpty
                        ? _emptyState()
                        : Column(
                            children: _filteredOrders
                                .map((o) => Padding(
                                      padding: const EdgeInsets.only(bottom: 10),
                                      child: _orderCard(o),
                                    ))
                                .toList(),
                          ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  Widget _iconButton({required IconData icon, required VoidCallback onTap}) {
    return Container(
      decoration: BoxDecoration(
        color: kCardSurface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: kBorderSubtle),
      ),
      child: IconButton(
        icon: Icon(icon, color: kOffWhiteText, size: 20),
        onPressed: onTap,
        constraints: const BoxConstraints(minWidth: 38, minHeight: 38),
        padding: EdgeInsets.zero,
      ),
    );
  }

  Widget _summaryTile(String label, String value, IconData icon, {Color? accent}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: kCardSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorderSubtle),
      ),
      child: Row(
        children: [
          Icon(icon, color: accent ?? kOffWhiteText, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(color: accent ?? kOffWhiteText, fontSize: 13, fontWeight: FontWeight.w800),
                ),
                Text(label, style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Center(
        child: Text('No orders match this filter', style: GoogleFonts.inter(color: kMutedText, fontSize: 12)),
      ),
    );
  }

  Widget _orderCard(CustomerOrder order) {
    return GestureDetector(
      onTap: () => _showOrderDetail(order),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: kCardSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kBorderSubtle),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            '#${order.orderNumber}',
                            style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 13, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(width: 6),
                          Icon(order.sourceIcon, color: kMutedText, size: 12),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${order.customerName} • ${order.items.length} item${order.items.length > 1 ? 's' : ''} • ${order.orderDate}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'KES ${order.totalAmount.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 12.5, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: order.statusColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        order.statusLabel,
                        style: GoogleFonts.inter(color: order.statusColor, fontSize: 8.5, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showOrderDetail(CustomerOrder order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: kCardSurface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '#${order.orderNumber}',
                          style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 16, fontWeight: FontWeight.w800),
                        ),
                        Row(
                          children: [
                            Icon(order.sourceIcon, color: kMutedText, size: 14),
                            const SizedBox(width: 4),
                            Text(order.source, style: GoogleFonts.inter(color: kMutedText, fontSize: 10.5)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(order.orderDate, style: GoogleFonts.inter(color: kMutedText, fontSize: 11)),
                    const SizedBox(height: 18),

                    if (order.status == OrderStatus.cancelled)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: kCherryRed.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: kCherryRed.withOpacity(0.4)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.cancel_outlined, color: kCherryRed, size: 18),
                            const SizedBox(width: 8),
                            Text(
                              'This order was cancelled',
                              style: GoogleFonts.inter(color: kCherryRed, fontSize: 12, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                      )
                    else
                      _orderTimeline(order),

                    const SizedBox(height: 20),
                    _detailRow(Icons.person_outline, order.customerName),
                    _detailRow(Icons.call_outlined, order.customerPhone),
                    _detailRow(Icons.location_on_outlined, order.shippingAddress),
                    if (order.trackingNumber.isNotEmpty)
                      _detailRow(Icons.local_shipping_outlined, '${order.courier} • ${order.trackingNumber}'),
                    _detailRow(Icons.payments_outlined, order.paymentMethod),

                    const SizedBox(height: 14),
                    const Divider(height: 1, color: kBorderSubtle),
                    const SizedBox(height: 14),

                    ...order.items.map((item) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  item.name,
                                  style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 12),
                                ),
                              ),
                              Text(
                                'x${item.qty}',
                                style: GoogleFonts.inter(color: kMutedText, fontSize: 11, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        )),
                    const SizedBox(height: 6),
                    const Divider(height: 1, color: kBorderSubtle),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Total', style: GoogleFonts.inter(color: kMutedText, fontSize: 12.5)),
                        Text(
                          'KES ${order.totalAmount.toStringAsFixed(0)}',
                          style: GoogleFonts.inter(color: kForestGreen, fontSize: 15, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),
                    if (order.status != OrderStatus.delivered && order.status != OrderStatus.cancelled)
                      Row(
                        children: [
                          Expanded(
                            child: SizedBox(
                              height: 46,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: kCherryRed,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  elevation: 0,
                                ),
                                onPressed: () {
                                  _advanceStatus(order);
                                  setModalState(() {});
                                },
                                child: Text(
                                  order.status == OrderStatus.pending
                                      ? 'Mark as Processing'
                                      : order.status == OrderStatus.processing
                                          ? 'Mark as Shipped'
                                          : 'Mark as Delivered',
                                  style: GoogleFonts.inter(color: kOffWhiteText, fontWeight: FontWeight.w800, fontSize: 12.5),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          GestureDetector(
                            onTap: () {
                              _cancelOrder(order);
                              setModalState(() {});
                            },
                            child: Container(
                              height: 46,
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(
                                color: kBlackBase,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: kBorderSubtle),
                              ),
                              child: Center(
                                child: Text(
                                  'Cancel',
                                  style: GoogleFonts.inter(color: kCherryRed, fontSize: 12, fontWeight: FontWeight.w700),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _detailRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, color: kMutedText, size: 16),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text, style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 12.5)),
          ),
        ],
      ),
    );
  }

  Widget _orderTimeline(CustomerOrder order) {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    final currentIndex = order.status.index; // pending=0 ... delivered=3

    return Row(
      children: List.generate(steps.length * 2 - 1, (i) {
        if (i.isOdd) {
          final leftStepIndex = i ~/ 2;
          final completed = leftStepIndex < currentIndex;
          return Expanded(
            child: Container(height: 2, color: completed ? kGreenAccent : kBorderSubtle),
          );
        } else {
          final stepIndex = i ~/ 2;
          final completed = stepIndex <= currentIndex;
          return Column(
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: completed ? kGreenAccent : kBorderSubtle,
                ),
                child: completed
                    ? const Icon(Icons.check, size: 13, color: kOffWhiteText)
                    : null,
              ),
              const SizedBox(height: 4),
              Text(
                steps[stepIndex],
                style: GoogleFonts.inter(
                  color: completed ? kOffWhiteText : kMutedText,
                  fontSize: 8,
                  fontWeight: completed ? FontWeight.w700 : FontWeight.w500,
                ),
              ),
            ],
          );
        }
      }),
    );
  }
}