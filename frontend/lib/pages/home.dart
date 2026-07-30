// lib/pages/home.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Brand colors — BiasharaPulse Light Canvas & Black-Dominant Palette
const kOffWhiteCanvas = Color(0xFFFAFAFA);
const kCharcoalHeading = Color(0xFF121212);
const kCardSurface = Color(0xFFF4F4F5);
const kBorderSubtle = Color(0xFFE4E4E7);
const kMutedText = Color(0xFF71717A);

// Black & Dark Red Palette
const kBlackBase = Color(0xFF0A0A0A);
const kBlackRich = Color(0xFF141414);
const kBurgundyGlow = Color(0xFF4A000A);
const kCherryRed = Color(0xFFB0142B);

// Blending Accent Color — Warm Amber Gold for Primary CTA
const kAmberGold = Color(0xFFD4A373);
const kAmberGoldDark = Color(0xFFB8860B);

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kOffWhiteCanvas,
      body: Stack(
        children: [
          // ── Asymmetric Curved Black-Dominant Hero Section ───────────
          ClipPath(
            clipper: AsymmetricHomeClipper(),
            child: Container(
              width: double.infinity,
              height: MediaQuery.of(context).size.height * 0.52,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    kBlackBase,
                    kBlackRich,
                    kBurgundyGlow,
                  ],
                  stops: [0.0, 0.7, 1.0],
                ),
              ),
            ),
          ),

          // ── Main Content Layout ────────────────────────────────────
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 20,
                vertical: 10,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Top Navigation Bar ──────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(
                          Icons.home_outlined,
                          color: Colors.white,
                          size: 22,
                        ),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () {},
                      ),
                      RichText(
                        text: TextSpan(
                          style: GoogleFonts.orbitron(
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                          ),
                          children: const [
                            TextSpan(
                              text: 'biashara',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                              ),
                            ),
                            TextSpan(
                              text: 'pulse',
                              style: TextStyle(
                                color: kCherryRed,
                                fontSize: 18,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(
                          Icons.menu,
                          color: Colors.white,
                          size: 22,
                        ),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () {},
                      ),
                    ],
                  ),

                  // ── Hero Content inside Black Header ──────────────────
                  Padding(
                    padding: const EdgeInsets.only(top: 20, bottom: 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.15),
                            ),
                          ),
                          child: Text(
                            'Smart Inventory Management',
                            style: GoogleFonts.inter(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Managing your business\njust got easier',
                          style: GoogleFonts.orbitron(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            height: 1.25,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // ── Content Card overlapping off-white canvas ─────────
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: kBorderSubtle),
                      boxShadow: [
                        BoxShadow(
                          color: kBlackBase.withOpacity(0.06),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "From stock counts to sales, everything about your business lives in one place. Know what's moving, what's running low, and what needs your attention — before it becomes a problem.",
                          style: GoogleFonts.inter(
                            color: kMutedText,
                            fontSize: 11.5,
                            height: 1.55,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Quick Value Highlights Row
                        Row(
                          children: [
                            _featureBadge(
                              Icons.inventory_2_outlined,
                              'Live Stock',
                            ),
                            const SizedBox(width: 8),
                            _featureBadge(
                              Icons.insights_outlined,
                              'Real Analytics',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // ── Bottom Action Button (Warm Amber Gold) ─────────────
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: kAmberGold,
                            foregroundColor: kBlackBase,
                            padding: const EdgeInsets.symmetric(vertical: 13),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            elevation: 0,
                          ),
                          onPressed: () {
                            Navigator.pushNamed(context, '/register');
                          },
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Get Started',
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(
                                Icons.arrow_forward_rounded,
                                size: 14,
                                color: kBlackBase,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _featureBadge(IconData icon, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
        decoration: BoxDecoration(
          color: kCardSurface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: kBorderSubtle),
        ),
        child: Row(
          children: [
            Icon(icon, size: 14, color: kAmberGoldDark),
            const SizedBox(width: 6),
            Text(
              label,
              style: GoogleFonts.inter(
                color: kCharcoalHeading,
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Asymmetric Wave Curve Clipper ──────────────────────────────────────────
class AsymmetricHomeClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Path path = Path();
    path.lineTo(0, size.height - 40);

    // Asymmetric wave curve dipping deeper on the right side
    path.cubicTo(
      size.width * 0.35,
      size.height - 80,
      size.width * 0.70,
      size.height + 20,
      size.width,
      size.height - 35,
    );

    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}