const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');  // Add bcrypt for password hashing comparison
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { parse } = require('fast-csv');
const { Parser } = require('json2csv');


const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
  "#############################",
  {
    dbName: 'ThirdEye',
  }
).then(() => {
  console.log("Connected to Database");
}).catch((err) => {
  console.log("Not Connected to Database!", err);
});

const AdminModel = mongoose.model('admins', new mongoose.Schema({}, { strict: false }));
const SensorModel = mongoose.model('monitors', new mongoose.Schema({}, { strict: false }));
const LocationModel = mongoose.model('locations', new mongoose.Schema({}, { strict: false }));
const LoginModel = mongoose.model('userdetails', new mongoose.Schema({}, { strict: false }));
const CurLocationModel = mongoose.model('currentlocations', new mongoose.Schema({}, { strict: false }));
const Alertmodel= mongoose.model('alerts', new mongoose.Schema({}, { strict: false }));
const FreeFall = mongoose.model('fallinfos', new mongoose.Schema({}, { strict: false }));

// POST route to add a new user
app.post('/AddUser', async (req, res) => {
  const { Device, Password, ChatID } = req.body;

  if (!Device || !Password) {
    return res.status(400).json({ message: 'Device and Password are required' });
  }

  try {
    // Check if the user already exists
    const existingUser = await LoginModel.findOne({ Device });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create a new user in the 'userdetails' collection
    const newUser = new LoginModel({
      Device,
      Password: hashedPassword,
      ChatID,
    });

    await newUser.save();

    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});


app.get('/SensorValue', async (req, res) => {
  const SensorValue = await SensorModel.find();
  res.json(SensorValue);
});

app.get('/Curlocation', async (req, res) => {
  const LocationValue = await CurLocationModel.find();
  res.json(LocationValue);
});

app.get('/FreeFall', async (req, res) => {
  console.log('Received request on /FreeFall');
  try {
    const FallStatus = await FreeFall.find();
    console.log('FallStatus:', FallStatus);
    res.json(FallStatus);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


app.post('/login', async (req, res) => {
  const { Device, Password } = req.body;

  try {
    // Check if user exists
    const user = await LoginModel.findOne({ Device });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare hashed password with bcrypt
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, 'Aiman', { expiresIn: '1h' });


    // Return success message
    res.json({ token, message: 'Login successful' });

  } catch (error) {
    console.error('Error during login:', error);  // Log the error for debugging
    res.status(500).json({ error: 'Server error' });
  }
}
);


app.post('/loginAD', async (req, res) => {
  const { Username, Password } = req.body;

  try {
    // Check if user exists
    const user = await AdminModel.findOne({ Username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare hashed password with bcrypt
    if (Password !== user.Password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, 'Aiman', { expiresIn: '1h' });


    // Return success message
    res.json({ token, message: 'Login successful' });

  } catch (error) {
    console.error('Error during login:', error);  // Log the error for debugging
    res.status(500).json({ error: 'Server error' });
  }
}
);

app.get('/generateReport', async (req, res) => {
  try {
    // Fetch the last 100 readings from MongoDB
    const data = await SensorModel.find().sort({ timestamp: -1 }).limit(1000);
    const formattedData = data.map((entry) => ({
      Time: entry.timestamp,
      BloodPressure: entry.BloodPressure,
      OxygenLevel: entry.OxygenLevel,
    }));

    // Convert the data to CSV format
    const fields = ['Time', 'BloodPressure', 'OxygenLevel'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedData);

    // Set response headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment('HealthReport.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.get('/HealthMonitor', async(req,res) => {

    try{
      const data = await SensorModel.find().sort({timestamp : -1}).limit(10)
      res.json(data.reverse())
    }

    catch{
       res.status(500).json({error : 'Failed to fetch data'})
    }

}) 

const JWT_SECRET = 'Aiman';  // Define the secret key

app.post('/verify-token', (req, res) => {
    const token = req.body.token;
  
    if (!token) {
      return res.status(400).json({ valid: false });
    }
  
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ valid: true, userId: decoded.userId });
    } catch (error) {
      res.status(401).json({ valid: false }); 
    }
});

app.get('/locationHistory', async (req, res) => {
  try {
    const LocationValue = await LocationModel.find();
    res.json(LocationValue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location data' });
  }
});

app.get('/alertsHistory', async (req, res) => {
  try {
    // Fetch the alerts from MongoDB, sorting them in descending order by timestamp
    const alerts = await Alertmodel.find().sort({ timeStamp: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).send('Internal Server Error');
  }
});

const API_KEY = "#############################"; // Your API key
const PROJECT_ID = "#######################"; // Your project ID

app.post('/analyze', async (req, res) => {
  try {
    // Fetch the last 10 records from MongoDB
    const data = await SensorModel.find().sort({ timestamp: -1 }).limit(10);

    // Prepare data for Jamaibase row add request
    let rowData = {};

    // Dynamically map each data from MongoDB to columns Data1, Data2, ...
    data.reverse().forEach((record, index) => {
      // Name each column dynamically (e.g., Data1, Data2, ...)
      const columnName = `Data${index + 1}`;
      rowData[columnName] = `${record.BloodPressure},${record.OxygenLevel}`; // Combine BloodPressure and OxygenLevel
    });

    // Jamaibase API endpoint and payload
    const jamaibasePayload = {
      tableId: 'Analyze', // The table name where you want to add the row
      data: rowData, // The dynamic row data
    };

    // Send the request to Jamaibase API
    try {
      const response = await jamai.table.addRow({
          table_type: "action",
          table_id: "Analyze",
          data: [
              {
                  age: 30,
                  height_in_centimeters: 170,
                  weight_in_kg: 60
              }
          ],
          reindex: null,
          concurrent: false
      });
      console.log("response: ", response);
  } catch (err) {
      console.error(err.message);
  }

    // Respond back with the Jamaibase response
    res.json({ output: response.data });
  } catch (error) {
    console.error('Error during Jamaibase row add:', error);
    res.status(500).json({ error: 'Failed to add row to Jamaibase' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
