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
}