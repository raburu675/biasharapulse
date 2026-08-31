// lib/pages/stock_movement.dart
//
// Dedicated Stock In / Stock Out logging page. Separate from Point of Sale
// (which logs revenue-generating sales) — this covers everything else that
// changes stock: deliveries, restocks, returns, damage, theft, corrections.
//
// Reads/writes the same Product.stock_count and StockMovement table that
// inventory.dart and pos.dart use, via the stock_movements() Django view —
// so a Stock In logged here is immediately reflected everywhere else that
// reloads (Active Inventory on the dashboard, stock counts on POS, etc).

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'inventory.dart'; // reuses the BiasharaPulse color system — do not redefine colors locally
import '../services/dashboard_service.dart'; // fetchStockMovements / logStockMovement
import '../services/pos_service.dart'; // fetchPerformance — same product data pos.dart uses

enum MovementType { stockIn, stockOut }

class StockMovementPage extends StatefulWidget {
  const StockMovementPage({super.key});

  @override
  State<StockMovementPage> createState() => _StockMovementPageState();
}

class _StockMovementPageState extends State<StockMovementPage> {
  // TODO: replace with the real logged-in business ID once auth is wired up
  final int _businessId = 1;

  // ── Live data state ──────────────────────────────────
  bool _isLoading = true;
  String? _error;
  bool _isSubmitting = false;

  // Products — fetched from the same pos_summary endpoint pos.dart uses,
  // so stock numbers here always match what's shown there.
  List<Map<String, dynamic>> _products = [];

  // Recent movements — fetched from the real StockMovement log
  List<Map<String, dynamic>> _recentMovements = [];

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        ProductService.fetchPerformance(_businessId),
        DashboardService.fetchStockMovements(_businessId),
      ]);

      final productData = results[0];
      final movementData = results[1];

      final products = (productData['products'] as List)
          .map((p) => {
                'id': p['id'],
                'name': p['name'],
                'category': p['category'],
                'stock': p['stock_quantity'],
              })
          .toList()
          .cast<Map<String, dynamic>>();

      final movements = List<Map<String, dynamic>>.from(
        (movementData['movements'] ?? []).map((m) => Map<String, dynamic>.from(m)),
      );

      setState(() {
        _products = products;
        _recentMovements = movements;
        _isLoading = false;

        // If the currently selected product no longer matches fresh data
        // (e.g. its stock just changed), refresh the reference so the
        // "in stock" number shown stays correct.
        if (_selectedProduct != null) {
          final match = _products.where((p) => p['id'] == _selectedProduct!['id']);
          _selectedProduct = match.isNotEmpty ? match.first : null;
        }
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

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

  List<Map<String, dynamic>> get _searchedProducts {
    final query = _searchController.text.toLowerCase();
    if (query.isEmpty) return _products;
    return _products.where((p) => p['name'].toString().toLowerCase().contains(query)).toList();
  }

  // Movement type from the backend is a display label ('Stock In',
  // 'Waste/Damage', 'Low Stock Alert') — map the filter chips to it.
  List<Map<String, dynamic>> get _filteredMovements {
    if (_movementFilter == 'All') return _recentMovements;
    final wanted = _movementFilter == 'Stock In' ? 'Stock In' : 'Waste/Damage';
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
      !_isSubmitting &&
      (_type == MovementType.stockIn || _quantity <= ((_selectedProduct?['stock'] as int?) ?? 0));

  // Submits the movement to Django, then reloads everything so the product
  // list, stock numbers, and movement log all reflect the change together —
  // same "reload after write" pattern used in pos.dart's Sell dialog.
  Future<void> _logMovement() async {
    if (!_canLog) return;

    setState(() => _isSubmitting = true);

    try {
      await DashboardService.logStockMovement(
        businessId: _businessId,
        productId: _selectedProduct!['id'],
        movementType: _type == MovementType.stockIn ? 'stock_in' : 'waste_damage',
        quantityChange: _quantity,
        note: _noteController.text,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _type == MovementType.stockIn
                ? 'Logged +$_quantity ${_selectedProduct!['name']}'
                : 'Logged -$_quantity ${_selectedProduct!['name']}',
          ),
          backgroundColor: _typeColor,
        ),
      );

      // Reset the form
      setState(() {
        _quantity = 1;
        _selectedReason = null;
        _noteController.clear();
        _isSubmitting = false;
      });

      // Reload products + movement log so everything stays in sync
      await _loadAll();
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: kCherryRed,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: kBlackRich,
        body: Center(child: CircularProgressIndicator(color: kElectricCyan)),
      );
    }

    if (_error != null) {
      return Scaffold(
        backgroundColor: kBlackRich,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Text(
              'Could not load stock movement data: $_error',
              style: GoogleFonts.inter(color: kCherryRed, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

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
                    icon: Icons.refresh,
                    onTap: _loadAll,
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
                    TextField(
                      controller: _searchController,
                      onChanged: (_) => setState(() {}),
                      style: GoogleFonts.inter(fontSize: 12, color: kOffWhiteText),
                      decoration: InputDecoration(
                        hintText: 'Search product...',
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
                    ),

                    const SizedBox(height: 12),

                    // Product picker — real products from pos_summary
                    _searchedProducts.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Text(
                              'No products found',
                              style: GoogleFonts.inter(color: kMutedText, fontSize: 11),
                            ),
                          )
                        : SizedBox(
                            height: 34,
                            child: ListView.separated(
                              scrollDirection: Axis.horizontal,
                              itemCount: _searchedProducts.length,
                              separatorBuilder: (_, __) => const SizedBox(width: 8),
                              itemBuilder: (context, index) {
                                final product = _searchedProducts[index];
                                final selected = _selectedProduct?['id'] == product['id'];
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
                        onPressed: _canLog ? _logMovement : null,
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(color: kOffWhiteText, strokeWidth: 2),
                              )
                            : Row(
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

                    // ── Recent Movements — real data ─────────────────
                    _label('Recent Movements'),
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
                  '${product['category']} • ${product['stock']} in stock',
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

  // Movement cards now read the backend's actual response shape:
  // 'type' (display label), 'item', 'qty' (already formatted string),
  // 'time', 'user' — matching stock_movements() in views.py exactly.
  Widget _movementCard(Map<String, dynamic> movement) {
    final String type = movement['type'].toString();
    final bool isStockIn = type == 'Stock In';
    final Color color = type == 'Low Stock Alert'
        ? kNeonAmber
        : (isStockIn ? kGreenAccent : kCherryRed);

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
              type == 'Low Stock Alert'
                  ? Icons.warning_amber_rounded
                  : (isStockIn ? Icons.call_received_rounded : Icons.call_made_rounded),
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
                  movement['item'].toString(),
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
                  '$type • By ${movement['user']}',
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
              movement['qty'].toString(),
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