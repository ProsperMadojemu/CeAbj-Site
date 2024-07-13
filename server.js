const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { secure: process.env.NODE_ENV === 'production',  
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to database"))
    .catch(err => console.log("Error connecting to database", err));

// Routes
app.get('/', (req, res) => {
    res.send('Hello World');
});

// STREAM APP INI
// Authentication for RTMP streaming
app.post('/auth', (req, res) => {
    const streamkey = req.query.key || req.body.key;
    if (streamkey === 'prosper') {
        res.status(200).send('OK');
    } else {
        res.status(403).send('Forbidden');
    }
});



// Register route
app.post('/register', async (req, res) => {
    try {
        const transformedData = transformFormData(req.body);

        // Check if email or phone number already exists
        const existingUser = await Users.findOne({
            $or: [
                { Email: transformedData.Email },
                { PhoneNumber: transformedData.PhoneNumber }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email or phone number already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(transformedData.Password, 10);
        transformedData.Password = hashedPassword;

        const userFields = {
            Email: transformedData.Email,
            FirstName: transformedData.FirstName,
            LastName: transformedData.LastName,
            PhoneNumber: transformedData.PhoneNumber,
            Country: transformedData.Country,
            Church: transformedData.Church,
            Password: transformedData.Password,
            registrationDate: transformedData.registrationDate
        };

        const churchFields = {
            FirstName: transformedData.FirstName,
            LastName: transformedData.LastName,
            Church: transformedData.Church,
            Position: transformedData.Position,
            NameOfCell: transformedData.NameOfCell,
            Department: transformedData.Department,
            Zone: transformedData.Zone,
            NameOfChurch: transformedData.NameOfChurch,
        };

        const newUser = new Users(userFields);
        const newChurchDetails = new UsersChurch(churchFields);

        await newUser.save();
        await newChurchDetails.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { usersinput, userspassword } = req.body;

        // Find user in database
        const user = await Users.findOne({ Email: usersinput });
        if (!user) {
            return res.status(404).json({ error: "Information does not match" });
        }

        // Validate password using bcryptjs
        const isPasswordValid = await bcrypt.compare(userspassword, user.Password);
        if (isPasswordValid) {
            req.session.user = {
                id: user._id,
                firstName: user.FirstName,
                lastName: user.LastName,
                email: user.Email
            };
            return res.status(200).json({ message: "Login successful" });
        } else {
            return res.status(401).json({ error: "Invalid password" });
        }

    } catch (error) {
        return res.status(500).json({ error: "Login error" });
    }
});

// Checking session route
app.get('/check-session', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

app.use((req, res, next) => {
    if (req.session.user) {
        req.session.touch();
    }
    next();
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Data transformation function
const fieldMapping = {
    mail: 'Email',
    fname: 'FirstName',
    lname: 'LastName',
    phone: 'PhoneNumber',
    country: 'Country',
    churches: 'Church',
    pass: 'Password',
    churchName: 'NameOfChurch',
    roles: 'Position',
    zone: 'Zone',
    departments: 'Department',
    cellName: 'NameOfCell'
};

function transformFormData(formData) {
    const transformedData = {};
    for (const oldField in fieldMapping) {
        const newField = fieldMapping[oldField];
        transformedData[newField] = formData[oldField];
    }
    return transformedData;
}

// Schemas
const userSchema = new mongoose.Schema({
    Email: String,
    FirstName: String,
    LastName: String,
    PhoneNumber: String,
    Country: String,
    Church: String,
    Password: String,
    registrationDate: {
        type: Date,
        default: Date.now
    }
});

const userChurchSchema = new mongoose.Schema({
    FirstName: String,
    LastName: String,
    Church: String,
    Position: String,
    NameOfCell: String,
    Department: String,
    Zone: String,
    NameOfChurch: String
});

// Models
const Users = mongoose.model("users", userSchema);
const UsersChurch = mongoose.model("usersChurchDetails", userChurchSchema);