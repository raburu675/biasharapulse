// lib/pages/register.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Brand colors — BiasharaPulse Black-to-Red Fade & Gold System
const kOffWhiteCanvas = Color(0xFFFAFAFA);
const kCharcoalHeading = Color(0xFF121212);
const kBorderSubtle = Color(0xFFE4E4E7);
const kMutedText = Color(0xFF71717A);

// Home Page Matching Hero Palette — Black at top, fading to Dark Red at bottom
const kBlackBase = Color(0xFF0A0A0A);
const kBlackRich = Color(0xFF141414);
const kDarkRed = Color(0xFF700010);
const kDarkRedDeep = Color(0xFF4A000A);
const kCherryRed = Color(0xFFB0142B);

// Accent Color — Warm Amber Gold for Primary CTA
const kAmberGold = Color(0xFFD4A373);

class Register extends StatelessWidget {
  const Register({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kOffWhiteCanvas,
      body: Stack(
        children: [
          // ── Curved Hero Container (Black at top -> Fading to Red at bottom) ──
          ClipPath(
            clipper: CurvedHeaderClipper(),
            child: Container(
              width: double.infinity,
              height: MediaQuery.of(context).size.height * 0.72, // ~3/4 of screen
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    kBlackBase,   // Solid black at top
                    kBlackRich,   // Smooth dark transition through middle
                    kDarkRed,     // Fades into dark red near the bottom curve
                    kDarkRedDeep, // Deep red finish at the arch boundary
                  ],
                  stops: [0.0, 0.70, 0.85, 1.0],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),

          // ── Main Content Layout ────────────────────────────────────
          LayoutBuilder(
            builder: (context, constraints) {
              return SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    minHeight: constraints.maxHeight,
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 10,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // ── Top Navigation Bar ───────────────────────────
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
                                onPressed: () {
                                  Navigator.pushNamed(context, '/');
                                },
                              ),
                              IconButton(
                                icon: const Icon(
                                  Icons.menu,
                                  color: Colors.white,
                                  size: 22,
                                ),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                onPressed: () {
                                  // TODO: Open drawer or menu later
                                },
                              ),
                            ],
                          ),

                          // ── Center Content Area (Inside Curved Header) ─────
                          Padding(
                            padding: const EdgeInsets.only(top: 10, bottom: 40),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Logo text
                                RichText(
                                  text: TextSpan(
                                    style: GoogleFonts.orbitron(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.8,
                                    ),
                                    children: const [
                                      TextSpan(
                                        text: 'biashara',
                                        style: TextStyle(color: Colors.white),
                                      ),
                                      TextSpan(
                                        text: 'pulse',
                                        style: TextStyle(color: kCherryRed),
                                      ),
                                    ],
                                  ),
                                ),

                                const SizedBox(height: 36),

                                // Main Heading
                                Text(
                                  'Get started',
                                  style: GoogleFonts.orbitron(
                                    color: Colors.white,
                                    fontSize: 28,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),

                                const SizedBox(height: 12),

                                // Subheading
                                Text(
                                  'Create an account or sign in to continue. Your stock, sales, and insights — always current, always accessible. Everything you need to run your business, in one place.',
                                  style: GoogleFonts.inter(
                                    color: Colors.white.withOpacity(0.85),
                                    fontSize: 11.5,
                                    height: 1.5,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // ── Bottom Actions (On Off-White Canvas) ──────────
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Sign Up Button (Primary Action - Warm Amber Gold)
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: kAmberGold,
                                    foregroundColor: kBlackBase,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    elevation: 0,
                                  ),
                                  onPressed: () {
                                    Navigator.pushNamed(context, '/signup');
                                  },
                                  child: Text(
                                    'Sign Up',
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                              ),

                              const SizedBox(height: 12),

                              // Sign In Button (Secondary Action - Outlined Dark Red Border)
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: kBlackBase,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    side: const BorderSide(
                                      color: kBlackBase,
                                      width: 1.2,
                                    ),
                                  ),
                                  onPressed: () {
                                    Navigator.pushNamed(context, '/signin');
                                  },
                                  child: Text(
                                    'Sign In',
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ),

                              const SizedBox(height: 16),

                              // Free Preview Link
                              Center(
                                child: GestureDetector(
                                  onTap: () {
                                    Navigator.pushNamed(context, '/inventory');
                                  },
                                  child: Text(
                                    'Preview for free',
                                    style: GoogleFonts.inter(
                                      color: kMutedText,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w500,
                                      decoration: TextDecoration.underline,
                                      decorationColor: kMutedText,
                                    ),
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
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

// ── Custom Clipper for 3/4 Circular Arch Sweep ─────────────────────────────
class CurvedHeaderClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Path path = Path();
    // Starts top-left
    path.lineTo(0, size.height - 50);

    // Creates smooth quadratic curve across the bottom edge
    path.quadraticBezierTo(
      size.width / 2,
      size.height + 45, // Pulls curve down smoothly at center
      size.width,
      size.height - 50,
    );

    // Closes path to top-right
    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}