// lib/services/product_service.dart
//
// Talks to the Django pos_summary endpoint and hands back raw JSON
// for pos.dart to turn into PosItem objects. Also posts new sales
// to the create_sale endpoint.

import 'dart:convert';
import 'package:http/http.dart' as http;

class ProductService {
  // TODO: point this at wherever your other services (e.g. dashboard) get
  // their base URL from — swap for your Railway URL, or LAN IP/ngrok
  // when testing on a physical device.
  // static const String _baseUrl = 'http://127.0.0.1:8000';
  static const String _baseUrl = 'https://biasharapulse-production.up.railway.app';

  static Future<Map<String, dynamic>> fetchPerformance(int businessId) async {
    final uri = Uri.parse('$_baseUrl/pos-summary/$businessId/');

    final response = await http.get(uri);

    if (response.statusCode != 200) {
      throw Exception(
        'Failed to load product performance (status ${response.statusCode})',
      );
    }

    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // Records a sale via create_sale. amount is calculated by Django itself
  // (product.price x quantity) — we only send product_id, quantity, and
  // payment_channel, never amount.
  //
  // NOTE: '/create-sale/$businessId/' is a guess to match the style of
  // '/pos-summary/$businessId/' above — confirm this against your actual
  // urls.py entry for create_sale and adjust if the path differs.
  static Future<Map<String, dynamic>> createSale({
    required int businessId,
    required int productId,
    required int quantity,
    required String paymentChannel,
  }) async {
    final uri = Uri.parse('$_baseUrl/create-sale/$businessId/');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'product_id': productId,
        'quantity': quantity,
        'payment_channel': paymentChannel,
      }),
    );

    if (response.statusCode != 201) {
      // Django sends back {'error': '...'} on failure (e.g. not enough stock)
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(body['error'] ?? 'Failed to record sale (status ${response.statusCode})');
    }

    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}