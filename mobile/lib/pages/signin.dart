// lib/pages/signin.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

const kBlack = Color(0xFF0A0A0A);
const kCherryRed = Color(0xFFB0142B);
const kCherryRedDeep = Color(0xFF5C0A17);
const kAccentWhite = Color(0xFFFFFFFF);
const kMutedText = Color(0xFF9A9A9A);

class SignIn extends StatefulWidget {
  const SignIn({super.key});

  @override
  State<SignIn> createState() => _SignInState();
}

class _SignInState extends State<SignIn> {
  bool _obscurePassword = true;
  final _formKey = GlobalKey<FormState>();

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlack,
      body: Stack(
        children: [
          // ── Background Glows ──────────────────────────────
          Positioned(
            top: -90,
            right: -70,
            child: Container(
              width: 280,
              height: 280,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [kCherryRed, kCherryRedDeep, Colors.transparent],
                  stops: [0.0, 0.55, 1.0],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -100,
            left: -80,
            child: Container(
              width: 240,
              height: 240,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [kCherryRedDeep, Colors.transparent],
                  stops: [0.0, 1.0],
                ),
              ),
            ),
          ),

          // ── Main Content Layout ───────────────────────────
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
                        children: [
                          // ── Top Navigation Bar ───────────────────────────
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              IconButton(
                                icon: const Icon(
                                  Icons.home_outlined,
                                  color: kAccentWhite,
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
                                  color: kAccentWhite,
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

                          const SizedBox(height: 10),

                          // ── Form Area (Centered) ────────────────────────
                          Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Logo text
                                Center(
                                  child: RichText(
                                    text: TextSpan(
                                      style: GoogleFonts.orbitron(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 0.8,
                                      ),
                                      children: const [
                                        TextSpan(
                                          text: 'biashara',
                                          style: TextStyle(color: kAccentWhite),
                                        ),
                                        TextSpan(
                                          text: 'pulse',
                                          style: TextStyle(color: kCherryRed),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),

                                const SizedBox(height: 36),

                                // Page heading
                                Center(
                                  child: Text(
                                    'Welcome back',
                                    style: GoogleFonts.orbitron(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Center(
                                  child: Text(
                                    'Sign in to keep track of your business',
                                    style: GoogleFonts.inter(
                                      color: kMutedText,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),

                                const SizedBox(height: 26),

                                // ── Email field ──────────────────────────────
                                _fieldLabel('Email'),
                                const SizedBox(height: 5),
                                TextFormField(
                                  controller: _emailController,
                                  autovalidateMode: AutovalidateMode.onUserInteraction,
                                  keyboardType: TextInputType.emailAddress,
                                  style: GoogleFonts.inter(
                                    color: Colors.white,
                                    fontSize: 11.5,
                                  ),
                                  cursorColor: kCherryRed,
                                  decoration: _inputDecoration(
                                    hintText: 'you@business.com',
                                  ),
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return 'Enter your email';
                                    }
                                    if (!value.contains('@') ||
                                        !value.contains('.')) {
                                      return 'Enter a valid email';
                                    }
                                    return null;
                                  },
                                ),

                                const SizedBox(height: 13),

                                // ── Password field ───────────────────────────
                                _fieldLabel('Password'),
                                const SizedBox(height: 5),
                                TextFormField(
                                  controller: _passwordController,
                                  autovalidateMode: AutovalidateMode.onUserInteraction,
                                  obscureText: _obscurePassword,
                                  style: GoogleFonts.inter(
                                    color: Colors.white,
                                    fontSize: 11.5,
                                  ),
                                  cursorColor: kCherryRed,
                                  decoration: _inputDecoration(
                                    hintText: '••••••••',
                                    suffixIcon: IconButton(
                                      iconSize: 16,
                                      icon: Icon(
                                        _obscurePassword
                                            ? Icons.visibility_off_outlined
                                            : Icons.visibility_outlined,
                                        color: kMutedText,
                                        size: 16,
                                      ),
                                      onPressed: () {
                                        setState(
                                          () =>
                                              _obscurePassword =
                                                  !_obscurePassword,
                                        );
                                      },
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Enter your password';
                                    }
                                    if (value.length < 6) {
                                      return 'At least 6 characters';
                                    }
                                    return null;
                                  },
                                ),

                                const SizedBox(height: 10),

                                // "Forgot password?" link
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: GestureDetector(
                                    onTap: () {},
                                    child: Text(
                                      'Forgot password?',
                                      style: GoogleFonts.inter(
                                        color: kCherryRed,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ),

                                const SizedBox(height: 20),

                                // ── Sign in button ───────────────────────────
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: kAccentWhite,
                                      foregroundColor: kBlack,
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 11,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      elevation: 0,
                                    ),
                                    onPressed: () {
                                      if (_formKey.currentState!.validate()) {}
                                    },
                                    child: Text(
                                      'Sign In',
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ),
                                ),

                                const SizedBox(height: 16),

                                // Divider
                                Row(
                                  children: [
                                    Expanded(
                                      child: Divider(
                                        color: Colors.white.withOpacity(0.08),
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                      ),
                                      child: Text(
                                        'or',
                                        style: GoogleFonts.inter(
                                          color: kMutedText,
                                          fontSize: 9.5,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Divider(
                                        color: Colors.white.withOpacity(0.08),
                                      ),
                                    ),
                                  ],
                                ),

                                const SizedBox(height: 16),

                                // "Don't have an account? Sign up"
                                Center(
                                  child: GestureDetector(
                                    onTap: () {
                                      Navigator.pushNamed(context, '/signup');
                                    },
                                    child: RichText(
                                      text: TextSpan(
                                        style: GoogleFonts.inter(
                                          color: kMutedText,
                                          fontSize: 10,
                                        ),
                                        children: const [
                                          TextSpan(
                                            text: "Don't have an account? ",
                                          ),
                                          TextSpan(
                                            text: 'Sign up',
                                            style: TextStyle(
                                              color: kCherryRed,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Bottom spacer to keep the form centered
                          const SizedBox(height: 10),
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

  Widget _fieldLabel(String text) {
    return Text(
      text,
      style: GoogleFonts.inter(
        color: Colors.white.withOpacity(0.85),
        fontSize: 10,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String hintText,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: GoogleFonts.inter(color: kMutedText, fontSize: 11.5),
      filled: true,
      fillColor: Colors.white.withOpacity(0.04),
      suffixIcon: suffixIcon,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 10,
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kCherryRed, width: 1.2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: kCherryRed.withOpacity(0.9), width: 1),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kCherryRed, width: 1.2),
      ),
      errorStyle: GoogleFonts.inter(
        color: const Color(0xFFE08A8A),
        fontSize: 9.5,
      ),
    );
  }
}