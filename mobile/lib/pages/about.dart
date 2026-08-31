import 'package:flutter/material.dart';

// Reusable brand colors — kept consistent with the rest of the app
const kNavy = Color(0xFF10254A);   // accent color for icons, buttons, FAB
const kMuted = Color(0xFFB0B0B0);  // muted grey for secondary text

class About extends StatelessWidget {
  const About({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,

      // AppBar just to hold the backarrow at the top-left
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            Navigator.pop(context); //goes back to the previous homepage
          },
        ),
      ),

      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            // Centers everything vertically in the middle of the screen
            mainAxisAlignment: MainAxisAlignment.center,
            // Left-aligns all children horizontally
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Small icon badge above the heading — gives the page a visual anchor
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: kNavy.withOpacity(0.2), // soft tinted navy background
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.insights_outlined, // suggests analytics/tracking
                  color: kNavy,
                  size: 28,
                ),
              ),
              // Gap between icon and heading
              const SizedBox(height: 24),

              // Main heading
              const Text(
                'One app.\nYour whole business.',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                  height: 1.25, //
                ),
              ),
              // Gap between heading and paragraph
              const SizedBox(height: 14),

              // Supporting description paragraph
              const Text(
                'Keep every cap accounted for — team, colorway, size, and price — '
                'all tracked in real time, so you always know exactly what you have '
                'and what needs restocking.',
                style: TextStyle(
                  color: kMuted,
                  fontSize: 15,
                  height: 1.6, // relaxed line spacing for readability
                ),
              ),

              //larger gap before the list
              const SizedBox(height: 32),

              //Feature list — each row pairs an icon with a short benefit statement
              const _FeatureRow(
                icon: Icons.inventory_2_outlined,
                text: 'See exactly what\'s in stock, in one glance',
              ),
              const SizedBox(height: 16),
              const _FeatureRow(
                icon: Icons.trending_up,
                text: 'Track sales as they happen',
              ),
              const SizedBox(height: 16),
              const _FeatureRow(
                icon: Icons.notifications_active_outlined,
                text: 'Get notified before you run out',
              ),
            ],
          ),
        ),
      ),

      //floating arrow to move user to register page
      floatingActionButton: FloatingActionButton(
        backgroundColor: kNavy,
        foregroundColor: Colors.white,
        onPressed: () {
          Navigator.pushNamed(context, '/register');
        },
        child: const Icon(Icons.arrow_forward),
      ),
      // Centers the FAB horizontally at the bottom of the screen
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}

// Small reusable widget for a single feature row (icon + text)
// Keeping this separate avoids repeating the same Row/Icon/Text structure 3 times
class _FeatureRow extends StatelessWidget {
  final IconData icon;  // which icon to show for this feature
  final String text;    // the feature description

  // this is what lets you call _FeatureRow(icon: ..., text: ...)
  const _FeatureRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      //sets everything vertically centered
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Small circular icon badge
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: kNavy.withOpacity(0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: kNavy, size: 18),
        ),

        // Gap between icon and text
        const SizedBox(width: 12),

        // Feature text — Expanded so long text wraps instead of overflowing
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}