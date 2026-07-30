// lib/pages/audits.dart
//
// Stock audits: reconciling what the system thinks you have against what's
// actually on the shelf. Two modes in one page — a dashboard of past audits
// and running accuracy, and a live count session where each item's system
// count is checked against a physical count and discrepancies surface
// immediately.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'inventory.dart'; // reuses the BiasharaPulse color system — do not redefine colors locally

class AuditDiscrepancy {
  final String productName;
  final int expected;
  final int counted;
  final double varianceValue;

  AuditDiscrepancy({
    required this.productName,
    required this.expected,
    required this.counted,
    required this.varianceValue,
  });

  int get variance => counted - expected;
}

class AuditRecord {
  final String id;
  final String date;
  final int itemsAudited;
  final int discrepanciesFound;
  final double netVarianceValue;
  final String conductedBy;
  final List<AuditDiscrepancy> discrepancies;

  AuditRecord({
    required this.id,
    required this.date,
    required this.itemsAudited,
    required this.discrepanciesFound,
    required this.netVarianceValue,
    required this.conductedBy,
    this.discrepancies = const [],
  });

  double get accuracy =>
      itemsAudited > 0 ? ((itemsAudited - discrepanciesFound) / itemsAudited) * 100 : 100;
}

class AuditsPage extends StatefulWidget {
  const AuditsPage({super.key});

  @override
  State<AuditsPage> createState() => _AuditsPageState();
}

class _AuditsPageState extends State<AuditsPage> {
  // TODO: replace with the real product catalog (fetched or shared with Inventory)
  final List<Map<String, dynamic>> _products = [
    {'sku': 'SKU-CAP-001', 'name': 'NY Yankees 59FIFTY Fitted', 'category': 'MLB', 'expected': 18, 'costPrice': 2800.0},
    {'sku': 'SKU-CAP-002', 'name': 'LA Dodgers 59FIFTY Fitted', 'category': 'MLB', 'expected': 12, 'costPrice': 2700.0},
    {'sku': 'SKU-CAP-003', 'name': 'Chicago Bulls 59FIFTY Fitted', 'category': 'NBA', 'expected': 0, 'costPrice': 2500.0},
    {'sku': 'SKU-CAP-004', 'name': 'LA Lakers Snapback', 'category': 'NBA', 'expected': 22, 'costPrice': 2600.0},
    {'sku': 'SKU-CAP-005', 'name': 'KC Chiefs Fitted', 'category': 'NFL', 'expected': 14, 'costPrice': 2200.0},
  ];

  // TODO: replace with real audit history (fetched from backend)
  final List<AuditRecord> _pastAudits = [
    AuditRecord(
      id: '1',
      date: '12 Jul 2026',
      itemsAudited: 45,
      discrepanciesFound: 3,
      netVarianceValue: -8400,
      conductedBy: 'Admin',
      discrepancies: [
        AuditDiscrepancy(productName: 'Chicago Bulls 59FIFTY Fitted', expected: 8, counted: 5, varianceValue: -7500),
        AuditDiscrepancy(productName: 'KC Chiefs Fitted', expected: 14, counted: 15, varianceValue: 2200),
        AuditDiscrepancy(productName: 'LA Dodgers 59FIFTY Fitted', expected: 12, counted: 11, varianceValue: -2700),
      ],
    ),
    AuditRecord(
      id: '2',
      date: '28 Jun 2026',
      itemsAudited: 40,
      discrepanciesFound: 1,
      netVarianceValue: 1200,
      conductedBy: 'John',
    ),
    AuditRecord(
      id: '3',
      date: '14 Jun 2026',
      itemsAudited: 38,
      discrepanciesFound: 0,
      netVarianceValue: 0,
      conductedBy: 'Admin',
    ),
  ];

  bool _auditInProgress = false;
  final Map<String, int?> _countedQuantities = {};
  final Map<String, TextEditingController> _countControllers = {};

  @override
  void initState() {
    super.initState();
    for (final product in _products) {
      _countControllers[product['sku']] = TextEditingController();
    }
  }

  @override
  void dispose() {
    for (final controller in _countControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  int get _countedSoFar => _countedQuantities.values.where((v) => v != null).length;

  int get _discrepanciesSoFar => _products.where((p) {
        final counted = _countedQuantities[p['sku']];
        return counted != null && counted != p['expected'];
      }).length;

  bool get _canFinishAudit => _countedSoFar == _products.length;

  double get _lastAuditNetVariance => _pastAudits.isEmpty ? 0 : _pastAudits.first.netVarianceValue;

  double get _avgAccuracy => _pastAudits.isEmpty
      ? 100
      : _pastAudits.fold(0.0, (sum, a) => sum + a.accuracy) / _pastAudits.length;

  void _startAudit() {
    setState(() {
      _auditInProgress = true;
      _countedQuantities.clear();
      for (final controller in _countControllers.values) {
        controller.clear();
      }
    });
  }

  void _cancelAudit() {
    setState(() {
      _auditInProgress = false;
      _countedQuantities.clear();
    });
  }

  void _finishAudit() {
    final discrepancies = <AuditDiscrepancy>[];
    double netVariance = 0;

    for (final product in _products) {
      final expected = product['expected'] as int;
      final counted = _countedQuantities[product['sku']] ?? expected;
      final varianceValue = (counted - expected) * (product['costPrice'] as double);
      netVariance += varianceValue;
      if (counted != expected) {
        discrepancies.add(AuditDiscrepancy(
          productName: product['name'],
          expected: expected,
          counted: counted,
          varianceValue: varianceValue,
        ));
      }
    }

    setState(() {
      _pastAudits.insert(
        0,
        AuditRecord(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          date: 'Today',
          itemsAudited: _products.length,
          discrepanciesFound: discrepancies.length,
          netVarianceValue: netVariance,
          conductedBy: 'Admin', // TODO: use the logged-in user
          discrepancies: discrepancies,
        ),
      );
      _auditInProgress = false;
      _countedQuantities.clear();
    });

    // TODO: also push a "Stock Correction" movement for each discrepancy
    // into Stock Movement, so counted quantities actually update inventory.
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
                  _iconButton(
                    icon: _auditInProgress ? Icons.close : Icons.arrow_back,
                    onTap: () {
                      if (_auditInProgress) {
                        _cancelAudit();
                      } else {
                        Navigator.pop(context);
                      }
                    },
                  ),
                  Text(
                    _auditInProgress ? 'Counting Stock' : 'Audits',
                    style: GoogleFonts.inter(
                      color: kOffWhiteText,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  _iconButton(
                    icon: Icons.qr_code_scanner,
                    onTap: () {
                      // TODO: wire up barcode/QR scanner logic — should jump
                      // focus to the matching product's count field
                    },
                  ),
                ],
              ),
            ),

            Expanded(
              child: _auditInProgress ? _auditSessionView() : _dashboardView(),
            ),
          ],
        ),
      ),
    );
  }

  // ── Dashboard View ──────────────────────────────────────────────────────

  Widget _dashboardView() {
    return SingleChildScrollView(
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
                    child: _summaryTile(
                      'Last Audit',
                      _pastAudits.isEmpty ? '—' : _pastAudits.first.date,
                      Icons.event_available_outlined,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _summaryTile(
                      'Total Audits',
                      '${_pastAudits.length}',
                      Icons.fact_check_outlined,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _summaryTile(
                      'Avg Accuracy',
                      '${_avgAccuracy.toStringAsFixed(0)}%',
                      Icons.verified_outlined,
                      accent: kGreenAccent,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _summaryTile(
                      'Last Variance',
                      'KES ${_lastAuditNetVariance.toStringAsFixed(0)}',
                      Icons.difference_outlined,
                      accent: _lastAuditNetVariance < 0
                          ? kCherryRed
                          : (_lastAuditNetVariance > 0 ? kGreenAccent : kMutedText),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: kCherryRed,
                foregroundColor: kOffWhiteText,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              onPressed: _startAudit,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.playlist_add_check_rounded, size: 18, color: kOffWhiteText),
                  const SizedBox(width: 8),
                  Text(
                    'Start New Audit',
                    style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 28),

          Text(
            'Audit History',
            style: GoogleFonts.inter(
              color: kOffWhiteText,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),

          if (_pastAudits.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 30),
              child: Center(
                child: Text(
                  'No audits recorded yet',
                  style: GoogleFonts.inter(color: kMutedText, fontSize: 12),
                ),
              ),
            )
          else
            Column(
              children: _pastAudits
                  .map((audit) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _auditHistoryCard(audit),
                      ))
                  .toList(),
            ),
        ],
      ),
    );
  }

  Widget _auditHistoryCard(AuditRecord audit) {
    final bool clean = audit.discrepanciesFound == 0;
    return GestureDetector(
      onTap: () => _showAuditDetail(audit),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: kCardSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kBorderSubtle),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: (clean ? kGreenAccent : kAmberWarning).withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                clean ? Icons.check_circle_outline : Icons.report_gmailerrorred_outlined,
                color: clean ? kGreenAccent : kAmberWarning,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    audit.date,
                    style: GoogleFonts.inter(
                      color: kOffWhiteText,
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${audit.itemsAudited} items • ${audit.discrepanciesFound} discrepancies • By ${audit.conductedBy}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '${audit.accuracy.toStringAsFixed(0)}%',
              style: GoogleFonts.inter(
                color: clean ? kGreenAccent : kAmberWarning,
                fontSize: 13,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAuditDetail(AuditRecord audit) {
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
              Text(
                'Audit — ${audit.date}',
                style: GoogleFonts.inter(
                  color: kOffWhiteText,
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${audit.itemsAudited} items counted • Conducted by ${audit.conductedBy}',
                style: GoogleFonts.inter(color: kMutedText, fontSize: 11),
              ),
              const SizedBox(height: 16),
              if (audit.discrepancies.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_outline, color: kGreenAccent, size: 20),
                      const SizedBox(width: 10),
                      Text(
                        'No discrepancies — stock matched exactly',
                        style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 12.5),
                      ),
                    ],
                  ),
                )
              else
                Column(
                  children: audit.discrepancies
                      .map((d) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: _discrepancyRow(d),
                          ))
                      .toList(),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _discrepancyRow(AuditDiscrepancy d) {
    final bool over = d.variance > 0;
    final Color color = over ? kGreenAccent : kCherryRed;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kBlackBase,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorderSubtle),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  d.productName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    color: kOffWhiteText,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Expected ${d.expected} • Counted ${d.counted}',
                  style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '${over ? '+' : ''}${d.variance} • KES ${d.varianceValue.toStringAsFixed(0)}',
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

  // ── Active Audit Session View ───────────────────────────────────────────

  Widget _auditSessionView() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 14),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kCardSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kBorderSubtle),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '$_countedSoFar of ${_products.length} counted',
                      style: GoogleFonts.inter(
                        color: kOffWhiteText,
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if (_discrepanciesSoFar > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: kAmberWarning.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '$_discrepanciesSoFar discrepancies',
                          style: GoogleFonts.inter(
                            color: kAmberWarning,
                            fontSize: 9.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: _products.isEmpty ? 0 : _countedSoFar / _products.length,
                    minHeight: 6,
                    backgroundColor: kBorderSubtle,
                    valueColor: const AlwaysStoppedAnimation<Color>(kCherryRed),
                  ),
                ),
              ],
            ),
          ),
        ),

        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
            itemCount: _products.length,
            itemBuilder: (context, index) => _countLineItem(_products[index]),
          ),
        ),

        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _canFinishAudit ? kCherryRed : kBorderSubtle,
                foregroundColor: kOffWhiteText,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              onPressed: _canFinishAudit ? _finishAudit : null,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.check_circle_outline, size: 18, color: kOffWhiteText),
                  const SizedBox(width: 8),
                  Text(
                    'Finish Audit',
                    style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _countLineItem(Map<String, dynamic> product) {
    final sku = product['sku'] as String;
    final expected = product['expected'] as int;
    final counted = _countedQuantities[sku];
    final bool touched = counted != null;
    final bool matches = touched && counted == expected;
    final bool mismatch = touched && counted != expected;

    Color borderColor = kBorderSubtle;
    if (matches) borderColor = kGreenAccent;
    if (mismatch) borderColor = kCherryRed;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: touched ? 1.3 : 1),
      ),
      child: Row(
        children: [
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
                  '${product['category']} • Expected: $expected',
                  style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5),
                ),
                if (mismatch) ...[
                  const SizedBox(height: 4),
                  Text(
                    counted > expected ? 'Overage of ${counted - expected}' : 'Missing ${expected - counted}',
                    style: GoogleFonts.inter(
                      color: kCherryRed,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ] else if (matches) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Matched',
                    style: GoogleFonts.inter(
                      color: kGreenAccent,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 80,
            child: TextField(
              controller: _countControllers[sku],
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                color: kOffWhiteText,
                fontSize: 14,
                fontWeight: FontWeight.w800,
              ),
              decoration: InputDecoration(
                hintText: 'Count',
                hintStyle: GoogleFonts.inter(color: kMutedText, fontSize: 11),
                filled: true,
                fillColor: kBlackBase,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
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
              onChanged: (val) {
                setState(() {
                  _countedQuantities[sku] = int.tryParse(val);
                });
              },
            ),
          ),
        ],
      ),
    );
  }

  // ── Shared Small Helpers ────────────────────────────────────────────────

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
}