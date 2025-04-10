import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:intl/intl.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:fl_chart/fl_chart.dart';


class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  bool isPanelVisible = false;

  final List<Widget> _pages = [
    const HomeContent(),
    const LocationHistoryScreen(),
     HealthMonitorPage(),
  ];

  // Logout function
  Future<void> handleLogout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/');
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Third Eye',
          style: TextStyle(fontFamily: 'Orbitron', fontWeight: FontWeight.bold, fontSize: 30, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF380E0E),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: handleLogout,
          ),
          IconButton(
            icon: Image.asset(
              '/Users/user/StudioProjects/Third_Eye/assets/icon/menus.png',
              height: 24,
              width: 24,
            ),
            onPressed: () => setState(() => isPanelVisible = !isPanelVisible),
          ),
        ],
      ),
      body: Stack(
        children: [
          _pages[_selectedIndex],
          if (isPanelVisible)
            Align(
              alignment: Alignment.topLeft,
              child: Container(
                padding: const EdgeInsets.all(15),
                color: Colors.grey[200],
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Device Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const Text('Device Name: X123456'),
                    const Text('User Name: Sifulan Bin Sifulan'),
                    const Text('User Disability: Visual Impaired'),
                    const Text('Chat ID: Group_001'),
                    const SizedBox(height: 10),
                  ],
                ),
              ),
            ),
        ],
      ),
      backgroundColor: const Color(0xFF380E0E), // Change this to any color you want
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Colors.blueAccent,
        unselectedItemColor: Colors.grey,
        backgroundColor: Colors.black, // Change this to any color you want
        items: [
          BottomNavigationBarItem(
            icon: Image.asset('/Users/user/StudioProjects/Third_Eye/assets/icon/house.png', height: 24, width: 24),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Image.asset('/Users/user/StudioProjects/Third_Eye/assets/icon/location-pin.png', height: 24, width: 24),
            label: 'Location History',
          ),
          BottomNavigationBarItem(
            icon: Image.asset('/Users/user/StudioProjects/Third_Eye/assets/icon/health-monitoring.png', height: 24, width: 24),
            label: 'Health Monitor',
          ),
          BottomNavigationBarItem(
            icon: Image.asset('/Users/user/StudioProjects/Third_Eye/assets/icon/camera.png', height: 24, width: 24),
            label: 'Stream Video',
          ),

        ],
      ),
    );
  }
}

class HomeContent extends StatefulWidget {
  const HomeContent({super.key});

  @override
  _HomeContentState createState() => _HomeContentState();
}

class _HomeContentState extends State<HomeContent> {
  Map<String, dynamic> sensor = {
    'BloodPressure': 0,
    'OxygenLevel': 0,
    'updated': '',
  };

  List<dynamic> location = [];
  String fallStatus = 'true';

  // Fetch health data
  Future<void> fetchHealthData() async {
    try {
      final response = await http.get(Uri.parse('http://localhost:3001/SensorValue'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          sensor = {
            'OxygenLevel': data[0]['OxygenLevel'],
            'BloodPressure': data[0]['BloodPressure'],
            'updated': DateTime.now().toLocal().toString(),
          };
        });
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error fetching health data: $error')),
      );
    }
  }

  // Fetch fall status
  Future<void> fetchStatus() async {
    try {
      final response = await http.get(Uri.parse('http://localhost:3001/FreeFall'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          fallStatus = data[0]['fallstatus'] == true ? 'true' : 'false';
        });
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error fetching fall status: $error')),
      );

    }
  }

  // Fetch location data
  Future<void> fetchLocationData() async {
    try {
      final response = await http.get(Uri.parse('http://localhost:3001/Curlocation'));
      if (response.statusCode == 200) {
        setState(() {
          location = jsonDecode(response.body);
        });
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error fetching location data: $error')),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    fetchHealthData();
    fetchStatus();
    fetchLocationData();

    // Polling every 5 minutes
    Timer.periodic(Duration(minutes: 5), (timer) {
      fetchHealthData();
      fetchStatus();
      fetchLocationData();
    });
  }

  Widget _buildStatusBox(String title, String value, {Widget? icon, String? fontFamily, FontWeight? fontWeight}) {
    return Column(
      children: [
        icon ?? Icon(Icons.help, size: 40, color: Colors.blueAccent),
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: fontWeight ?? FontWeight.normal,
            fontFamily: fontFamily ?? 'Roboto',
          ),
        ),
        Text(
          value,
          style: TextStyle(fontSize: 16, color: Colors.black54),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Header section
      Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        children: const [
          Text(
            'Your safety, our priority',
            style: TextStyle(fontFamily: 'Orbitron', fontWeight: FontWeight.bold, fontSize: 20, color: Colors.white),
          ),
          SizedBox(height: 15),
        ],
      ),
    ),


    // Real-time Monitor Section
            Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: const Color(0xFF650006), // Hex color #650006
                borderRadius: BorderRadius.circular(15),  // Optional: Rounded corners
                boxShadow: [
                  BoxShadow(
                    color: Colors.black26,  // Optional: Adding a slight shadow for depth
                    blurRadius: 5,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const Text('Real-time Monitor', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 15, width: 10,),

                  // Refresh button
                  ElevatedButton(
                    onPressed: () {
                      fetchHealthData();
                      fetchStatus();
                      fetchLocationData();
                    },
                    child: const Text('Refresh Data'),
                  ),
                  const SizedBox(height: 15),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      // Heart Rate Box
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.deepOrangeAccent,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 5,
                              offset: Offset(0, 3),
                            ),
                          ],
                        ),
                        child: _buildStatusBox(
                          'Heart Rate',
                          sensor['BloodPressure'].toString(),
                          icon: Image.asset('/Users/user/StudioProjects/Third_Eye/assets/icon/blood-pressure.png', height: 24, width: 24),
                          fontFamily: 'Orbitron',
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      // Oxygen Level Box
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.deepOrangeAccent,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 5,
                              offset: Offset(0, 3),
                            ),
                          ],
                        ),
                        child: _buildStatusBox(
                          'Oxygen Lvl',
                          sensor['OxygenLevel'].toString(),
                          icon: Image.asset('/Users/user/StudioProjects/Third_Eye/assets/icon/oxygen-saturation.png', height: 24, width: 24),
                          fontFamily: 'Orbitron',
                          fontWeight: FontWeight.bold,

                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

// Fall Status Box
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 5,
                          offset: Offset(0, 3),
                        ),
                      ],
                    ),
                    child: _buildStatusBox(
                      'Fall Status',
                      fallStatus,
                      icon: Image.asset('/Users/user/StudioProjects/Third_Eye/assets/icon/falling-down.png', height: 24, width: 24),
                      fontFamily: 'Orbitron',
                      fontWeight: FontWeight.bold,
                    ),
                  ),


                  const SizedBox(height: 10),
                  Text(
                    'Last Updated: ${DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.parse(sensor['updated']))}',
                    style: TextStyle(color: Colors.white70),
                  ),
                ],
              ),
            ),


            const SizedBox(height: 20),

            // Current Location Section

          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: const Color(0xFF650006), // Hex color #650006
              borderRadius: BorderRadius.circular(15), // Optional: Rounded corners
              boxShadow: [
                BoxShadow(
                  color: Colors.black26, // Optional: Adding a slight shadow for depth
                  blurRadius: 5,
                  offset: Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              children: [
                const Text(
                  'Current Location',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 10),
                for (var loc in location)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5),
                    child: SizedBox(
                      height: 350,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: WebViewWidget(
                          controller: WebViewController()
                            ..setJavaScriptMode(JavaScriptMode.unrestricted)
                            ..setBackgroundColor(const Color(0x00000000))
                            ..loadRequest(Uri.parse('https://www.google.com/maps?q=${loc['Latitude']},${loc['Longitude']}')),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          )



        ],
      ),
    );
  }
}

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
  final TextEditingController dateController = TextEditingController();

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

  Future<String> getFormattedLocation(double latitude, double longitude) async {
    const String apiKey = 'd4163c34db9c4d6f83276315d0e01682';
    final url =
        'https://api.opencagedata.com/geocode/v1/json?q=$latitude%2C$longitude&key=$apiKey';
    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final components = data['results'][0]['components'];
        final road = components['road'] ?? 'Unknown road';
        final suburb = components['suburb'] ?? 'Unknown suburb';
        final postcode = components['postcode'] ?? 'Unknown postcode';
        final state = components['state'] ?? 'Unknown state';
        final country = components['country'] ?? 'Unknown country';
        return '$road, $suburb, $postcode, $state, $country';
      } else {
        throw Exception('Failed to fetch location information');
      }
    } catch (e) {
      print('Error fetching location information: $e');
      return 'Error fetching location';
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
        title: const Text(
          'Location History',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 25, color: Colors.black),
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
                  child: TextFormField(
                    controller: dateController,
                    readOnly: true,
                    decoration: const InputDecoration(
                      labelText: 'Select a date',
                      border: OutlineInputBorder(),
                      suffixIcon: Icon(Icons.calendar_today),
                    ),
                    onTap: () async {
                      final DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(2000),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null && picked != selectedDate) {
                        setState(() {
                          selectedDate = picked;
                          dateController.text = DateFormat('yyyy-MM-dd').format(picked);
                        });
                      }
                    },
                  ),
                ),
                const SizedBox(width: 8),
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
                  final timestamp = DateTime.parse(loc['timestamp']).toLocal();
                  double latitude = double.parse(loc['Latitude']);
                  double longitude = double.parse(loc['Longitude']);

                  return Card(
                    color: Colors.black38, // Set background color
                    child: FutureBuilder<String>(
                      future: getFormattedLocation(latitude, longitude),
                      builder: (context, snapshot) {
                        return ListTile(
                          onTap: () {
                            final String googleMapsUrl =
                                'https://www.google.com/maps?q=$latitude,$longitude';
                            launchUrl(Uri.parse(googleMapsUrl));
                          },
                          title: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    Icons.access_time,
                                    size: 16,
                                    color: Colors.green, // Set icon color here
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    DateFormat('yyyy-MM-dd').format(timestamp),
                                    style: TextStyle(
                                      color: Colors.white, // Set text color here
                                      shadows: [
                                        Shadow(
                                          offset: Offset(0, 0),
                                          blurRadius: 10.0,
                                          color: Colors.yellow.withOpacity(0.7), // Glow color
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(
                                    Icons.access_time,
                                    size: 16,
                                    color: Colors.green, // Set icon color here
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    DateFormat('HH:mm:ss').format(timestamp),
                                    style: TextStyle(
                                      color: Colors.white, // Set text color here
                                      shadows: [
                                        Shadow(
                                          offset: Offset(0, 0),
                                          blurRadius: 10.0,
                                          color: Colors.yellow.withOpacity(0.7), // Glow color
                                        ),
                                      ],
                                    ),
                                  ),
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
                                  const Icon(
                                    Icons.location_on,
                                    size: 16,
                                    color: Colors.red, // Icon color
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      snapshot.data ?? 'Loading location...',
                                      style: TextStyle(
                                        color: Colors.white, // Text color
                                        shadows: [
                                          Shadow(
                                            offset: Offset(0, 0),
                                            blurRadius: 10.0,
                                            color: Colors.blue.withOpacity(0.7), // Glow color
                                          ),
                                        ],
                                      ),
                                      softWrap: true,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
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


class HealthMonitorPage extends StatefulWidget {
  const HealthMonitorPage({super.key});

  @override
  _HealthMonitorPageState createState() => _HealthMonitorPageState();
}

class _HealthMonitorPageState extends State<HealthMonitorPage> {
  List<Map<String, dynamic>> sensorData = [];

  @override
  void initState() {
    super.initState();
    fetchSensorData();
  }

  Future<void> fetchSensorData() async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:3001/HealthMonitor'),
      );
      if (response.statusCode == 200) {
        final data = List<Map<String, dynamic>>.from(jsonDecode(response.body));
        setState(() {
          sensorData = data.map((item) {
            return {
              'time': DateTime.parse(item['timestamp']).toLocal(),
              'BloodPressure': item['BloodPressure']?.toDouble() ?? 0.0,
              'OxygenLevel': item['OxygenLevel']?.toDouble() ?? 0.0,
            };
          }).toList();
        });
      } else {
        throw Exception('Failed to fetch sensor data. Status code: ${response.statusCode}');
      }
    } catch (error) {
      print('Error fetching sensor data: $error');
    }
  }

  List<FlSpot> _getSpots(String key) {
    return sensorData.asMap().entries.map((entry) {
      int index = entry.key;
      double value = entry.value[key] ?? 0.0;
      return FlSpot(index.toDouble(), value);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Health Monitoring',
          style: TextStyle( fontWeight: FontWeight.bold, fontSize: 25, color: Colors.black),
        ),      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [

            SizedBox(height: 10),
            // Legend for the graph
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildIndicator(Colors.red, "Blood Pressure"),
                SizedBox(width: 10),
                _buildIndicator(Colors.blue, "Oxygen Level"),
              ],
            ),
            SizedBox(height: 20),
            Expanded(
              child: LineChart(
                LineChartData(
                  lineBarsData: [
                    LineChartBarData(
                      spots: sensorData.asMap().entries.map((entry) {
                        // Parse BloodPressure safely
                        final bloodPressure = double.tryParse(entry.value['BloodPressure'].toString()) ?? 0.0;
                        return FlSpot(entry.key.toDouble(), bloodPressure);
                      }).toList(),
                      isCurved: true,
                      color: Colors.red, // Set color for Blood Pressure
                      dotData: FlDotData(show: false),
                    ),
                    LineChartBarData(
                      spots: sensorData.asMap().entries.map((entry) {
                        // Parse OxygenLevel safely
                        final oxygenLevel = double.tryParse(entry.value['OxygenLevel'].toString()) ?? 0.0;
                        return FlSpot(entry.key.toDouble(), oxygenLevel);
                      }).toList(),
                      isCurved: true,
                      color: Colors.blue, // Set color for Oxygen Level
                      dotData: FlDotData(show: false),
                    ),

                  ],

                  titlesData: FlTitlesData(
                    rightTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false), // Remove left labels
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false), // Remove bottom labels
                    ),

                  ),


                  lineTouchData: LineTouchData(
                    touchTooltipData: LineTouchTooltipData(
                      tooltipBorder: BorderSide(color: Colors.white, width: 1), // Tooltip border color
                      tooltipRoundedRadius: 8, // Rounded corners for the tooltip
                      getTooltipItems: (touchedSpots) {
                        return touchedSpots.map((spot) {
                          int index = spot.x.toInt();
                          final time = sensorData[index]['time'];
                          final isBloodPressure = spot.barIndex == 0;
                          final label = isBloodPressure ? "Blood Pressure" : "Oxygen Level";
                          final value = spot.y.toStringAsFixed(1);
                          return LineTooltipItem(
                            '$label\nValue: $value\nTime: ${time.toString().substring(11, 16)}',
                            const TextStyle(color: Colors.white, fontSize: 12),
                          );
                        }).toList();
                      },
                    ),
                  ),
                ),
              ),
            ),

          ],
        ),
      ),
    );
  }

  Widget _buildIndicator(Color color, String text) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color,
          ),
        ),
        SizedBox(width: 5),
        Text(
          text,
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}