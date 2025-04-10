import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

class LocationHistoryScreen extends StatefulWidget {
  const LocationHistoryScreen({super.key});

  @override
  _LocationHistoryScreenState createState() => _LocationHistoryScreenState();
}

class _LocationHistoryScreenState extends State<LocationHistoryScreen> {
  List<Map<String, dynamic>> locationData = [];
  List<Map<String, dynamic>> filteredData = [];
  int currentPage = 1;
  final int itemsPerPage = 10;
  DateTime? selectedDate;

  @override
  void initState() {
    super.initState();
    fetchLocationData();
  }

  Future<void> fetchLocationData() async {
    const url = 'http://localhost:3001/locationHistory'; // Replace with your API endpoint
    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        final List<Map<String, dynamic>> sortedData = data
            .map((e) => e as Map<String, dynamic>)
            .toList()
          ..sort((a, b) {
            final dateA = DateTime.parse(a['timestamp']);
            final dateB = DateTime.parse(b['timestamp']);
            return dateB.compareTo(dateA);
          });
        setState(() {
          locationData = sortedData;
          filteredData = sortedData;
        });
      } else {
        throw Exception('Failed to load location data');
      }
    } catch (e) {
      print('Error fetching location data: $e');
    }
  }

  void filterData() {
    if (selectedDate == null) {
      setState(() {
        filteredData = locationData;
        currentPage = 1;
      });
    } else {
      setState(() {
        filteredData = locationData.where((loc) {
          final locDate = DateTime.parse(loc['timestamp']).toLocal();
          return DateFormat('yyyy-MM-dd').format(locDate) ==
              DateFormat('yyyy-MM-dd').format(selectedDate!);
        }).toList();
        currentPage = 1;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final int indexOfLastItem = currentPage * itemsPerPage;
    final int indexOfFirstItem = indexOfLastItem - itemsPerPage;
    final List<Map<String, dynamic>> currentData =
    filteredData.sublist(indexOfFirstItem,
        indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Location History'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Filter Section
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () async {
                      final DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(2000),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null && picked != selectedDate) {
                        setState(() {
                          selectedDate = picked;
                        });
                      }
                    },
                    child: Text(
                      selectedDate == null
                          ? 'Select Date'
                          : DateFormat('yyyy-MM-dd').format(selectedDate!),
                      style: const TextStyle(color: Colors.blue),
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: filterData,
                  child: const Text('Filter'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Location List
            Expanded(
              child: currentData.isNotEmpty
                  ? ListView.builder(
                itemCount: currentData.length,
                itemBuilder: (context, index) {
                  final loc = currentData[index];
                  final timestamp =
                  DateTime.parse(loc['timestamp']).toLocal();
                  return Card(
                    child: ListTile(
                      onTap: () {
                        final String googleMapsUrl =
                            'https://www.google.com/maps?q=${loc['Latitude']},${loc['Longitude']}';
                        launchUrl(Uri.parse(googleMapsUrl));
                      },
                      title: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.access_time, size: 16),
                              const SizedBox(width: 8),
                              Text(DateFormat('yyyy-MM-dd').format(timestamp)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.access_time, size: 16),
                              const SizedBox(width: 8),
                              Text(DateFormat('HH:mm:ss').format(timestamp)),
                            ],
                          ),
                        ],
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 16),
                              const SizedBox(width: 8),
                              Text('Lat: ${loc['Latitude']}'),
                            ],
                          ),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 16),
                              const SizedBox(width: 8),
                              Text('Lng: ${loc['Longitude']}'),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              )
                  : const Center(child: Text('No location data available')),
            ),
            const SizedBox(height: 16),
            // Pagination
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ElevatedButton(
                  onPressed: currentPage > 1
                      ? () {
                    setState(() {
                      currentPage--;
                    });
                  }
                      : null,
                  child: const Text('Previous'),
                ),
                ElevatedButton(
                  onPressed: indexOfLastItem < filteredData.length
                      ? () {
                    setState(() {
                      currentPage++;
                    });
                  }
                      : null,
                  child: const Text('Next'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
