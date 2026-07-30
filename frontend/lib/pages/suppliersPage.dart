// lib/pages/suppliers.dart
//
// Supplier directory: who you buy stock from, how to reach them, how much
// you've spent with each, and when they last delivered. Pairs naturally
// with Stock Movement (a "New Delivery" stock-in should trace back to one
// of these suppliers) but stands on its own as a contacts + spend view.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'inventory.dart'; // reuses the BiasharaPulse color system — do not redefine colors locally

enum SupplierStatus { active, inactive }

class Supplier {
  final String id;
  String name;
  String category;
  String contactPerson;
  String phone;
  String email;
  String location;
  String paymentTerms;
  double totalSpent;
  int productsSupplied;
  String lastDelivery;
  SupplierStatus status;

  Supplier({
    required this.id,
    required this.name,
    required this.category,
    required this.contactPerson,
    required this.phone,
    this.email = '',
    this.location = '',
    this.paymentTerms = 'Cash on Delivery',
    this.totalSpent = 0,
    this.productsSupplied = 0,
    this.lastDelivery = 'No deliveries yet',
    this.status = SupplierStatus.active,
  });

  String get statusLabel => status == SupplierStatus.active ? 'Active' : 'Inactive';
  Color get statusColor => status == SupplierStatus.active ? kGreenAccent : kMutedText;
}

class SuppliersPage extends StatefulWidget {
  const SuppliersPage({super.key});

  @override
  State<SuppliersPage> createState() => _SuppliersPageState();
}

class _SuppliersPageState extends State<SuppliersPage> {
  // TODO: replace with the real supplier list (fetched from backend)
  final List<Supplier> _suppliers = [
    Supplier(
      id: '1',
      name: 'New Era Cap Co.',
      category: 'MLB / NBA Caps',
      contactPerson: 'James Mwangi',
      phone: '+254 712 345 678',
      email: 'orders@neweracap.co.ke',
      location: 'Nairobi CBD',
      paymentTerms: 'Net 30',
      totalSpent: 450000,
      productsSupplied: 12,
      lastDelivery: '3 days ago',
      status: SupplierStatus.active,
    ),
    Supplier(
      id: '2',
      name: 'Fitted Kings Distributors',
      category: 'NFL Caps',
      contactPerson: 'Grace Wanjiru',
      phone: '+254 722 334 455',
      email: 'grace@fittedkings.co.ke',
      location: 'Eastleigh',
      paymentTerms: 'Cash on Delivery',
      totalSpent: 180000,
      productsSupplied: 6,
      lastDelivery: '1 week ago',
      status: SupplierStatus.active,
    ),
    Supplier(
      id: '3',
      name: 'Embakasi Cap Wholesalers',
      category: 'Mixed / General',
      contactPerson: 'Peter Otieno',
      phone: '+254 733 221 100',
      email: 'peter.otieno@ecw.co.ke',
      location: 'Embakasi, Fedha',
      paymentTerms: 'Net 15',
      totalSpent: 95000,
      productsSupplied: 4,
      lastDelivery: '2 weeks ago',
      status: SupplierStatus.inactive,
    ),
  ];

  String _searchQuery = '';
  String _selectedCategory = 'All';

  final _nameController = TextEditingController();
  final _categoryController = TextEditingController();
  final _contactController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _locationController = TextEditingController();
  String _selectedPaymentTerms = 'Cash on Delivery';

  static const _paymentTermsOptions = [
    'Cash on Delivery',
    'Net 15',
    'Net 30',
    'Prepaid',
  ];

  List<String> get _categories {
    final cats = _suppliers.map((s) => s.category).toSet().toList();
    return ['All', ...cats];
  }

  List<Supplier> get _filteredSuppliers {
    return _suppliers.where((s) {
      final matchesCategory = _selectedCategory == 'All' || s.category == _selectedCategory;
      final matchesSearch = s.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.contactPerson.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  int get _activeCount => _suppliers.where((s) => s.status == SupplierStatus.active).length;
  double get _totalSpent => _suppliers.fold(0.0, (sum, s) => sum + s.totalSpent);
  int get _totalProductsSupplied =>
      _suppliers.fold(0, (sum, s) => sum + s.productsSupplied);

  @override
  void dispose() {
    _nameController.dispose();
    _categoryController.dispose();
    _contactController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _addSupplier() {
    if (_nameController.text.isEmpty ||
        _contactController.text.isEmpty ||
        _phoneController.text.isEmpty) {
      return;
    }

    setState(() {
      _suppliers.add(
        Supplier(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          name: _nameController.text,
          category: _categoryController.text.isEmpty ? 'General' : _categoryController.text,
          contactPerson: _contactController.text,
          phone: _phoneController.text,
          email: _emailController.text,
          location: _locationController.text,
          paymentTerms: _selectedPaymentTerms,
        ),
      );
    });

    _nameController.clear();
    _categoryController.clear();
    _contactController.clear();
    _phoneController.clear();
    _emailController.clear();
    _locationController.clear();
    _selectedPaymentTerms = 'Cash on Delivery';

    Navigator.pop(context);
  }

  void _showAddSupplierModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: kCardSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
                top: 20,
                left: 20,
                right: 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Add Supplier',
                      style: GoogleFonts.inter(
                        color: kOffWhiteText,
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _inputField('Supplier Name', _nameController),
                    _inputField('Category (e.g. MLB Caps)', _categoryController),
                    _inputField('Contact Person', _contactController),
                    Row(
                      children: [
                        Expanded(
                          child: _inputField('Phone', _phoneController, isPhone: true),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _inputField('Email (optional)', _emailController),
                        ),
                      ],
                    ),
                    _inputField('Location (optional)', _locationController),
                    const SizedBox(height: 6),
                    Text(
                      'Payment Terms',
                      style: GoogleFonts.inter(
                        color: kMutedText,
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _paymentTermsOptions.map((term) {
                        final selected = _selectedPaymentTerms == term;
                        return GestureDetector(
                          onTap: () => setModalState(() => _selectedPaymentTerms = term),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                            decoration: BoxDecoration(
                              color: selected ? kCherryRed.withOpacity(0.15) : kBlackBase,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: selected ? kCherryRed : kBorderSubtle,
                                width: selected ? 1.3 : 1,
                              ),
                            ),
                            child: Text(
                              term,
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
                    const SizedBox(height: 18),
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
                        onPressed: _addSupplier,
                        child: Text(
                          'Add Supplier',
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
          },
        );
      },
    );
  }

  Widget _inputField(String label, TextEditingController controller, {bool isPhone = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: TextField(
        controller: controller,
        keyboardType: isPhone ? TextInputType.phone : TextInputType.text,
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

  void _showSupplierDetail(Supplier supplier) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: kCardSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      supplier.name,
                      style: GoogleFonts.inter(
                        color: kOffWhiteText,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: supplier.statusColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      supplier.statusLabel,
                      style: GoogleFonts.inter(
                        color: supplier.statusColor,
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                supplier.category,
                style: GoogleFonts.inter(color: kMutedText, fontSize: 11),
              ),
              const SizedBox(height: 18),
              _detailRow(Icons.person_outline, supplier.contactPerson),
              _detailRow(Icons.call_outlined, supplier.phone),
              if (supplier.email.isNotEmpty) _detailRow(Icons.email_outlined, supplier.email),
              if (supplier.location.isNotEmpty)
                _detailRow(Icons.location_on_outlined, supplier.location),
              _detailRow(Icons.receipt_long_outlined, '${supplier.paymentTerms} terms'),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: _quickActionButton(
                      icon: Icons.call_outlined,
                      label: 'Call',
                      onTap: () {
                        // TODO: launch phone dialer with supplier.phone
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _quickActionButton(
                      icon: Icons.chat_bubble_outline,
                      label: 'WhatsApp',
                      onTap: () {
                        // TODO: launch WhatsApp chat with supplier.phone
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _quickActionButton(
                      icon: Icons.local_shipping_outlined,
                      label: 'Log Delivery',
                      onTap: () {
                        // TODO: navigate to StockMovementPage pre-filled as Stock In
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: kBlackBase,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: kBorderSubtle),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _statBlock(
                        'Products Supplied',
                        '${supplier.productsSupplied}',
                      ),
                    ),
                    Expanded(
                      child: _statBlock(
                        'Total Spent',
                        'KES ${supplier.totalSpent.toStringAsFixed(0)}',
                        valueColor: kForestGreen,
                      ),
                    ),
                    Expanded(
                      child: _statBlock('Last Delivery', supplier.lastDelivery),
                    ),
                  ],
                ),
              ),
            ],
          ),
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
            child: Text(
              text,
              style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 12.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _quickActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: kBlackBase,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorderSubtle),
        ),
        child: Column(
          children: [
            Icon(icon, color: kOffWhiteText, size: 18),
            const SizedBox(height: 5),
            Text(
              label,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                color: kMutedText,
                fontSize: 9.5,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statBlock(String label, String value, {Color? valueColor}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(color: kMutedText, fontSize: 9)),
        const SizedBox(height: 3),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.inter(
            color: valueColor ?? kOffWhiteText,
            fontSize: 11.5,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlackRich,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: kCherryRed,
        elevation: 0,
        onPressed: _showAddSupplierModal,
        icon: const Icon(Icons.add, color: kOffWhiteText),
        label: Text(
          'Add Supplier',
          style: GoogleFonts.inter(color: kOffWhiteText, fontWeight: FontWeight.w800),
        ),
      ),
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
                    'Suppliers',
                    style: GoogleFonts.inter(
                      color: kOffWhiteText,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  _iconButton(
                    icon: Icons.sort,
                    onTap: () {
                      // TODO: sort by spend, deliveries, or name
                    },
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 90),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── 2x2 Summary Grid ─────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: _summaryTile(
                                  'Total Suppliers',
                                  '${_suppliers.length}',
                                  Icons.storefront_outlined,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _summaryTile(
                                  'Active',
                                  '$_activeCount',
                                  Icons.check_circle_outline,
                                  accent: kGreenAccent,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Expanded(
                                child: _summaryTile(
                                  'Total Spent',
                                  'KES ${_totalSpent.toStringAsFixed(0)}',
                                  Icons.payments_outlined,
                                  accent: kForestGreen,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _summaryTile(
                                  'Products Supplied',
                                  '$_totalProductsSupplied',
                                  Icons.inventory_2_outlined,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // ── Search ─────────────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
                      child: TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 12),
                        decoration: InputDecoration(
                          hintText: 'Search by supplier or contact name...',
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

                    // ── Category Filter ─────────────────────────
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

                    const SizedBox(height: 14),

                    // ── Supplier List ─────────────────────
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: _filteredSuppliers.isEmpty
                          ? _emptyState()
                          : Column(
                              children: _filteredSuppliers
                                  .map((s) => Padding(
                                        padding: const EdgeInsets.only(bottom: 10),
                                        child: _supplierCard(s),
                                      ))
                                  .toList(),
                            ),
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
                  style: GoogleFonts.inter(
                    color: accent ?? kOffWhiteText,
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.storefront_outlined, color: kMutedText, size: 32),
            const SizedBox(height: 10),
            Text(
              'No suppliers match your search',
              style: GoogleFonts.inter(color: kMutedText, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _supplierCard(Supplier supplier) {
    return GestureDetector(
      onTap: () => _showSupplierDetail(supplier),
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
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: kBlackBase,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: kBorderSubtle),
                  ),
                  child: const Icon(Icons.storefront_outlined, color: kOffWhiteText, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        supplier.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          color: kOffWhiteText,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${supplier.category} • ${supplier.contactPerson}',
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
                    color: supplier.statusColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    supplier.statusLabel,
                    style: GoogleFonts.inter(
                      color: supplier.statusColor,
                      fontSize: 8.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(height: 1, color: kBorderSubtle),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _statBlock('Products', '${supplier.productsSupplied}'),
                ),
                Expanded(
                  child: _statBlock(
                    'Total Spent',
                    'KES ${supplier.totalSpent.toStringAsFixed(0)}',
                    valueColor: kForestGreen,
                  ),
                ),
                Expanded(
                  child: _statBlock('Last Delivery', supplier.lastDelivery),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}