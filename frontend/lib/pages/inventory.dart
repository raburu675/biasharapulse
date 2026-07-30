// lib/pages/inventory.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'pos.dart';
import 'stockMovementPage.dart';
import 'suppliersPage.dart';
import 'orders.dart';
import '../services/dashboard_service.dart'; // NEW: fetches live data from Django

// Brand colors — BiasharaPulse Pure Dark Design System
const kBlackBase = Color(0xFF141414);
const kBlackRich = Color(0xFF0A0A0C); // Deeper obsidian dark background
const kCardSurface = Color(0xFF16161A);
const kCardSurfaceElevated = Color(0xFF1F1F24);
const kOffWhiteText = Color(0xFFF6F4F5);
const kMutedText = Color(0xFFA197A0);
const kBorderSubtle = Color(0xFF2B2B32);

// Futuristic Color Grading Palette
const kElectricCyan = Color(0xFF06B6D4);
const kElectricPurple = Color(0xFF8B5CF6);
const kNeonAmber = Color(0xFFF59E0B);
const kCherryRed = Color(0xFFDC2626);
const kSoftIvory = Color(0xFFEDE8DE);

// Brand Accent Colors

const kAmberGold = Color(0xFFD4A373);
const kGreenAccent = Color(0xFF16A34A);
const kAmberWarning = Color(0xFFD97706);
const kBlueAccent = Color(0xFF2563EB);
const kPurpleAccent = Color(0xFF9333EA);

// Chart palette
const kForestGreen = Color(0xFF15803D);
const kDeepGreen = Color(0xFF14532D);


class Inventory extends StatefulWidget {
  const Inventory({super.key});

  @override
  State<Inventory> createState() => _InventoryState();
}

class _InventoryState extends State<Inventory> {
  // 12-Month Performance Data (Past Year in KES thousands)
  // NOTE: still static placeholders — monthly trend history isn't wired to
  // the backend yet since your test data only spans one month so far.
  final List<double> _monthlySales = [
    320, 410, 385, 460, 510, 565, 490, 530, 580, 620, 680, 750
  ];
  final List<double> _monthlyExpenses = [
    210, 250, 235, 265, 285, 300, 270, 290, 310, 330, 350, 390
  ];
  final List<double> _monthlyProfitMargin = [
    28.5, 30.2, 29.1, 32.4, 34.0, 32.8, 31.5, 33.0, 34.2, 35.0, 36.1, 35.5
  ];
  final List<String> _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  int _touchedPieIndex = -1;
  int _activeMovementTab = 0; // 0: All Logs, 1: Stock Adjustments, 2: Reorder Alerts

  // ── LIVE DATA STATE (NEW) ──────────────────────────────
  bool _isLoading = true;
  String? _error;

  double _netRevenueToday = 0;
  double _expensesToday = 0;
  double _netProfitToday = 0;
  double _netMarginToday = 0;
  int _activeInventory = 0;
  List<Map<String, dynamic>> _paymentSplit = [];
  List<Map<String, dynamic>> _categoryVolume = [];

  // TODO: replace with the real logged-in business ID once auth is wired up
  final int _businessId = 1;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      final data = await DashboardService.fetchSummary(_businessId);
      setState(() {
        _netRevenueToday = double.parse(data['net_revenue'].toString());
        _expensesToday = double.parse(data['expenses'].toString());
        _netProfitToday = double.parse(data['net_profit'].toString());
        _netMarginToday = double.parse(data['net_margin'].toString());
        _activeInventory = data['active_inventory'];
        _paymentSplit = List<Map<String, dynamic>>.from(data['payment_channel_split']);
        _categoryVolume = List<Map<String, dynamic>>.from(data['category_volume']);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }
  // ────────────────────────────────────────────────────────

  final List<Map<String, dynamic>> _stockLogs = [
    {
      'type': 'Stock In',
      'item': 'New York Yankees 59FIFTY Fitted',
      'qty': '+20 units',
      'time': 'Today, 09:30 AM',
      'user': 'Admin',
      'category': 'MLB',
      'currentStock': 38,
      'reorderPoint': 10,
    },
    {
      'type': 'Waste/Damage',
      'item': 'Chicago Bulls 59FIFTY Fitted',
      'qty': '-2 units (0 left)',
      'time': 'Yesterday, 04:15 PM',
      'user': 'John',
      'category': 'NBA',
      'currentStock': 0,
      'reorderPoint': 8,
    },
    {
      'type': 'Low Stock Alert',
      'item': 'LA Dodgers Sideline Edition',
      'qty': '3 units left',
      'time': 'Yesterday, 01:20 PM',
      'user': 'System',
      'category': 'MLB',
      'currentStock': 3,
      'reorderPoint': 10,
    },
  ];

  // Green = comfortably above the reorder point, Yellow = at/below it
  // (still have stock, but time to reorder), Red = literally zero left.
  Color _stockHealthColor(int currentStock, int reorderPoint) {
    if (currentStock <= 0) return kCherryRed;
    if (currentStock <= reorderPoint) return kNeonAmber;
    return kGreenAccent;
  }

  // Maps a payment channel name from the API to a display color
  Color _channelColor(String channel) {
    switch (channel) {
      case 'mpesa':
        return kElectricCyan;
      case 'cash':
        return kSoftIvory;
      case 'card':
        return kElectricPurple;
      default:
        return kMutedText;
    }
  }

  String _channelLabel(String channel) {
    switch (channel) {
      case 'mpesa':
        return 'M-Pesa';
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      default:
        return channel;
    }
  }

  // Maps a category name to a display color, cycling through the palette
  Color _categoryColor(int index) {
    const colors = [kElectricCyan, kElectricPurple, kNeonAmber, kGreenAccent];
    return colors[index % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    // ── Loading state (NEW) ──
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: kBlackRich,
        body: Center(child: CircularProgressIndicator(color: kElectricCyan)),
      );
    }

    // ── Error state (NEW) ──
    if (_error != null) {
      return Scaffold(
        backgroundColor: kBlackRich,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Text(
              'Could not load dashboard: $_error',
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
              padding: const EdgeInsets.symmetric(horizontal: 17, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _headerIconButton(
                    icon: Icons.arrow_back,
                    onTap: () => Navigator.pop(context),
                  ),
                  RichText(
                    text: TextSpan(
                      style: GoogleFonts.inter(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.2,
                      ),
                      children: const [
                        TextSpan(
                          text: 'biashara',
                          style: TextStyle(color: kOffWhiteText),
                        ),
                        TextSpan(
                          text: 'pulse',
                          style: TextStyle(color: kCherryRed),
                        ),
                      ],
                    ),
                  ),
                  _headerIconButton(
                    icon: Icons.notifications_none_rounded,
                    onTap: () {},
                  ),
                ],
              ),
            ),

            // ── Main Scrollable Body ─────────────────────────
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Executive Dashboard',
                              style: GoogleFonts.inter(
                                color: kOffWhiteText,
                                fontSize: 18.5,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.4,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Live metrics & inventory health',
                              style: GoogleFonts.inter(
                                color: kMutedText,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: kElectricCyan.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: kElectricCyan.withOpacity(0.3)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 5,
                                height: 5,
                                decoration: const BoxDecoration(
                                  color: kElectricCyan,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'LIVE',
                                style: GoogleFonts.inter(
                                  color: kElectricCyan,
                                  fontSize: 8,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Global Search Bar with Filter Trigger
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              color: kOffWhiteText,
                            ),
                            decoration: InputDecoration(
                              hintText: 'Search SKU, product, or shelf...',
                              hintStyle: GoogleFonts.inter(
                                color: kMutedText,
                                fontSize: 10,
                              ),
                              prefixIcon: const Icon(
                                Icons.search,
                                size: 15,
                                color: kMutedText,
                              ),
                              filled: true,
                              fillColor: kCardSurface,
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
                                borderSide: const BorderSide(
                                  color: kOffWhiteText,
                                  width: 1,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          height: 38,
                          width: 38,
                          decoration: BoxDecoration(
                            color: kCardSurface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: kBorderSubtle),
                          ),
                          child: const Icon(Icons.tune_rounded, color: kOffWhiteText, size: 15),
                        ),
                      ],
                    ),

                    const SizedBox(height: 18),

                    // ── HERO BANNER: Revenue & Net Cashflow Summary ───
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            kCardSurfaceElevated,
                            kCardSurface,
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: kBorderSubtle),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'NET REVENUE (TODAY)',
                                    style: GoogleFonts.inter(
                                      color: kMutedText,
                                      fontSize: 8,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'KES ${_netRevenueToday.toStringAsFixed(0)}',
                                    style: GoogleFonts.inter(
                                      color: kOffWhiteText,
                                      fontSize: 18.5,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: kElectricCyan.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                  Icons.account_balance_wallet_outlined,
                                  color: kElectricCyan,
                                  size: 18,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Divider(color: kBorderSubtle, height: 1),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _heroMiniMetric(
                                title: 'Expenses',
                                value: 'KES ${_expensesToday.toStringAsFixed(0)}',
                                color: kElectricPurple,
                              ),
                              _heroMiniMetric(
                                title: 'Net Profit',
                                value: 'KES ${_netProfitToday.toStringAsFixed(0)}',
                                color: kGreenAccent,
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _heroMiniMetric(
                                title: 'Net Margin',
                                value: '${_netMarginToday.toStringAsFixed(1)}%',
                                color: kGreenAccent,
                              ),
                              _heroMiniMetric(
                                title: 'Active Inventory',
                                value: '$_activeInventory Pcs',
                                color: kSoftIvory,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 22),

                    // ── Quick Action Hub ────────────────────────────────
                    _sectionHeader('Quick Workflows'),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _actionShortcut(
                          icon: Icons.point_of_sale,
                          label: 'POS',
                          accentColor: kElectricCyan,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const Pos()),
                            );
                          },
                        ),
                        _actionShortcut(
                          icon: Icons.sync_alt_rounded,
                          label: 'Stock Movement',
                          accentColor: kElectricPurple,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const StockMovementPage()),
                            );
                          },
                        ),
                        _actionShortcut(
                          icon: Icons.local_shipping_outlined,
                          label: 'Suppliers',
                          accentColor: kNeonAmber,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const SuppliersPage()),
                            );
                          },
                        ),
                        _actionShortcut(
                          icon: Icons.assignment_outlined,
                          label: 'Orders',
                          accentColor: kOffWhiteText,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const OrdersPage()),
                            );
                          },
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // ── Performance Analytics Charts (FL_CHART) ────
                    _sectionHeader('Performance Overview'),
                    const SizedBox(height: 12),

                    Column(
                      children: [
                        // Chart 1: Sales (White) vs Expense (Electric Purple/Cyan Gradient)
                        // NOTE: still static placeholder data — see comment near
                        // _monthlySales above.
                        _chartContainer(
                          title: 'Sales & Expense Breakdown',
                          subtitle: 'Past 12 months (k KES)',
                          height: 204,
                          child: Column(
                            children: [
                              Expanded(
                                child: BarChart(
                                  BarChartData(
                                    alignment: BarChartAlignment.spaceAround,
                                    maxY: 800,
                                    gridData: const FlGridData(show: false),
                                    borderData: FlBorderData(show: false),
                                    titlesData: FlTitlesData(
                                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                      leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                      bottomTitles: AxisTitles(
                                        sideTitles: SideTitles(
                                          showTitles: true,
                                          getTitlesWidget: (value, meta) {
                                            final index = value.toInt();
                                            if (index >= 0 && index < _months.length) {
                                              return Padding(
                                                padding: const EdgeInsets.only(top: 4.0),
                                                child: Text(
                                                  _months[index],
                                                  style: GoogleFonts.inter(
                                                    color: kMutedText,
                                                    fontSize: 6.5,
                                                  ),
                                                ),
                                              );
                                            }
                                            return const SizedBox.shrink();
                                          },
                                        ),
                                      ),
                                    ),
                                    barGroups: List.generate(_months.length, (i) {
                                      final double expenseVal = _monthlyExpenses[i];
                                      final double salesVal = _monthlySales[i];
                                      
                                      return BarChartGroupData(
                                        x: i,
                                        barRods: [
                                          BarChartRodData(
                                            toY: salesVal,
                                            width: 8,
                                            borderRadius: BorderRadius.circular(3),
                                            rodStackItems: [
                                              // Lower segment: Expenses (Cyan/Purple Blend)
                                              BarChartRodStackItem(
                                                0,
                                                expenseVal,
                                                kElectricPurple,
                                              ),
                                              // Upper segment: Sales (Pure White)
                                              BarChartRodStackItem(
                                                expenseVal,
                                                salesVal,
                                                kOffWhiteText,
                                              ),
                                            ],
                                          ),
                                        ],
                                      );
                                    }),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 7,
                                    height: 7,
                                    decoration: BoxDecoration(
                                      color: kElectricPurple,
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Text('Expenses', style: GoogleFonts.inter(color: kMutedText, fontSize: 7)),
                                  const SizedBox(width: 16),
                                  Container(
                                    width: 7,
                                    height: 7,
                                    decoration: BoxDecoration(
                                      color: kOffWhiteText,
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Text('Sales', style: GoogleFonts.inter(color: kMutedText, fontSize: 7)),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Chart 2: Profit Margin Line Wave Chart
                        // NOTE: still static placeholder data (same reason as Chart 1)
                        _chartContainer(
                          title: 'Profit Margin',
                          subtitle: 'Monthly yield trend',
                          height: 187,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '${_monthlyProfitMargin.last.toStringAsFixed(1)}%',
                                    style: GoogleFonts.inter(
                                      color: kElectricCyan,
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 2),
                                    child: Text(
                                      '+${(_monthlyProfitMargin.last - _monthlyProfitMargin.first).toStringAsFixed(1)}% past year',
                                      style: GoogleFonts.inter(
                                        color: kMutedText,
                                        fontSize: 8,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Expanded(
                                child: LineChart(
                                  LineChartData(
                                    gridData: const FlGridData(show: false),
                                    borderData: FlBorderData(show: false),
                                    titlesData: FlTitlesData(
                                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                      leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                      bottomTitles: AxisTitles(
                                        sideTitles: SideTitles(
                                          showTitles: true,
                                          getTitlesWidget: (value, meta) {
                                            final index = value.toInt();
                                            if (index >= 0 && index < _months.length) {
                                              return Text(
                                                _months[index],
                                                style: GoogleFonts.inter(
                                                  color: kMutedText,
                                                  fontSize: 6.5,
                                                ),
                                              );
                                            }
                                            return const SizedBox.shrink();
                                          },
                                        ),
                                      ),
                                    ),
                                    lineBarsData: [
                                      LineChartBarData(
                                        spots: List.generate(
                                          _monthlyProfitMargin.length,
                                          (i) => FlSpot(i.toDouble(), _monthlyProfitMargin[i]),
                                        ),
                                        isCurved: true,
                                        color: kElectricCyan,
                                        barWidth: 2.5,
                                        isStrokeCapRound: true,
                                        dotData: const FlDotData(show: true),
                                        belowBarData: BarAreaData(
                                          show: true,
                                          color: kElectricCyan.withOpacity(0.15),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Chart 3: Payment Split Pie Chart (NOW LIVE)
                        _chartContainer(
                          title: 'Payment Channel Split',
                          subtitle: 'M-Pesa vs Cash vs Card',
                          height: 210,
                          child: Column(
                            children: [
                              Expanded(
                                child: _paymentSplit.isEmpty
                                    ? Center(
                                        child: Text(
                                          'No sales yet',
                                          style: GoogleFonts.inter(color: kMutedText, fontSize: 9),
                                        ),
                                      )
                                    : PieChart(
                                        PieChartData(
                                          pieTouchData: PieTouchData(
                                            touchCallback: (FlTouchEvent event, pieTouchResponse) {
                                              setState(() {
                                                if (!event.isInterestedForInteractions ||
                                                    pieTouchResponse == null ||
                                                    pieTouchResponse.touchedSection == null) {
                                                  _touchedPieIndex = -1;
                                                  return;
                                                }
                                                _touchedPieIndex = pieTouchResponse
                                                    .touchedSection!.touchedSectionIndex;
                                              });
                                            },
                                          ),
                                          borderData: FlBorderData(show: false),
                                          sectionsSpace: 2,
                                          centerSpaceRadius: 26,
                                          sections: List.generate(_paymentSplit.length, (i) {
                                            final entry = _paymentSplit[i];
                                            final color = _channelColor(entry['channel']);
                                            return PieChartSectionData(
                                              color: color,
                                              value: (entry['percent'] as num).toDouble(),
                                              title: '${entry['percent']}%',
                                              radius: _touchedPieIndex == i ? 34.0 : 30.0,
                                              titleStyle: GoogleFonts.inter(
                                                fontSize: 8.5,
                                                fontWeight: FontWeight.bold,
                                                color: color == kSoftIvory ? kBlackRich : kOffWhiteText,
                                              ),
                                            );
                                          }),
                                        ),
                                      ),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  for (final entry in _paymentSplit) ...[
                                    _pieLegendItem(
                                      _channelLabel(entry['channel']),
                                      _channelColor(entry['channel']),
                                    ),
                                    const SizedBox(width: 14),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Chart 4: Stock Share by Category (NOW LIVE)
                        _chartContainer(
                          title: 'Category Volume',
                          subtitle: 'Inventory share',
                          height: 162,
                          child: _categoryVolume.isEmpty
                              ? Center(
                                  child: Text(
                                    'No products yet',
                                    style: GoogleFonts.inter(color: kMutedText, fontSize: 9),
                                  ),
                                )
                              : Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    for (int i = 0; i < _categoryVolume.length; i++) ...[
                                      _categoryDistributionRow(
                                        _categoryVolume[i]['category'],
                                        (_categoryVolume[i]['percent'] as num).toDouble() / 100,
                                        _categoryColor(i),
                                      ),
                                      if (i != _categoryVolume.length - 1) const SizedBox(height: 12),
                                    ],
                                  ],
                                ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // ── Stock Movement Audit Log Section ────────────────
                    // NOTE: still using placeholder _stockLogs — this becomes
                    // real once the Stock Movement page/model is built.
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _sectionHeader('Recent Activity'),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const OrdersPage()),
                            );
                          },
                          child: Text(
                            'View Orders',
                            style: GoogleFonts.inter(
                              color: kCherryRed,
                              fontSize: 9.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Interactive Filter Chips
                    Row(
                      children: [
                        _filterChip('All Logs', 0),
                        const SizedBox(width: 8),
                        _filterChip('Stock Adjustments', 1),
                        const SizedBox(width: 8),
                        _filterChip('Reorder Alerts', 2),
                      ],
                    ),

                    const SizedBox(height: 12),

                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _stockLogs.take(3).length,
                      separatorBuilder: (context, index) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final log = _stockLogs[index];
                        final healthColor = _stockHealthColor(
                          log['currentStock'] as int,
                          log['reorderPoint'] as int,
                        );
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: kCardSurface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: kBorderSubtle),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Container(
                                width: 29,
                                height: 29,
                                decoration: BoxDecoration(
                                  color: healthColor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(9),
                                ),
                                child: Icon(
                                  log['type'] == 'Stock In'
                                      ? Icons.add_circle_outline
                                      : log['type'] == 'Waste/Damage'
                                          ? Icons.remove_circle_outline
                                          : Icons.warning_amber_rounded,
                                  color: healthColor,
                                  size: 15,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      log['item'],
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.inter(
                                        color: kOffWhiteText,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${log['type']} • By ${log['user']} • ${log['time']}',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.inter(
                                        color: kMutedText,
                                        fontSize: 8,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 7,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: healthColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  log['qty'],
                                  style: GoogleFonts.inter(
                                    color: healthColor,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
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

  // ── WIDGET HELPERS ──

  Widget _pieLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 7,
          height: 7,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.inter(
            color: kMutedText,
            fontSize: 7,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _heroMiniMetric({
    required String title,
    required String value,
    required Color color,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GoogleFonts.inter(
            color: kMutedText,
            fontSize: 8,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: GoogleFonts.inter(
            color: color,
            fontSize: 10,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }

  Widget _filterChip(String title, int index) {
    final bool isSelected = _activeMovementTab == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _activeMovementTab = index;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? kOffWhiteText : kCardSurface,
          borderRadius: BorderRadius.circular(7),
          border: Border.all(
            color: isSelected ? kOffWhiteText : kBorderSubtle,
          ),
        ),
        child: Text(
          title,
          style: GoogleFonts.inter(
            color: isSelected ? kBlackRich : kMutedText,
            fontSize: 8.5,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _headerIconButton({required IconData icon, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: kCardSurface,
          borderRadius: BorderRadius.circular(9),
          border: Border.all(color: kBorderSubtle),
        ),
        child: Icon(icon, color: kOffWhiteText, size: 15),
      ),
    );
  }

  Widget _actionShortcut({
    required IconData icon,
    required String label,
    required Color accentColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: kCardSurface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kBorderSubtle),
              boxShadow: [
                BoxShadow(
                  color: accentColor.withOpacity(0.05),
                  blurRadius: 8,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Icon(icon, color: accentColor, size: 18),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: GoogleFonts.inter(
              color: kMutedText,
              fontSize: 9,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.inter(
        color: kOffWhiteText,
        fontSize: 13,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.2,
      ),
    );
  }

  Widget _chartContainer({
    required String title,
    required String subtitle,
    required double height,
    required Widget child,
  }) {
    return Container(
      height: height,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: GoogleFonts.inter(
                  color: kOffWhiteText,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                subtitle,
                style: GoogleFonts.inter(
                  color: kMutedText,
                  fontSize: 8.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Expanded(child: child),
        ],
      ),
    );
  }

  Widget _categoryDistributionRow(String label, double ratio, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: GoogleFonts.inter(color: kOffWhiteText, fontSize: 9.5, fontWeight: FontWeight.w600)),
            Text('${(ratio * 100).toInt()}%', style: GoogleFonts.inter(color: kMutedText, fontSize: 9.5)),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: ratio,
            minHeight: 5,
            backgroundColor: kBlackBase,
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}