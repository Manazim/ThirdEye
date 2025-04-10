# Overview

### Reminder: User refer to the blind people. The web user refer to the family of the blind people.

ThrdEye is an IOT project that I have develop during my FYP. The integration of Machine Learning and IOT, the system is primarily targeting blind people in helping them identify the hazard such as Sharp Object and Hot Object. Not stop till there this project was exetended it capability by giving realtime alert to the user(blind people) through vibrator and human voice.If the object is detected as hot object it will say for example "Hot object {kettle} detected, temperature is 50 celcius". To overcome the false positive, the thermal sesnor has been used for hot object only. When the hot object detetced, it will first check the temp first before give the warning. This is because the hot object detetcted based on the object not the actual event, sometimes the object is not hot but since it normally identiied as hot obejct so the Thirdeye model still dettct as hot.
Powering Raspi4 and enhancing with GPU coral TPU accelerator, this has facing almost 0 lag during testing and the framerate show a convincong number. Furthermore this system aslo atatched with the health monitoring sensor for sense oxygen level and heart rate of the user in real time. The user can hear the alert by using wireless earphone. The gps sensor also attached to track the user in real time.

Moreover this system also come with falling-detectio where I use accelerometer for the detection. Any user that are facing fall event will triggered the system. First it will vibrate the vibration motor module for about 10 seconds to wakeup the user. In the same time, the system will give the audio responsse to confirm the event. It will ask like this, "Are you okey, please press the button for 5 seconds if you are okey". It will give about 30 seconds for user to respond. If the suer not response in the interval time, it will consoder as fall event then update the status at mongodb . The alert will directly send to the family of the user in the Telegram group chat through Telegram bot. The alert message consist of the current location of the user(the blind people) and also the snap of image(incase the gps sensor not orking). The gps sensor also attached to track the user in real time.

Next, the same button also used to turn on/turn off the camera for obejct detection. This is for battery optimization. Always ope camera will cause the battery drain too fast. The needed to always open camera also less, not every time user will search for things, soemtimes they just relax an chill watching Netxlif xd.

Even this project mentioned primarily for the blind people, this sytem also can be use to goden citizen because most of them have problem with sight disability and vulnerable to the hazard. ALSO THIS SYTEM can monitor health of the user.

# Hardware Requiremnets:

- Raspberry Pi (atleast Pi 4) 
- Thermal sensor (GY-906)
- Accelerometer (ADXL 345)
- Ultrasonic sensor 
- Health sensor Oxygen Level and Heart rate (MAX30100)
- Vibration motor
- Gps sensor (GPS NEO-6M)
- Speaker module - Just optional may replace with bluetooth earphone
- Button

For beter understanding, you can refer the Hatdwrae architecture below:



# ThirdEye web

The web consist of Home page, where it display teh realtime readings of sensors such as fall event status, oxygen level, Heart rate, user current location and timestamp last data updated. Next for the history page, web user can see the past readings of the heart rate and oxygen level. This is crucial to idenitfy the health probblem of the user. THIS PAGE also can genertae of those readings and can be use to the doctor for further checkup. Moreover this page also integrated with JamAIBase for data analysis, It will analyze the past 1000 readings and give the result of data trend and suggestion to the family memebr of the user that suit for the user (the one that wear it). This
# Raspberry Pi setup for the service/sytem run during boot
