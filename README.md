# ThirdEye: An IoT-Based Assistive System for the Visually Impaired

> **Note:** "User" refers to the visually impaired individual wearing the system. "Web user" refers to family members or caretakers accessing the system via the web interface.

## 🧠 Overview

**ThirdEye** is an IoT-based wearable system I developed for my Final Year Project (FYP). This system integrates **Machine Learning (ML)** and **IoT** to assist visually impaired individuals in identifying environmental hazards—specifically **sharp** and **hot objects**.

What sets ThirdEye apart is its real-time alert system using **vibration motors** and **voice feedback**. For instance, when a hot object like a kettle is detected, the system says:

> “Hot object *kettle* detected, temperature is 50°C.”

To avoid false positives, a **thermal sensor** is used to verify whether the detected object is actually hot. Some objects, while commonly associated with heat (like a kettle), might not be hot at the moment—so thermal verification ensures accuracy before issuing an alert.

Powered by a **Raspberry Pi 4** and enhanced with a **Coral TPU accelerator**, ThirdEye delivers near-zero lag and maintains a strong frame rate during object detection. The system also includes **health monitoring sensors** to measure oxygen levels and heart rate in real-time, delivering alerts via **wireless earphones**. A **GPS module** provides real-time location tracking.

---

## 🚨 Fall Detection

ThirdEye also features **fall detection** using an **accelerometer**. When a fall is detected:

1. A **vibration motor** is triggered for 10 seconds to attempt to wake the user.
2. The system plays a **voice message**:  
   > “Are you okay? Please press the button for 5 seconds if you are okay.”
3. The user has 30 seconds to respond. If no input is received, the system assumes a fall event has occurred.
4. It updates the status in **MongoDB** and sends an **alert to a Telegram group** (configured for the user's family).
5. The alert includes:
   - **Current GPS location**
   - **Snapshot image** (as backup in case GPS fails)

---

## 🎥 Camera Control

To optimize battery usage, the system includes a **toggle button** that turns the camera on or off. Since object detection is not needed at all times (e.g., while relaxing or watching Netflix 😄), this helps conserve power.

---

## 👵 Not Just for the Visually Impaired

Though designed primarily for the visually impaired, **ThirdEye** is also suitable for **elderly individuals** who may suffer from reduced vision and are vulnerable to environmental hazards. Its health monitoring and fall detection features offer additional safety and peace of mind.

---

## 🧰 Hardware Requirements

- Raspberry Pi 4 (or higher)
- Thermal Sensor (GY-906)
- Accelerometer (ADXL345)
- Ultrasonic Sensor
- Health Sensor (MAX30100 for oxygen level and heart rate)
- Vibration Motor
- GPS Module (NEO-6M)
- Speaker Module (or use Bluetooth earphones)
- Button Module

🔧 For better understanding, refer to the **hardware architecture** diagram below:  
(*Insert your diagram here*)

🧭 System workflow:  
(*Insert your workflow diagram here*)

---

## 🤖 Object Detection Implementation

ThirdEye uses **TensorFlow Lite (TFLite)** for object detection due to its lightweight nature and compatibility with Raspberry Pi.

### Why Not YOLO?

I tested YOLOv8 and YOLOv9, which had better accuracy but significantly lower frame rates—making them unsuitable for real-time processing on Raspberry Pi.

### Dataset

I used datasets from [Roboflow Universe](https://universe.roboflow.com/), exported in **Pascal VOC XML** format compatible with TFLite.

### Training Resources

- [Training Notebook on Google Colab](https://colab.research.google.com/github/EdjeElectronics/TensorFlow-Lite-Object-Detection-on-Android-and-Raspberry-Pi/blob/master/Train_TFLite2_Object_Detction_Model.ipynb)
- [Video Tutorial](https://www.youtube.com/watch?v=XZ7FYAMCc4M)

---

## 🌐 ThirdEye Web Dashboard

The web dashboard includes the following pages:

### 🏠 Home

- Displays real-time sensor data:
  - Fall status
  - Oxygen level
  - Heart rate
  - User’s current location
  - Timestamp of last update

### 📈 History

- Shows past readings of oxygen level and heart rate.
- Useful for identifying long-term health issues.
- Allows generation of **health reports** for doctor consultation.
- Integrated with **JamAIBase** for data analytics:
  - Analyzes the last 1000 readings.
  - Suggests trends and warnings.
  - Helps explain fall incidents (e.g., sudden heart rate drop or oxygen level dip).

### 📹 Stream

- Allows family members to **live stream** the user’s camera view.
- Useful when helping the user find objects or if the user becomes lost.

### 🔔 Alert History

- Functions like a notification page.
- Shows all alerts sent to family members via Telegram.

---

## 📱 ThirdEye Mobile App

The mobile app mirrors the web dashboard with the same core features:

✅ Real-time data  
✅ Fall detection status  
✅ Alerts  
✅ GPS tracking  

🔻 However, **report generation and data analysis** are currently not available in the mobile version.

---

## 🔄 Running Services on Boot (Raspberry Pi Setup)

To ensure the system starts automatically on boot, I used **systemd services** instead of methods like `rc.local` or `cron`.

### Why systemd?

- More **flexible** and **scalable**
- Easier to **monitor logs** and **track errors**

> 📌 Make sure to create a `.service` file and enable it using:
```bash
sudo systemctl enable your-service-name.service
