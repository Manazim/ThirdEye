import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'home.dart';



void main() {
  runApp(const MyApp());  // Add 'const' here
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});  // Add 'const' here too

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),

      },
    );
  }
}


class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _deviceController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String _message = '';

  Future<void> _handleLogin() async {
    final device = _deviceController.text.trim();
    final password = _passwordController.text.trim();

    if (device.isEmpty || password.isEmpty) {
      setState(() {
        _message = 'Device and Password are required';
      });
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('http://localhost:3001/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'Device': device,
          'Password': password,
        }),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final token = responseData['token'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);

        if (context.mounted) {
          Navigator.of(context).pushReplacementNamed('/home');
        }
      } else {
        setState(() {
          _message = 'Invalid credentials';
        });
      }
    } catch (error) {
      setState(() {
        _message = 'Login failed. Please try again.';
      });
    }
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFF1a2a6c), // #1a2a6c
              Color(0xFFb21f1f), // #b21f1f
              Color(0xFFfdbb2d), // #fdbb2d
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: Container(
            padding: const EdgeInsets.all(30),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.8), // Darken the container
              borderRadius: BorderRadius.circular(15),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Text(
                  'Welcome Back',
                  style: TextStyle(fontSize: 30, fontFamily: 'Orbitron', fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Login to access your account',
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.only(right: 230),  // Adjust the padding value as needed
                  child: const Text(
                    'Username',
                    style: TextStyle(fontSize: 16, color: Colors.white),
                  ),
                ),

                TextField(
                  controller: _deviceController,
                  decoration: const InputDecoration(
                    fillColor: Colors.white,
                    filled: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.all(Radius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(height: 15),

                Padding(
                  padding: const EdgeInsets.only(right: 230),  // Adjust the padding value as needed
                  child: const Text(
                    'Password',
                    style: TextStyle(fontSize: 16, color: Colors.white),
                  ),
                ),
                //textfield password
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    fillColor: Colors.white,
                    filled: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.all(Radius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[400], // Correct way to set button color
                    padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text('Login', style: TextStyle(fontSize: 18)),
                ),
                if (_message.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: Text(
                      _message,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                const SizedBox(height: 10),

              ],
            ),
          ),
        ),
      ),
    );
  }
}




