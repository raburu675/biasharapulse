// lib/pages/pos.dart
//
// Product Performance & Analytics — per-product cost, price, stock, units
// sold, and profit margin. This is an analysis view, not a selling till
// (see point_of_sale.dart for the actual till).

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'inventory.dart'; // reuses the BiasharaPulse color system — do not redefine colors locally

enum SortOption { margin, unitsSold, stock, sellThrough, revenue }

class PosItem {
  final String id;
  final String name;
  final String category;
  final double costPrice;
  final double sellingPrice;
  int stockQuantity;
  int unitsSold;
  int reorderPoint;

  PosItem({
    required this.id,
    required this.name,
    required this.category,
    required this.costPrice,
    required this.sellingPrice,
    required this.stockQuantity,
    this.unitsSold = 0,
    this.reorderPoint = 5,
  });

  double get totalRevenue => unitsSold * sellingPrice;
  double get totalCost => unitsSold * costPrice;
  double get grossProfit => totalRevenue - totalCost;
  double get profitMargin =>
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0.0;

  // Total handled units = units sold + remaining stock
  int get totalHandled => unitsSold + stockQuantity;

  // Sell-through rate: velocity metric
  double get sellThroughRate =>
      totalHandled > 0 ? (unitsSold / totalHandled) * 100 : 0.0;

  // Performance Tier Lens (Star Performer / Steady / Slow Mover)
  String get performanceTier {
    if (sellThroughRate >= 60.0) return 'Star Performer';
    if (sellThroughRate >= 30.0) return 'Steady';
    return 'Slow Mover';
  }

  Color get performanceTierColor {
    if (sellThroughRate >= 60.0) return kGreenAccent;
    if (sellThroughRate >= 30.0) return kBlueAccent;
    return kAmberWarning;
  }

  String get stockStatus {
    if (stockQuantity <= 0) return 'Out of Stock';
    if (stockQuantity <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  }

  Color get stockStatusColor {
    if (stockQuantity <= 0) return kCherryRed;
    if (stockQuantity <= reorderPoint) return kAmberWarning;
    return kGreenAccent;
  }
}

class Pos extends StatefulWidget {
  const Pos({super.key});

  @override
  State<Pos> createState() => _PosState();
}

class _PosState extends State<Pos> {
  // Sample inventory catalog
  final List<PosItem> _inventory = [
    PosItem(
      id: '1',
      name: 'NY Yankees 59FIFTY Fitted',
      category: 'MLB',
      costPrice: 2800,
      sellingPrice: 4500,
      stockQuantity: 18,
      unitsSold: 42,
    ),
    PosItem(
      id: '2',
      name: 'LA Dodgers 59FIFTY Fitted',
      category: 'MLB',
      costPrice: 2700,
      sellingPrice: 4500,
      stockQuantity: 12,
      unitsSold: 30,
    ),
    PosItem(
      id: '3',
      name: 'Chicago Bulls 59FIFTY Fitted',
      category: 'NBA',
      costPrice: 2500,
      sellingPrice: 4200,
      stockQuantity: 0,
      unitsSold: 15,
    ),
    PosItem(
      id: '4',
      name: 'LA Lakers Snapback',
      category: 'NBA',
      costPrice: 2600,
      sellingPrice: 4200,
      stockQuantity: 5,
      unitsSold: 28,
    ),
    PosItem(
      id: '5',
      name: 'KC Chiefs Fitted',
      category: 'NFL',
      costPrice: 2200,
      sellingPrice: 3800,
      stockQuantity: 14,
      unitsSold: 10,
    ),
  ];

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

    // Working Sort Execution
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

  // Analytics Metrics
  double get _totalInventoryValue =>
      _inventory.fold(0.0, (sum, i) => sum + (i.stockQuantity * i.costPrice));
  double get _totalRevenue =>
      _inventory.fold(0.0, (sum, i) => sum + i.totalRevenue);
  double get _totalProfit =>
      _inventory.fold(0.0, (sum, i) => sum + i.grossProfit);
  double get _averageSellThrough {
    if (_inventory.isEmpty) return 0.0;
    final sum = _inventory.fold(0.0, (acc, i) => acc + i.sellThroughRate);
    return sum / _inventory.length;
  }

  // Spotlight Leaders
  PosItem? get _topSeller {
    if (_inventory.isEmpty) return null;
    return _inventory.reduce((a, b) => a.unitsSold > b.unitsSold ? a : b);
  }

  PosItem? get _mostProfitable {
    if (_inventory.isEmpty) return null;
    return _inventory.reduce((a, b) => a.grossProfit > b.grossProfit ? a : b);
  }

  PosItem? get _bestMargin {
    if (_inventory.isEmpty) return null;
    return _inventory.reduce((a, b) => a.profitMargin > b.profitMargin ? a : b);
  }

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
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          name: _nameController.text,
          category:
              _categoryController.text.isEmpty ? 'General' : _categoryController.text,
          costPrice: double.tryParse(_costController.text) ?? 0.0,
          sellingPrice: double.tryParse(_priceController.text) ?? 0.0,
          stockQuantity: int.tryParse(_stockController.text) ?? 0,
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
                  child: _buildInputField('Cost Price (KES)', _costController,
                      isNumber: true),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildInputField(
                      'Selling Price (KES)', _priceController,
                      isNumber: true),
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

  Widget _buildInputField(String label, TextEditingController controller,
      {bool isNumber = false}) {
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
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
            // ── Top Navigation Bar ──────────────────────────
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
                    'Product Performance',
                    style: GoogleFonts.inter(
                      color: kOffWhiteText,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  _iconButton(
                    icon: Icons.sort,
                    onTap: _showSortMenu,
                  ),
                ],
              ),
            ),

            // ── 4-Tile Summary Grid ─────────────────────────
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
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _metricTile(
                            'Total Value',
                            'KES ${_totalInventoryValue.toStringAsFixed(0)}',
                          ),
                        ),
                        Expanded(
                          child: _metricTile(
                            'Total Sales',
                            'KES ${_totalRevenue.toStringAsFixed(0)}',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    const Divider(height: 1, color: kBorderSubtle),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _metricTile(
                            'Gross Profit',
                            'KES ${_totalProfit.toStringAsFixed(0)}',
                            isHighlight: true,
                          ),
                        ),
                        Expanded(
                          child: _metricTile(
                            'Avg Sell-Through',
                            '${_averageSellThrough.toStringAsFixed(1)}%',
                            accentColor: kBlueAccent,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // ── Spotlight Leaderboard Section ────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    if (_topSeller != null)
                      _spotlightCard(
                        'Top Seller',
                        _topSeller!.name,
                        '${_topSeller!.unitsSold} units',
                        Icons.local_fire_department,
                        kAmberGold,
                      ),
                    const SizedBox(width: 8),
                    if (_mostProfitable != null)
                      _spotlightCard(
                        'Most Profitable',
                        _mostProfitable!.name,
                        'KES ${_mostProfitable!.grossProfit.toStringAsFixed(0)}',
                        Icons.attach_money,
                        kGreenAccent,
                      ),
                    const SizedBox(width: 8),
                    if (_bestMargin != null)
                      _spotlightCard(
                        'Best Margin',
                        _bestMargin!.name,
                        '${_bestMargin!.profitMargin.toStringAsFixed(1)}%',
                        Icons.trending_up,
                        kPurpleAccent,
                      ),
                  ],
                ),
              ),
            ),

            // ── Search + Scan ─────────────────────────
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

            // ── Category Selector ─────────────────────────
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
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    onSelected: (_) => setState(() => _selectedCategory = cat),
                  );
                },
              ),
            ),

            const SizedBox(height: 12),

            // ── Product Analytics List ─────────────────────
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

  Widget _spotlightCard(
    String badge,
    String name,
    String metric,
    IconData icon,
    Color accent,
  ) {
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
              Text(
                badge,
                style: GoogleFonts.inter(
                  color: accent,
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.inter(
              color: kOffWhiteText,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            metric,
            style: GoogleFonts.inter(
              color: kMutedText,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
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
                      style: GoogleFonts.inter(
                        color: kOffWhiteText,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          item.category,
                          style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: item.performanceTierColor.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            item.performanceTier,
                            style: GoogleFonts.inter(
                              color: item.performanceTierColor,
                              fontSize: 8.5,
                              fontWeight: FontWeight.w700,
                            ),
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
                      style: GoogleFonts.inter(
                        color: kForestGreen,
                        fontSize: 9.5,
                        fontWeight: FontWeight.w800,
                      ),
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
                      style: GoogleFonts.inter(
                        color: item.stockStatusColor,
                        fontSize: 8.5,
                        fontWeight: FontWeight.w700,
                      ),
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
              Expanded(
                child: _analyticsSubText(
                    'Cost', 'KES ${item.costPrice.toStringAsFixed(0)}'),
              ),
              Expanded(
                child: _analyticsSubText(
                    'Price', 'KES ${item.sellingPrice.toStringAsFixed(0)}'),
              ),
              Expanded(
                child: _analyticsSubText('In Stock', '${item.stockQuantity} pcs'),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _analyticsSubText('Units Sold', '${item.unitsSold}'),
              ),
              Expanded(
                child: _analyticsSubText(
                  'Sell-Through',
                  '${item.sellThroughRate.toStringAsFixed(1)}%',
                  accentColor: kBlueAccent,
                ),
              ),
              Expanded(
                child: _analyticsSubText(
                  'Profit',
                  'KES ${item.grossProfit.toStringAsFixed(0)}',
                  isBold: true,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _metricTile(String label, String value,
      {bool isHighlight = false, Color? accentColor}) {
    Color valColor = kOffWhiteText;
    if (isHighlight) valColor = kForestGreen;
    if (accentColor != null) valColor = accentColor;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(color: kMutedText, fontSize: 10.5)),
        const SizedBox(height: 3),
        Text(
          value,
          style: GoogleFonts.inter(
            color: valColor,
            fontSize: 13.5,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }

  Widget _analyticsSubText(String label, String value,
      {bool isBold = false, Color? accentColor}) {
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
            fontWeight: (isBold || accentColor != null)
                ? FontWeight.w800
                : FontWeight.w600,
          ),
        ),
      ],
    );
  }
}