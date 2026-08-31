// lib/pages/pos.dart
//
// Product Performance & Analytics — per-product cost, price, stock, units
// sold, and profit margin. All the math (margin, sell-through, profit) is
// computed by Django, not Dart — this page just displays it, plus lets you
// record a sale directly from a product card.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'inventory.dart'; // reuses the BiasharaPulse color system
import '../services/pos_service.dart'; // fetches data from + posts sales to Django

enum SortOption { margin, unitsSold, stock, sellThrough, revenue }

// A plain data holder now — no computed getters. Every value here is set
// directly from the JSON Django sends back, not calculated in Dart.
class PosItem {
  final int id;
  final String name;
  final String category;
  final double costPrice;
  final double sellingPrice;
  final int stockQuantity;
  final int unitsSold;
  final double totalRevenue;
  final double totalCost;
  final double grossProfit;
  final double profitMargin;
  final double sellThroughRate;
  final String performanceTier;
  final String stockStatus;

  PosItem({
    required this.id,
    required this.name,
    required this.category,
    required this.costPrice,
    required this.sellingPrice,
    required this.stockQuantity,
    required this.unitsSold,
    required this.totalRevenue,
    required this.totalCost,
    required this.grossProfit,
    required this.profitMargin,
    required this.sellThroughRate,
    required this.performanceTier,
    required this.stockStatus,
  });

  // Builds a PosItem straight from one product's JSON object.
  // This is the one place that connects Django's field names (snake_case)
  // to Dart's field names (camelCase).
  factory PosItem.fromJson(Map<String, dynamic> json) {
    return PosItem(
      id: json['id'],
      name: json['name'],
      category: json['category'],
      costPrice: double.parse(json['cost_price'].toString()),
      sellingPrice: double.parse(json['selling_price'].toString()),
      stockQuantity: json['stock_quantity'],
      unitsSold: json['units_sold'],
      totalRevenue: double.parse(json['total_revenue'].toString()),
      totalCost: double.parse(json['total_cost'].toString()),
      grossProfit: double.parse(json['gross_profit'].toString()),
      profitMargin: double.parse(json['profit_margin'].toString()),
      sellThroughRate: double.parse(json['sell_through_rate'].toString()),
      performanceTier: json['performance_tier'],
      stockStatus: json['stock_status'],
    );
  }

  // Colors are presentation-only, so they still live here in Dart —
  // Django sends the TEXT ('Star Performer', 'Low Stock'), Dart just
  // decides what color that text should show as.
  Color get performanceTierColor {
    switch (performanceTier) {
      case 'Star Performer':
        return kGreenAccent;
      case 'Steady':
        return kBlueAccent;
      default:
        return kAmberWarning;
    }
  }

  Color get stockStatusColor {
    switch (stockStatus) {
      case 'Out of Stock':
        return kCherryRed;
      case 'Low Stock':
        return kAmberWarning;
      default:
        return kGreenAccent;
    }
  }
}

class Pos extends StatefulWidget {
  const Pos({super.key});

  @override
  State<Pos> createState() => _PosState();
}

class _PosState extends State<Pos> {
  // ── Live data state ──────────────────────────────────
  bool _isLoading = true;
  String? _error;

  List<PosItem> _inventory = []; // starts empty, filled after the fetch

  // Summary metrics — plain fields set from the API, not computed here
  double _totalInventoryValue = 0;
  double _totalRevenue = 0;
  double _totalProfit = 0;
  double _averageSellThrough = 0;

  // Spotlight leaders — nullable, since there may be no products yet
  PosItem? _topSeller;
  PosItem? _mostProfitable;
  PosItem? _bestMargin;

  // TODO: replace with the real logged-in business ID once auth is wired up
  final int _businessId = 1;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      final data = await ProductService.fetchPerformance(_businessId);

      final products = (data['products'] as List)
          .map((item) => PosItem.fromJson(item))
          .toList();

      setState(() {
        _inventory = products;
        _totalInventoryValue = double.parse(data['total_inventory_value'].toString());
        _totalRevenue = double.parse(data['total_revenue'].toString());
        _totalProfit = double.parse(data['total_profit'].toString());
        _averageSellThrough = double.parse(data['avg_sell_through'].toString());

        _topSeller = data['top_seller'] != null ? PosItem.fromJson(data['top_seller']) : null;
        _mostProfitable = data['most_profitable'] != null ? PosItem.fromJson(data['most_profitable']) : null;
        _bestMargin = data['best_margin'] != null ? PosItem.fromJson(data['best_margin']) : null;

        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  // NEW: records a sale via create_sale, then reloads the whole product
  // list so stock/revenue/profit everywhere reflect the sale immediately.
  Future<void> _recordSale({
    required PosItem item,
    required int quantity,
    required String paymentChannel,
  }) async {
    try {
      await ProductService.createSale(
        businessId: _businessId,
        productId: item.id,
        quantity: quantity,
        paymentChannel: paymentChannel,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Sold $quantity x ${item.name}'),
          backgroundColor: kGreenAccent,
        ),
      );

      // Reload so stock/revenue/profit/sell-through all update on screen
      await _loadProducts();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: kCherryRed,
        ),
      );
    }
  }

  // Opens a small dialog to pick quantity + payment channel before
  // actually calling _recordSale. Keeps the card itself uncluttered.
  void _showSellDialog(PosItem item) {
    int quantity = 1;
    String paymentChannel = 'mpesa';

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            return AlertDialog(
              backgroundColor: kCardSurface,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Text(
                'Record Sale ${item.name}',
                style: GoogleFonts.inter(color: kOffWhiteText, fontWeight: FontWeight.w800, fontSize: 15),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${item.stockQuantity} units in stock',
                    style: GoogleFonts.inter(color: kMutedText, fontSize: 11),
                  ),
                  const SizedBox(height: 14),

                  // ── Quantity stepper ──
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Quantity', style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 13)),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline, color: kMutedText),
                            onPressed: () {
                              if (quantity > 1) setDialogState(() => quantity--);
                            },
                          ),
                          Text(
                            '$quantity',
                            style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 15, fontWeight: FontWeight.w700),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline, color: kMutedText),
                            onPressed: () {
                              if (quantity < item.stockQuantity) setDialogState(() => quantity++);
                            },
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // ── Payment channel selector ──
                  Text('Payment Channel', style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 13)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: [
                      _paymentChip('mpesa', 'M-Pesa', paymentChannel, (val) => setDialogState(() => paymentChannel = val)),
                      _paymentChip('cash', 'Cash', paymentChannel, (val) => setDialogState(() => paymentChannel = val)),
                      _paymentChip('card', 'Card', paymentChannel, (val) => setDialogState(() => paymentChannel = val)),
                    ],
                  ),

                  const SizedBox(height: 14),
                  Text(
                    'Total: KES ${(item.sellingPrice * quantity).toStringAsFixed(0)}',
                    style: GoogleFonts.inter(color: kForestGreen, fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: Text('Cancel', style: GoogleFonts.inter(color: kMutedText)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kCherryRed,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: item.stockQuantity == 0
                      ? null
                      : () {
                          Navigator.pop(ctx);
                          _recordSale(item: item, quantity: quantity, paymentChannel: paymentChannel);
                        },
                  child: Text(
                    'Confirm Sale',
                    style: GoogleFonts.inter(color: kOffWhiteText, fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _paymentChip(String value, String label, String selected, ValueChanged<String> onSelect) {
    final isSelected = selected == value;
    return ChoiceChip(
      label: Text(label, style: GoogleFonts.inter(fontSize: 11, color: isSelected ? kOffWhiteText : kMutedText)),
      selected: isSelected,
      selectedColor: kElectricCyan,
      backgroundColor: kBlackBase,
      side: const BorderSide(color: kBorderSubtle),
      onSelected: (_) => onSelect(value),
    );
  }
  // ──────────────────────────────────────────────────────

  String _selectedCategory = 'All';
  String _searchQuery = '';
  SortOption _currentSort = SortOption.unitsSold;

  // Controllers for Add Product Modal
  final _nameController = TextEditingController();
  final _categoryController = TextEditingController();
  final _costController = TextEditingController();
  final _priceController = TextEditingController();
  final _stockController = TextEditingController();

  List<String> get _categories {
    final cats = _inventory.map((e) => e.category).toSet().toList();
    return ['All', ...cats];
  }

  List<PosItem> get _filteredInventory {
    final list = _inventory.where((item) {
      final matchesCategory =
          _selectedCategory == 'All' || item.category == _selectedCategory;
      final matchesSearch =
          item.name.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    switch (_currentSort) {
      case SortOption.margin:
        list.sort((a, b) => b.profitMargin.compareTo(a.profitMargin));
        break;
      case SortOption.unitsSold:
        list.sort((a, b) => b.unitsSold.compareTo(a.unitsSold));
        break;
      case SortOption.stock:
        list.sort((a, b) => a.stockQuantity.compareTo(b.stockQuantity));
        break;
      case SortOption.sellThrough:
        list.sort((a, b) => b.sellThroughRate.compareTo(a.sellThroughRate));
        break;
      case SortOption.revenue:
        list.sort((a, b) => b.totalRevenue.compareTo(a.totalRevenue));
        break;
    }

    return list;
  }

  // NOTE: this still only adds the product to the local list on screen —
  // it doesn't save it to Django yet. That needs a POST endpoint, which
  // we haven't built. Good next step, just not part of this pass.
  void _addProduct() {
    if (_nameController.text.isEmpty ||
        _costController.text.isEmpty ||
        _priceController.text.isEmpty ||
        _stockController.text.isEmpty) {
      return;
    }

    setState(() {
      _inventory.add(
        PosItem(
          id: DateTime.now().millisecondsSinceEpoch,
          name: _nameController.text,
          category: _categoryController.text.isEmpty ? 'General' : _categoryController.text,
          costPrice: double.tryParse(_costController.text) ?? 0.0,
          sellingPrice: double.tryParse(_priceController.text) ?? 0.0,
          stockQuantity: int.tryParse(_stockController.text) ?? 0,
          unitsSold: 0,
          totalRevenue: 0,
          totalCost: 0,
          grossProfit: 0,
          profitMargin: 0,
          sellThroughRate: 0,
          performanceTier: 'Slow Mover',
          stockStatus: 'In Stock',
        ),
      );
    });

    _nameController.clear();
    _categoryController.clear();
    _costController.clear();
    _priceController.clear();
    _stockController.clear();

    Navigator.pop(context);
  }

  void _showSortMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: kCardSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sort Products By',
              style: GoogleFonts.inter(
                color: kOffWhiteText,
                fontSize: 15,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 12),
            _sortTile('Highest Units Sold', SortOption.unitsSold),
            _sortTile('Highest Sell-Through Rate', SortOption.sellThrough),
            _sortTile('Highest Profit Margin', SortOption.margin),
            _sortTile('Highest Revenue', SortOption.revenue),
            _sortTile('Lowest Stock Quantity', SortOption.stock),
          ],
        ),
      ),
    );
  }

  Widget _sortTile(String title, SortOption option) {
    final isSelected = _currentSort == option;
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(
        title,
        style: GoogleFonts.inter(
          color: isSelected ? kCherryRed : kOffWhiteText,
          fontSize: 13,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
        ),
      ),
      trailing: isSelected ? const Icon(Icons.check, color: kCherryRed, size: 18) : null,
      onTap: () {
        setState(() => _currentSort = option);
        Navigator.pop(context);
      },
    );
  }

  void _showAddProductModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: kCardSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          top: 20,
          left: 20,
          right: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Add Product for Analytics',
              style: GoogleFonts.inter(
                color: kOffWhiteText,
                fontSize: 15,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 14),
            _buildInputField('Product Name', _nameController),
            _buildInputField('Category', _categoryController),
            Row(
              children: [
                Expanded(
                  child: _buildInputField('Cost Price (KES)', _costController, isNumber: true),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildInputField('Selling Price (KES)', _priceController, isNumber: true),
                ),
              ],
            ),
            _buildInputField('Stock Quantity', _stockController, isNumber: true),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: kCherryRed,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                onPressed: _addProduct,
                child: Text(
                  'Add & Analyze Product',
                  style: GoogleFonts.inter(
                    color: kOffWhiteText,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField(String label, TextEditingController controller, {bool isNumber = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: TextField(
        controller: controller,
        keyboardType: isNumber ? TextInputType.number : TextInputType.text,
        style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 13),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: GoogleFonts.inter(color: kMutedText, fontSize: 12),
          filled: true,
          fillColor: kBlackBase,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: kBorderSubtle),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: kBorderSubtle),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: kOffWhiteText, width: 1.2),
          ),
        ),
      ),
    );
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
              'Could not load products: $_error',
              style: GoogleFonts.inter(color: kCherryRed, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: kBlackRich,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: kCherryRed,
        elevation: 0,
        onPressed: _showAddProductModal,
        icon: const Icon(Icons.add, color: kOffWhiteText),
        label: Text(
          'Add Product',
          style: GoogleFonts.inter(color: kOffWhiteText, fontWeight: FontWeight.w800),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _iconButton(icon: Icons.arrow_back, onTap: () => Navigator.pop(context)),
                  Text(
                    'Product Performance',
                    style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 16, fontWeight: FontWeight.w800),
                  ),
                  _iconButton(icon: Icons.sort, onTap: _showSortMenu),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: kCardSurface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: kBorderSubtle),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _metricTile('Total Sales', 'KES ${_totalRevenue.toStringAsFixed(0)}'),
                    const SizedBox(height: 10),
                    const Divider(height: 1, color: kBorderSubtle),
                    const SizedBox(height: 10),
                    _metricTile('Gross Profit', 'KES ${_totalProfit.toStringAsFixed(0)}', isHighlight: true),
                    const SizedBox(height: 10),
                    const Divider(height: 1, color: kBorderSubtle),
                    const SizedBox(height: 10),
                    _metricTile('Avg Sell-Through', '${_averageSellThrough.toStringAsFixed(1)}%', accentColor: kBlueAccent),
                  ],
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    if (_topSeller != null)
                      _spotlightCard('Top Seller', _topSeller!.name, '${_topSeller!.unitsSold} units',
                          Icons.local_fire_department, kAmberGold),
                    const SizedBox(width: 8),
                    if (_mostProfitable != null)
                      _spotlightCard('Most Profitable', _mostProfitable!.name,
                          'KES ${_mostProfitable!.grossProfit.toStringAsFixed(0)}', Icons.attach_money, kGreenAccent),
                    const SizedBox(width: 8),
                    if (_bestMargin != null)
                      _spotlightCard('Best Margin', _bestMargin!.name,
                          '${_bestMargin!.profitMargin.toStringAsFixed(1)}%', Icons.trending_up, kPurpleAccent),
                  ],
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      onChanged: (val) => setState(() => _searchQuery = val),
                      style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 12),
                      decoration: InputDecoration(
                        hintText: 'Filter products by name...',
                        hintStyle: GoogleFonts.inter(color: kMutedText, fontSize: 12),
                        prefixIcon: const Icon(Icons.search, color: kMutedText, size: 18),
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
                      onPressed: () {},
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      constraints: const BoxConstraints(),
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(
              height: 34,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                scrollDirection: Axis.horizontal,
                itemCount: _categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  final isSelected = cat == _selectedCategory;
                  return ChoiceChip(
                    label: Text(
                      cat,
                      style: GoogleFonts.inter(
                        color: isSelected ? kOffWhiteText : kMutedText,
                        fontSize: 10.5,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: kCherryRed,
                    backgroundColor: kCardSurface,
                    shadowColor: Colors.transparent,
                    side: const BorderSide(color: kBorderSubtle),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    onSelected: (_) => setState(() => _selectedCategory = cat),
                  );
                },
              ),
            ),

            const SizedBox(height: 12),

            Expanded(
              child: _filteredInventory.isEmpty
                  ? _emptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 90),
                      itemCount: _filteredInventory.length,
                      itemBuilder: (context, index) {
                        final item = _filteredInventory[index];
                        return _productAnalyticsCard(item);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Helper UI Components ──────────────────────

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

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.search_off, color: kMutedText, size: 32),
          const SizedBox(height: 10),
          Text(
            'No products match your search or filter',
            style: GoogleFonts.inter(color: kMutedText, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _spotlightCard(String badge, String name, String metric, IconData icon, Color accent) {
    return Container(
      width: 150,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: kCardSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: accent, size: 14),
              const SizedBox(width: 4),
              Text(badge, style: GoogleFonts.inter(color: accent, fontSize: 9, fontWeight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 11, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 2),
          Text(metric, style: GoogleFonts.inter(color: kMutedText, fontSize: 10, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _productAnalyticsCard(PosItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
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
                    Text(
                      item.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(item.category, style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5)),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: item.performanceTierColor.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            item.performanceTier,
                            style: GoogleFonts.inter(color: item.performanceTierColor, fontSize: 8.5, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: kForestGreen.withOpacity(0.18),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${item.profitMargin.toStringAsFixed(1)}% Margin',
                      style: GoogleFonts.inter(color: kForestGreen, fontSize: 9.5, fontWeight: FontWeight.w800),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: item.stockStatusColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      item.stockStatus,
                      style: GoogleFonts.inter(color: item.stockStatusColor, fontSize: 8.5, fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: kBorderSubtle),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _analyticsSubText('Cost', 'KES ${item.costPrice.toStringAsFixed(0)}')),
              Expanded(child: _analyticsSubText('Price', 'KES ${item.sellingPrice.toStringAsFixed(0)}')),
              Expanded(child: _analyticsSubText('In Stock', '${item.stockQuantity} pcs')),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _analyticsSubText('Units Sold', '${item.unitsSold}')),
              Expanded(
                child: _analyticsSubText('Sell-Through', '${item.sellThroughRate.toStringAsFixed(1)}%', accentColor: kBlueAccent),
              ),
              Expanded(
                child: _analyticsSubText('Profit', 'KES ${item.grossProfit.toStringAsFixed(0)}', isBold: true),
              ),
            ],
          ),

          // ── NEW: Sell button ──
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 38,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: item.stockQuantity == 0 ? kBorderSubtle : kCherryRed,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              onPressed: item.stockQuantity == 0 ? null : () => _showSellDialog(item),
              icon: Icon(
                item.stockQuantity == 0 ? Icons.block : Icons.point_of_sale_rounded,
                color: kOffWhiteText,
                size: 16,
              ),
              label: Text(
                item.stockQuantity == 0 ? 'Out of Stock' : 'Record Sale',
                style: GoogleFonts.inter(color: kOffWhiteText, fontWeight: FontWeight.w800, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _metricTile(String label, String value, {bool isHighlight = false, Color? accentColor}) {
    Color valColor = kOffWhiteText;
    if (isHighlight) valColor = kForestGreen;
    if (accentColor != null) valColor = accentColor;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(color: kMutedText, fontSize: 10.5)),
        const SizedBox(height: 3),
        Text(value, style: GoogleFonts.inter(color: valColor, fontSize: 13.5, fontWeight: FontWeight.w800)),
      ],
    );
  }

  Widget _analyticsSubText(String label, String value, {bool isBold = false, Color? accentColor}) {
    Color valColor = kOffWhiteText;
    if (isBold) valColor = kForestGreen;
    if (accentColor != null) valColor = accentColor;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(color: kMutedText, fontSize: 9)),
        const SizedBox(height: 2),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.inter(
            color: valColor,
            fontSize: 11,
            fontWeight: (isBold || accentColor != null) ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ],
    );
  }
}