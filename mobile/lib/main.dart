// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_app/pages/audits.dart';
import 'pages/splash.dart'; // new splash screen
import 'pages/home.dart';
import 'pages/about.dart';
import 'pages/register.dart';
import 'pages/signin.dart';
import 'pages/signup.dart';
import 'pages/inventory.dart';
import 'pages/pos.dart';
import 'pages/stockMovementPage.dart';
import 'pages/suppliersPage.dart';
import 'pages/orders.dart';

void main() {
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    initialRoute: '/splash', // app now opens on the splash screen first
    routes: {
      '/splash': (context) => const Splash(), // splash — shows for 5 seconds
      '/': (context) => const Home(),          // your existing home page
      '/about': (context) => const About(),
      '/register': (context) => const Register(),
      '/signin': (context) => const SignIn(),
      '/signup': (context) => const SignUp(),
      '/inventory': (context) => const Inventory(),
      '/pos': (context) => const Pos(),
      '/stockMovementPage': (context) => const StockMovementPage(),
      '/suppliersPageState': (context) => const SuppliersPage(),
      '/orders': (context) => const OrdersPage(),
    },
  ));
}