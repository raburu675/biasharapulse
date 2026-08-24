// lib/services/dashboard_service.dart

import 'dart:convert'; // for jsonDecode
import 'package:http/http.dart' as http; // for http.get

class DashboardService {
  // Django server address
  static const String baseUrl = 'http://127.0.0.1:8000';

  // Fetches dashboard data for one business
  static Future<Map<String, dynamic>> fetchSummary(int businessId) async {
    // Build the URL and send the request
    final response = await http.get(
      Uri.parse('$baseUrl/api/dashboard/$businessId/summary/'),
    );

    // 200 = success
    if (response.statusCode == 200) {
      // Turn the JSON text into a Dart Map
      return jsonDecode(response.body);
    } else {
      // Something went wrong — let inventory.dart's catch block handle it
      throw Exception('Failed to load dashboard data');
    }
  }

  // Fetches the stock movement log for one business (NEW)
  static Future<Map<String, dynamic>> fetchStockMovements(int businessId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/dashboard/$businessId/stock-movements/'),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load stock movements');
    }
  }

   // NEW: logs a manual stock adjustment (Stock In or Waste/Damage) — hits
  // the same endpoint as fetchStockMovements, just via POST instead of GET.
  // Updates product.stock_count on the backend AND creates the audit log
  // row, in one call — see stock_movements() in views.py.
  static Future<Map<String, dynamic>> logStockMovement({
    required int businessId,
    required int productId,
    required String movementType, // 'stock_in' or 'waste_damage'
    required int quantityChange,
    String note = '',
  }) async {
    final uri = Uri.parse('$baseUrl/api/dashboard/$businessId/stock-movements/');
 
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'product_id': productId,
        'movement_type': movementType,
        'quantity_change': quantityChange,
        'note': note,
      }),
    );
 
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(body['error'] ?? 'Failed to log stock movement');
    }
  }
  
}