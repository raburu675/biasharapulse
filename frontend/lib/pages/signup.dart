// lib/pages/signup.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Brand colors — BiasharaPulse Light Utility & Navy Hybrid System
const kOffWhiteCanvas = Color(0xFFFAFAFA);
const kCharcoalHeading = Color(0xFF121212);
const kNavyBlue = Color(0xFF10254A);
const kCardSurface = Color(0xFFF4F4F5);
const kBorderSubtle = Color(0xFFE4E4E7);
const kMutedText = Color(0xFF71717A);
const kCherryRed = Color(0xFFB0142B);

class SignUp extends StatefulWidget {
  const SignUp({super.key});

  @override
  State<SignUp> createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  final _formKey = GlobalKey<FormState>();

  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kOffWhiteCanvas,
      body: LayoutBuilder(
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
                              color: kCharcoalHeading,
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
                              color: kCharcoalHeading,
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
                            // Logo text with updated sizing
                            Center(
                              child: RichText(
                                text: TextSpan(
                                  style: GoogleFonts.orbitron(
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.8,
                                  ),
                                  children: const [
                                    TextSpan(
                                      text: 'biashara',
                                      style: TextStyle(
                                        color: kCharcoalHeading,
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
                            ),

                            const SizedBox(height: 24),

                            // Page heading
                            Text(
                              'Create account',
                              style: GoogleFonts.orbitron(
                                color: kCharcoalHeading,
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Set up your account to get started',
                              style: GoogleFonts.inter(
                                color: kMutedText,
                                fontSize: 10,
                              ),
                            ),

                            const SizedBox(height: 20),

                            // ── Username field ────────────────────────
                            _fieldLabel('Username'),
                            const SizedBox(height: 5),
                            TextFormField(
                              controller: _usernameController,
                              autovalidateMode:
                                  AutovalidateMode.onUserInteraction,
                              style: GoogleFonts.inter(
                                color: kCharcoalHeading,
                                fontSize: 11.5,
                              ),
                              cursorColor: kNavyBlue,
                              decoration: _inputDecoration(
                                hintText: 'yourusername',
                              ),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Enter a username';
                                }
                                if (value.trim().length < 3) {
                                  return 'At least 3 characters';
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: 12),

                            // ── Email field ────────────────────────────
                            _fieldLabel('Email'),
                            const SizedBox(height: 5),
                            TextFormField(
                              controller: _emailController,
                              autovalidateMode:
                                  AutovalidateMode.onUserInteraction,
                              keyboardType: TextInputType.emailAddress,
                              style: GoogleFonts.inter(
                                color: kCharcoalHeading,
                                fontSize: 11.5,
                              ),
                              cursorColor: kNavyBlue,
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

                            const SizedBox(height: 12),

                            // ── Password field ─────────────────────────
                            _fieldLabel('Password'),
                            const SizedBox(height: 5),
                            TextFormField(
                              controller: _passwordController,
                              autovalidateMode:
                                  AutovalidateMode.onUserInteraction,
                              obscureText: _obscurePassword,
                              style: GoogleFonts.inter(
                                color: kCharcoalHeading,
                                fontSize: 11.5,
                              ),
                              cursorColor: kNavyBlue,
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
                                          _obscurePassword = !_obscurePassword,
                                    );
                                  },
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Enter a password';
                                }
                                if (value.length < 6) {
                                  return 'At least 6 characters';
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: 12),

                            // ── Confirm password field ─────────────────
                            _fieldLabel('Confirm password'),
                            const SizedBox(height: 5),
                            TextFormField(
                              controller: _confirmPasswordController,
                              autovalidateMode:
                                  AutovalidateMode.onUserInteraction,
                              obscureText: _obscureConfirmPassword,
                              style: GoogleFonts.inter(
                                color: kCharcoalHeading,
                                fontSize: 11.5,
                              ),
                              cursorColor: kNavyBlue,
                              decoration: _inputDecoration(
                                hintText: '••••••••',
                                suffixIcon: IconButton(
                                  iconSize: 16,
                                  icon: Icon(
                                    _obscureConfirmPassword
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                    color: kMutedText,
                                    size: 16,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscureConfirmPassword =
                                          !_obscureConfirmPassword;
                                    });
                                  },
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Confirm your password';
                                }
                                if (value != _passwordController.text) {
                                  return 'Passwords do not match';
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: 18),

                            // ── Sign up button ─────────────────────────
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: kNavyBlue,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
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
                                  'Create account',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 14),

                            // Divider
                            Row(
                              children: [
                                const Expanded(
                                  child: Divider(
                                    color: kBorderSubtle,
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
                                const Expanded(
                                  child: Divider(
                                    color: kBorderSubtle,
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 14),

                            // "Login with email" button
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: kNavyBlue,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  side: const BorderSide(
                                    color: kNavyBlue,
                                    width: 1.2,
                                  ),
                                ),
                                onPressed: () {
                                  Navigator.pushNamed(context, '/signin');
                                },
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(
                                      Icons.mail_outline,
                                      size: 14,
                                      color: kNavyBlue,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Login with email',
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            const SizedBox(height: 14),

                            // "Already have an account? Sign in" link
                            Center(
                              child: GestureDetector(
                                onTap: () {
                                  Navigator.pushNamed(context, '/signin');
                                },
                                child: RichText(
                                  text: TextSpan(
                                    style: GoogleFonts.inter(
                                      color: kMutedText,
                                      fontSize: 10,
                                    ),
                                    children: const [
                                      TextSpan(
                                        text: 'Already have an account? ',
                                      ),
                                      TextSpan(
                                        text: 'Sign in',
                                        style: TextStyle(
                                          color: kNavyBlue,
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

                      // Bottom spacer to keep alignment consistent
                      const SizedBox(height: 10),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _fieldLabel(String text) {
    return Text(
      text,
      style: GoogleFonts.inter(
        color: kCharcoalHeading,
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
      fillColor: kCardSurface,
      suffixIcon: suffixIcon,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 10,
      ),
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
        borderSide: const BorderSide(color: kNavyBlue, width: 1.2),
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
        color: kCherryRed,
        fontSize: 9.5,
      ),
    );
  }
}