// lib/services/orders_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;

class OrdersService {
  // static const String _baseUrl = 'http://127.0.0.1:8000';
  static const String _baseUrl = 'https://biasharapulse-production.up.railway.app';

  static Future<Map<String, dynamic>> fetchOrders(int businessId) async {
    final uri = Uri.parse('$_baseUrl/api/orders/$businessId/');
    final response = await http.get(uri);

    if (response.statusCode != 200) {
      throw Exception('Failed to load orders (status ${response.statusCode})');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> updateOrderStatus({
    required int businessId,
    required int orderId,
    required String status, // 'pending' / 'processing' / 'shipped' / 'delivered' / 'cancelled'
  }) async {
    final uri = Uri.parse('$_baseUrl/api/orders/$businessId/$orderId/status/');
    final response = await http.patch(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'status': status}),
    );

    if (response.statusCode != 200) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(body['error'] ?? 'Failed to update order status');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}