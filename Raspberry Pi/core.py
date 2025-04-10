import time
import board
import busio
import adafruit_adxl34x
import RPi.GPIO as GPIO
import pyttsx3
from threading import Lock
import requests
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import datetime
import serial
import pynmea2
from subprocess import Popen, PIPE
import cv2
import subprocess

accelerometer = None

# Initialize TTS engine
engine = pyttsx3.init()
speak_lock = Lock()

def speak(message):
    
 try:
    subprocess.run(['festival', '--tts'], input=message.encode('utf-8'))
 except Exception as e:
    print(e)

# MongoDB Atlas setup
mongo_uri = "############################################################"
client = MongoClient(mongo_uri, server_api=ServerApi('1'))
db_collection = client.ThirdEye.fallinfos

try:
    client.admin.command('ping')
    print("Connected to MongoDB successfully!")
    speak("Third Eye start")

except Exception as e:
    print(f"MongoDB connection error: {e}")

# Telegram bot setup
TELEGRAM_BOT_TOKEN = '#####################################'
TELEGRAM_CHAT_ID = '#########'

# GPIO setup
BUTTON_PIN = 20
GPIO.setmode(GPIO.BCM)
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Constants
SHORT_PRESS_TIME = 1
LONG_PRESS_TIME = 2
FALL_RESPONSE_TIME = 30

# State variables
fall_counter = 0
button_pressed_time = None
button_held = False
waiting_for_response = False
fall_event_start_time = None
object_detection_process = None


def initialize_accelerometer():
    global accelerometer
    try:
        i2c = busio.I2C(board.SCL, board.SDA)
        accelerometer = adafruit_adxl34x.ADXL345(i2c)
        accelerometer.enable_freefall_detection(threshold=13)
        print("Accelerometer initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize accelerometer: {e}")
        accelerometer = None  # Reset accelerometer to None if initialization fails

initialize_accelerometer()

def capture_image():
    camera = cv2.VideoCapture(0)

    try:
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        
        if not camera.isOpened():
            raise Exception("Camera error: Unable to access the camera.")
        
        ret, frame = camera.read()
        if ret:
            filename = f"/home/manzim/Desktop/AlertImage/{timestamp}.jpg"
            cv2.imwrite(filename, frame)
            print(f"Image saved: {filename}")
            return filename
        else:
            raise Exception("Camera error: Failed to capture image.")
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        camera.release()


def send_telegram_message(message):
    image_path = capture_image()
    if not image_path:
        print("No image captured, skipping Telegram message.")
        return

    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto'
    payload = {'chat_id': TELEGRAM_CHAT_ID, 'caption': message}  # 'caption' for text with photo
    
    try:
        # Open the image file and send the message with the image
        with open(image_path, 'rb') as photo:
            files = {'photo': photo}  # Only photo here
            response = requests.post(url, data=payload, files=files)
            response.raise_for_status()  # Check for HTTP errors

            # Check if the response from Telegram is successful
            if response.status_code == 200:
                print("Telegram message with image sent successfully.")
            else:
                print(f"Failed to send message. Status code: {response.status_code}")
                print(response.text)
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")





def location():
    port = "/dev/ttyAMA0"
    ser = serial.Serial(port, baudrate=9600, timeout=0.5)
    dataout = pynmea2.NMEAStreamReader()
    newdata = ser.readline()
    n_data = newdata.decode('latin-1')

    if n_data[0:6] == '$GPRMC':  # Check for GPRMC data
        
            newmsg = pynmea2.parse(n_data)
            lat = newmsg.latitude
            lng = newmsg.longitude

            # Replace values if they are 0.0
            if lat == 0.0 and lng == 0.0:
                lat = 3.128222667540568
                lng = 101.65084074047078
        
            return f"https://www.google.com/maps?q={lat},{lng}"

def handle_fall_event():
    global fall_counter, waiting_for_response, fall_event_start_time
    fall_counter = 0
    waiting_for_response = True
    fall_event_start_time = time.time()
    speak("Are you okay? Press the button for 7 seconds if you are okay.")

def start_object_detection():
    """Start object detection script."""
    global object_detection_process
    if object_detection_process is None:
        object_detection_process = Popen(
            ["python3", "/home/user/Desktop/fyp/main.py", "--modeldir", "/home/user/Desktop/fyp/custom_model_lite", "--edgetpu"],
            stdout=PIPE, stderr=PIPE
        )
        print(f"Object detection started with PID: {object_detection_process.pid}")
        speak("Camera Open")

        
def stop_object_detection():
    """Stop object detection script."""
    global object_detection_process
    if object_detection_process is not None:
        object_detection_process.terminate()
        object_detection_process.wait()
        print("Object detection process stopped.")
        speak("Camera close")
        object_detection_process = None

def confirm_fall_event():
    global waiting_for_response
    print("No response received. Confirming fall event.")
    speak("No response detected. Sending alert to family.")
    user_location = location()
    #send_telegram_message(f"Fall detected! No response from the user. Current location: {user_location}")
    send_telegram_message(f"Fall detected! No response from the user. Current location: https://www.google.com/maps?q=3.12053,101.63984")

    try:
        db_collection.replace_one({'fallstatus': False}, {'fallstatus': True})
        print("MongoDB updated successfully.")
        time.sleep(10)  # Simulate delay
        db_collection.replace_one({'fallstatus': True}, {'fallstatus': False})
        print("fallstatus reset to False.")
    except Exception as e:
        print(f"MongoDB update error: {e}")

    waiting_for_response = False

try:
    while True:
        if accelerometer is None:
         print("Accelerometer not available, attempting to reinitialize.")
         initialize_accelerometer()  # Reattempt initialization if failed
         time.sleep(10)  # Delay before retrying (e.g., 10 seconds)
         continue  # Skip the rest of the loop and check again after the delay
        try:
           if accelerometer.events["freefall"] and not waiting_for_response:
            print("Fall detected!")
            fall_counter += 1
            if fall_counter >= 5:
             handle_fall_event()
             
        except Exception as e:
         print(f"Error handling accelerometer freefall event: {e}")

        if waiting_for_response:
            if time.time() - fall_event_start_time >= FALL_RESPONSE_TIME:
                confirm_fall_event()

        button_state = GPIO.input(BUTTON_PIN)
        if button_state == GPIO.LOW:
            if not button_held:
                button_held = True
                button_pressed_time = time.time()
        else:
            if button_held:
                press_duration = time.time() - button_pressed_time

                if press_duration >= LONG_PRESS_TIME and waiting_for_response:
                    print("Long press detected. User is okay.")
                    speak("Acknowledged. Stay safe.")
                    waiting_for_response = False
                elif press_duration >= SHORT_PRESS_TIME and not waiting_for_response:
                    if object_detection_process is None:
                        print("Short press detected. Starting object detection.")
                        start_object_detection()
                        button_pressed_time = None  # Reset timing
                    elif object_detection_process is not None:
                        print("Short press detected. Stopping object detection.")
                        stop_object_detection()
                        button_pressed_time = None 
                    

                button_held = False

        time.sleep(0.1)

except KeyboardInterrupt:
    print("Program terminated.")
finally:
    GPIO.cleanup()
