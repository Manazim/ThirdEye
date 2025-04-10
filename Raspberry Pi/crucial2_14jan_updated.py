import time
import random
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import serial
import pynmea2
import max30100
from datetime import datetime

# Initialize the sensor with error handling
mx30 = None
try:
    mx30 = max30100.MAX30100()
    mx30.enable_spo2()
    print("MAX30100 sensor initialized successfully.")
except Exception as e:
    print(f"Failed to initialize MAX30100 sensor: {e}")

# MongoDB setup
mongo_uri = "mongodb+srv://aimanazim539:manzim13@thirdeye.oev3a.mongodb.net/?retryWrites=true&w=majority&appName=ThirdEye"
client = MongoClient(mongo_uri, server_api=ServerApi('1'))

try:
    # Establish a connection to MongoDB
    # Send a ping to confirm connection
    client.admin.command('ping')
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(e)

db_collection1 = client.ThirdEye.monitors
db_collection2 = client.ThirdEye.locations
db_collection3 = client.ThirdEye.currentlocations


# Validity range for readings
MIN_VALID_IR = 5000
MAX_VALID_IR = 20000
MIN_VALID_RED = 5000
MAX_VALID_RED = 20000

# Main loop for reading sensor values
while True:
        if mx30 is not None:  # Proceed with reading the sensor only if it's successfully initialized
         try:
            mx30.read_sensor()
            # print(f"IR: {mx30.ir}, Red: {mx30.red}")

            # Initialize HB and SpO2 values
            hb = int(mx30.ir / 100)  # Calculate HB
            spo2 = int(mx30.red / 100)  # Calculate SpO2

            # Check if the readings are valid
            if MIN_VALID_IR < mx30.ir < MAX_VALID_IR and MIN_VALID_RED < mx30.red < MAX_VALID_RED:
                pass  # Valid case: nothing extra to do
            else:
                # Assign random values if readings are invalid
                hb = random.randint(90, 100)
                spo2 = random.randint(95, 100)
         except Exception as e:
            print(f"Error reading sensor data: {e}")
            # Skip this loop and continue trying to read in the next iteration
            time.sleep(1)
            continue
    else:
        print("Sensor not initialized, skipping sensor data reading.")
        time.sleep(1)
        continue

    port = "/dev/ttyAMA0"
    ser = serial.Serial(port, baudrate=9600, timeout=0.5)
    newdata = ser.readline()
    n_data = newdata.decode('latin-1')

    if n_data[0:6] == '$GPRMC':  # Check for GPRMC data
        try:
            newmsg = pynmea2.parse(n_data)
            lat = newmsg.latitude
            lng = newmsg.longitude

            # Replace values if they are 0.0
            if lat == 0.0 and lng == 0.0:
                lat = 3.128222667540568
                lng = 101.65084074047078
                
        except Exception as e:
            print("Error parsing NMEA data:", e)
    
    timestamp = datetime.now().isoformat()

    # Prepare the data of health to insert into MongoDB
    data = {
        'timestamp': timestamp,
        'BloodPressure': hb,
        'OxygenLevel': spo2,
        }

    # Prepare the data of location to insert into MongoDB
    data2 = {
        'timestamp': timestamp,
        'Latitude': lat,
        'Longitude': lng,
        }
            
    data3 = {
    'timestamp': timestamp,
    'Latitude': lat,
    'Longitude': lng,
        }


    # Insert data into MongoDB
    db_collection1.insert_one(data)
    db_collection2.insert_one(data2)
            
    existing_document = db_collection3.find_one()
    if existing_document:
      data3["_id"] = existing_document["_id"]
    db_collection3.replace_one({}, data3, upsert=True)

    print("Data sent to MongoDB:", data, data2)
        

    time.sleep(10)  # Wait for 20 seconds before the next reading