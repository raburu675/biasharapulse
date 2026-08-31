// lib/pages/splash.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'home.dart';

// Brand colors — Black-Dominant Palette with Burgundy/Cherry Accent
const kBlackBase = Color(0xFF0A0A0A);
const kBurgundyGlow = Color(0xFF3B0008);
const kCherryRedDeep = Color(0xFF6B000F);
const kCherryRed = Color(0xFFB0142B);
const kAccentWhite = Color(0xFFFFFFFF);

class Splash extends StatefulWidget {
  const Splash({super.key});

  @override
  State<Splash> createState() => _SplashState();
}

class _SplashState extends State<Splash> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeAnimation;
  late final Animation<double> _scaleAnimation;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    // Controls the entrance animation (fade + gentle scale-up + slide-up)
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.85, curve: Curves.easeOut),
    );

    _scaleAnimation = Tween<double>(begin: 0.88, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutQuint,
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutQuint,
      ),
    );

    // Kick off the entrance animation
    _controller.forward();

    // Timer to navigate to Home screen after 5 seconds
    Timer(const Duration(seconds: 5), () {
      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 700),
          pageBuilder: (context, animation, secondaryAnimation) => const Home(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: CurvedAnimation(
                parent: animation,
                curve: Curves.easeOut,
              ),
              child: child,
            );
          },
        ),
      );
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        // Black dominant radial gradient — dark black base with subtle central red glow
        decoration: const BoxDecoration(
          color: kBlackBase,
          gradient: RadialGradient(
            center: Alignment.center,
            radius: 0.85,
            colors: [
              kCherryRedDeep,
              kBurgundyGlow,
              kBlackBase,
            ],
            stops: [0.0, 0.4, 1.0],
          ),
        ),
        child: Center(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SlideTransition(
              position: _slideAnimation,
              child: ScaleTransition(
                scale: _scaleAnimation,
                child: RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: GoogleFonts.orbitron(
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                    ),
                    children: const [
                      TextSpan(
                        text: 'biashara',
                        style: TextStyle(
                          color: kAccentWhite,
                          fontSize: 28, // Base size
                        ),
                      ),
                      TextSpan(
                        text: 'pulse',
                        style: TextStyle(
                          color: kCherryRed,
                          fontSize: 46, // Prominent font size
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}