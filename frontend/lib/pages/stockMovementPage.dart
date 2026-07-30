// lib/pages/stock_movement.dart
//
// Dedicated Stock In / Stock Out logging page. Separate from Point of Sale
// (which logs revenue-generating sales) — this covers everything else that
// changes stock: deliveries, restocks, returns, damage, theft, corrections.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'inventory.dart'; // reuses the BiasharaPulse color system — do not redefine colors locally

enum MovementType { stockIn, stockOut }

class StockMovementPage extends StatefulWidget {
  const StockMovementPage({super.key});

  @override
  State<StockMovementPage> createState() => _StockMovementPageState();
}

class _StockMovementPageState extends State<StockMovementPage> {
  // TODO: replace with the real product catalog (fetched or shared with Inventory)
  final List<Map<String, dynamic>> _products = [
    {'sku': 'SKU-CAP-001', 'name': 'NY Yankees 59FIFTY Fitted', 'category': 'MLB', 'stock': 18},
    {'sku': 'SKU-CAP-002', 'name': 'LA Dodgers 59FIFTY Fitted', 'category': 'MLB', 'stock': 12},
    {'sku': 'SKU-CAP-003', 'name': 'Chicago Bulls 59FIFTY Fitted', 'category': 'NBA', 'stock': 0},
    {'sku': 'SKU-CAP-004', 'name': 'LA Lakers Snapback', 'category': 'NBA', 'stock': 22},
    {'sku': 'SKU-CAP-005', 'name': 'KC Chiefs Fitted', 'category': 'NFL', 'stock': 14},
  ];

  // TODO: replace with real movement history (fetched from backend)
  final List<Map<String, dynamic>> _recentMovements = [
    {
      'type': MovementType.stockIn,
      'item': 'NY Yankees 59FIFTY Fitted',
      'reason': 'New Delivery',
      'qty': 20,
      'time': 'Today, 09:30 AM',
      'user': 'Admin',
    },
    {
      'type': MovementType.stockOut,
      'item': 'Chicago Bulls 59FIFTY Fitted',
      'reason': 'Damage/Waste',
      'qty': 2,
      'time': 'Yesterday, 04:15 PM',
      'user': 'John',
    },
    {
      'type': MovementType.stockIn,
      'item': 'KC Chiefs Fitted',
      'reason': 'Customer Return',
      'qty': 1,
      'time': 'Yesterday, 11:02 AM',
      'user': 'Admin',
    },
  ];

  MovementType _type = MovementType.stockIn;
  Map<String, dynamic>? _selectedProduct;
  int _quantity = 1;
  String? _selectedReason;
  String _movementFilter = 'All'; // All, Stock In, Stock Out

  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _noteController = TextEditingController();

  List<String> get _reasons => _type == MovementType.stockIn
      ? const ['Restock from Supplier', 'Customer Return', 'Stock Correction']
      : const ['Damage/Waste', 'Theft/Loss', 'Internal Use', 'Return to Supplier', 'Stock Correction'];

  Color get _typeColor => _type == MovementType.stockIn ? kGreenAccent : kCherryRed;

  List<Map<String, dynamic>> get _filteredMovements {
    if (_movementFilter == 'All') return _recentMovements;
    final wanted = _movementFilter == 'Stock In' ? MovementType.stockIn : MovementType.stockOut;
    return _recentMovements.where((m) => m['type'] == wanted).toList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  void _selectType(MovementType type) {
    setState(() {
      _type = type;
      _selectedReason = null;
      _quantity = 1;
    });
  }

  void _incrementQty() {
    setState(() {
      if (_type == MovementType.stockOut) {
        final stock = (_selectedProduct?['stock'] as int?) ?? 0;
        if (_quantity < stock) _quantity++;
      } else {
        _quantity++;
      }
    });
  }

  void _decrementQty() {
    setState(() {
      if (_quantity > 1) _quantity--;
    });
  }

  bool get _canLog =>
      _selectedProduct != null &&
      _selectedReason != null &&
      (_type == MovementType.stockIn || _quantity <= ((_selectedProduct?['stock'] as int?) ?? 0));

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
                  _iconButton(
                    icon: Icons.arrow_back,
                    onTap: () => Navigator.pop(context),
                  ),
                  Text(
                    'Stock Movement',
                    style: GoogleFonts.inter(
                      color: kOffWhiteText,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  _iconButton(
                    icon: Icons.history,
                    onTap: () {
                      // TODO: navigate to a full movement history/audit log
                    },
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Stock In / Stock Out Toggle ─────────────────
                    Container(
                      padding: const EdgeInsets.all(5),
                      decoration: BoxDecoration(
                        color: kCardSurface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: kBorderSubtle),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: _typeToggleButton(
                              type: MovementType.stockIn,
                              label: 'Stock In',
                              icon: Icons.call_received_rounded,
                            ),
                          ),
                          const SizedBox(width: 5),
                          Expanded(
                            child: _typeToggleButton(
                              type: MovementType.stockOut,
                              label: 'Stock Out',
                              icon: Icons.call_made_rounded,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // ── Product ─────────────────────────────────
                    _label('Product'),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            style: GoogleFonts.inter(fontSize: 12, color: kOffWhiteText),
                            decoration: InputDecoration(
                              hintText: 'Search SKU, product, or shelf...',
                              hintStyle: GoogleFonts.inter(color: kMutedText, fontSize: 12),
                              prefixIcon: const Icon(Icons.search, size: 18, color: kMutedText),
                              filled: true,
                              fillColor: kCardSurface,
                              contentPadding: const EdgeInsets.symmetric(vertical: 12),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: kBorderSubtle),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: kBorderSubtle),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: kOffWhiteText, width: 1.2),
                              ),
                            ),
                            // TODO: wire up live product search against _products
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          decoration: BoxDecoration(
                            color: kCardSurface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: kBorderSubtle),
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.qr_code_scanner, color: kOffWhiteText, size: 20),
                            onPressed: () {
                              // TODO: wire up barcode/QR scanner logic — should call _selectedProduct = result
                            },
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
                            constraints: const BoxConstraints(),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // Quick product picks — TODO: replace with live search results
                    SizedBox(
                      height: 34,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _products.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final product = _products[index];
                          final selected = _selectedProduct?['sku'] == product['sku'];
                          return GestureDetector(
                            onTap: () => setState(() {
                              _selectedProduct = product;
                              _quantity = 1;
                            }),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                              decoration: BoxDecoration(
                                color: selected ? _typeColor.withOpacity(0.15) : kCardSurface,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: selected ? _typeColor : kBorderSubtle,
                                  width: selected ? 1.3 : 1,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  product['name'],
                                  style: GoogleFonts.inter(
                                    color: selected ? kOffWhiteText : kMutedText,
                                    fontSize: 10.5,
                                    fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 14),

                    if (_selectedProduct != null) _selectedProductCard(),

                    const SizedBox(height: 24),

                    // ── Quantity ─────────────────────────────────
                    _label('Quantity'),
                    const SizedBox(height: 10),
                    _quantityStepper(),
                    if (_type == MovementType.stockOut && _selectedProduct != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text(
                          '${_selectedProduct!['stock']} currently in stock',
                          style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5),
                        ),
                      ),

                    const SizedBox(height: 24),

                    // ── Reason ─────────────────────────────────
                    _label(_type == MovementType.stockIn ? 'Reason for stock in' : 'Reason for stock out'),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _reasons.map((reason) {
                        final selected = _selectedReason == reason;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedReason = reason),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                            decoration: BoxDecoration(
                              color: selected ? _typeColor.withOpacity(0.15) : kCardSurface,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: selected ? _typeColor : kBorderSubtle,
                                width: selected ? 1.3 : 1,
                              ),
                            ),
                            child: Text(
                              reason,
                              style: GoogleFonts.inter(
                                color: selected ? kOffWhiteText : kMutedText,
                                fontSize: 10.5,
                                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 24),

                    // ── Note ─────────────────────────────────
                    _label('Note (optional)'),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _noteController,
                      maxLines: 3,
                      style: GoogleFonts.inter(fontSize: 12, color: kOffWhiteText),
                      decoration: InputDecoration(
                        hintText: _type == MovementType.stockIn
                            ? 'e.g. Delivered by New Era distributor, invoice #1042'
                            : 'e.g. Water damage from storage leak',
                        hintStyle: GoogleFonts.inter(color: kMutedText, fontSize: 12),
                        filled: true,
                        fillColor: kCardSurface,
                        contentPadding: const EdgeInsets.all(12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: kBorderSubtle),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: kBorderSubtle),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: kOffWhiteText, width: 1.2),
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ── Log Movement Button ─────────────────────────
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _canLog ? _typeColor : kBorderSubtle,
                          foregroundColor: kOffWhiteText,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                        onPressed: _canLog
                            ? () {
                                // TODO: persist the movement, adjust stockQuantity
                                // on the selected product, and prepend an entry
                                // to _recentMovements / the backend log.
                              }
                            : null,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _type == MovementType.stockIn
                                  ? Icons.call_received_rounded
                                  : Icons.call_made_rounded,
                              size: 18,
                              color: kOffWhiteText,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _type == MovementType.stockIn ? 'Log Stock In' : 'Log Stock Out',
                              style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),

                    // ── Recent Movements ─────────────────────────
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _label('Recent Movements'),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: ['All', 'Stock In', 'Stock Out'].map((filter) {
                        final selected = _movementFilter == filter;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () => setState(() => _movementFilter = filter),
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
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),
                    if (_filteredMovements.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 24),
                        child: Center(
                          child: Text(
                            'No movements yet',
                            style: GoogleFonts.inter(color: kMutedText, fontSize: 12),
                          ),
                        ),
                      )
                    else
                      Column(
                        children: _filteredMovements
                            .map((movement) => Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: _movementCard(movement),
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

  // ── Helper UI Components ──────────────────────────────────────────────

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

  Widget _label(String text) {
    return Text(
      text,
      style: GoogleFonts.inter(
        color: kOffWhiteText,
        fontSize: 13,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  Widget _typeToggleButton({
    required MovementType type,
    required String label,
    required IconData icon,
  }) {
    final bool selected = _type == type;
    final Color color = type == MovementType.stockIn ? kGreenAccent : kCherryRed;
    return GestureDetector(
      onTap: () => _selectType(type),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: selected ? color.withOpacity(0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: selected ? color : Colors.transparent),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: selected ? color : kMutedText, size: 16),
            const SizedBox(width: 6),
            Text(
              label,
              style: GoogleFonts.inter(
                color: selected ? kOffWhiteText : kMutedText,
                fontSize: 12,
                fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _selectedProductCard() {
    final product = _selectedProduct!;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorderSubtle),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: kBlackBase,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kBorderSubtle),
            ),
            child: const Icon(Icons.inventory_2_outlined, color: kOffWhiteText, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product['name'],
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    color: kOffWhiteText,
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${product['sku']} • ${product['category']} • ${product['stock']} in stock',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _quantityStepper() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: kCardSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorderSubtle),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _stepperButton(icon: Icons.remove, onTap: _decrementQty),
          Text(
            '$_quantity',
            style: GoogleFonts.inter(
              color: kOffWhiteText,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          _stepperButton(icon: Icons.add, onTap: _incrementQty),
        ],
      ),
    );
  }

  Widget _stepperButton({required IconData icon, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: kBlackBase,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: kBorderSubtle),
        ),
        child: Icon(icon, color: kOffWhiteText, size: 18),
      ),
    );
  }

  Widget _movementCard(Map<String, dynamic> movement) {
    final MovementType type = movement['type'] as MovementType;
    final Color color = type == MovementType.stockIn ? kGreenAccent : kCherryRed;
    final String qtyLabel =
        '${type == MovementType.stockIn ? '+' : '-'}${movement['qty']} units';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: kCardSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorderSubtle),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(
              type == MovementType.stockIn
                  ? Icons.call_received_rounded
                  : Icons.call_made_rounded,
              color: color,
              size: 16,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  movement['item'],
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    color: kOffWhiteText,
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${movement['reason']} • By ${movement['user']} • ${movement['time']}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              qtyLabel,
              style: GoogleFonts.inter(
                color: color,
                fontSize: 10.5,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}