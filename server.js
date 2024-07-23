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
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const adminCheck = (req, res, next) => {
    if (req.session.user && req.session.user.userType === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admins Only' });
    }
};

// Database connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to database"))
    .catch(err => console.log("Error connecting to database", err));

// Page Routes
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

// COMMENT SECTION ROUTE
let comments = [];

app.get('/comments', (req, res) => {
    res.json(comments);
});

app.post('/comments', (req, res) => {
    const comment = req.body;
    comment.timestamp = new Date().toISOString();
    comments.push(comment);
    res.status(201).json(comment);
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
    roles: 'Title',
    zones: 'Zone',
    departments: 'Department',
    cellName: 'NameOfCell',
    Position: 'LeadershipPosition'
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
    Title: String,
    FirstName: String,
    LastName: String,
    PhoneNumber: String,
    Country: String,
    LeadershipPosition: String,
    Church: String,
    Password: String,
    registrationDate: {
        type: Date,
        default: Date.now
    },
    userType: {
        type: String,
        default: "Default"
    }
});

const userChurchSchema = new mongoose.Schema({
    Email: String,
    FirstName: String,
    LastName: String,
    Church: String,
    LeadershipPosition: String,
    NameOfCell: String,
    Department: String,
    Zone: String,
});

const cellReportSchema = new mongoose.Schema({
    FirstName: String,
    LastName: String,
    CellName: String,
    ServiceAttendance: String,
    SundayFirstTimers: String,
    CellMeetingAttendance: String,
    CellFirstTimers: String,
    offering: String,
    SubmissionDate: {
        type: Date,
        default: Date.now
    }
});

const newCellSchema = new mongoose.Schema({
    NameOfLeader: String, 
    LeaderPosition: String,
    CellType: String,
    NameOfPcf: String,
    NameOfSeniorCell: String,
    NameOfCell: String,
    SubmissionDate: {
        type: Date,
        default: Date.now
    }
})

// Models
const Users = mongoose.model("users", userSchema);
const UsersChurch = mongoose.model("usersChurchDetails", userChurchSchema);
const usersCellReport = mongoose.model("cellreports", cellReportSchema);
const newCell = mongoose.model("Cells and Leaders", newCellSchema)
// Report Submission route
app.post('/submitcellreport', async (req, res) => {
    try {
        const {
            FirstName,
            LastName,
            CellName,
            ServiceAttendance,
            SundayFirstTimers,
            CellMeetingAttendance,
            CellFirstTimers,
            offering,
            SubmissionDate
        } = req.body;

        const reportField = {
            FirstName,
            LastName,
            CellName,
            ServiceAttendance,
            SundayFirstTimers,
            CellMeetingAttendance,
            CellFirstTimers,
            offering,
            SubmissionDate
        };

        const newCellReport = new usersCellReport(reportField);
        await newCellReport.save();
        res.status(201).json({ message: 'Report submitted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post ('/submitnewcell', async (req, res) => {
    try {
        const {
            NameOfLeader,
            LeaderPosition,
            CellType,
            NameOfPcf,
            NameOfSeniorCell,
            NameOfCell,
            SubmissionDate
        } = req.body;

        const newCellsField = {
            NameOfLeader,
            LeaderPosition,
            CellType,
            NameOfPcf,
            NameOfSeniorCell,
            NameOfCell,
            SubmissionDate
        }

        const existingCell = await newCell.findOne({
            $or: [
                { NameOfLeader: NameOfLeader },
                {NameOfCell: NameOfCell}
            ]
        });

        if (existingCell) {
            return res.status(400).json({ error: 'Cell Already Exists' });
        }
         
        const submittedCells = new newCell(newCellsField);
        await submittedCells.save();
        res.status(201).json({ message: 'Cell Saved successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Register route
app.post('/register', async (req, res) => {
    try {
        const transformedData = transformFormData(req.body);

        // Checking if email or phone number already exists
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
            Title: transformedData.Title,
            FirstName: transformedData.FirstName,
            LastName: transformedData.LastName,
            PhoneNumber: transformedData.PhoneNumber,
            Country: transformedData.Country,
            Church: transformedData.Church,
            LeadershipPosition: transformedData.LeadershipPosition,
            Password: transformedData.Password,
            registrationDate: transformedData.registrationDate,
            userType: transformedData.userType
        };

        const churchFields = {
            Email: transformedData.Email,
            FirstName: transformedData.FirstName,
            LastName: transformedData.LastName,
            Church: transformedData.Church,
            LeadershipPosition: transformedData.LeadershipPosition,
            NameOfCell: transformedData.NameOfCell,
            Department: transformedData.Department,
            Zone: transformedData.Zone,
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
                email: user.Email,
                userType: user.userType // Add userType to the session
            };
            if (user.userType === 'admin') {
                res.json({ redirectUrl: '../admin/overview.html' });
            } else {
                res.json({ redirectUrl: '../dashboard/edit-profile.html' });
            }
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

// Get data from all collections
app.get('/getalldata', async (req, res) => {
    try {
        const usersData = await Users.find({});
        const usersChurchData = await UsersChurch.find({});
        res.json({ users: usersData, usersChurch: usersChurchData });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
});

app.get('/pcfleaders', async (req, res) => {
    try {
        const pcfLeadersData = await newCell.aggregate([
            {
                $group: {
                    _id: "$NameOfPcf"
                }
            },
            {
                $project: {
                    _id: 0,
                    NameOfPcf: "$_id"
                }
            }
        ]);
        res.json({ cells: pcfLeadersData });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
});

app.get('/seniorcell-leaders', async (req, res) => {
    try {

        const seniorCellLeadersData = await newCell.aggregate([
            {
                $match: {
                    NameOfSeniorCell: { $nin: ["", " "] }
                }
            },
            {
                $group: {
                    _id: "$NameOfSeniorCell"
                }
            },
            {
                $project: {
                    _id: 0,
                    NameOfSeniorCell: "$_id"
                }
            }
        ]);
        res.json({ cells: seniorCellLeadersData });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
});


app.get('/cell-leaders', async (req, res) => {
    try {

        const CellLeadersData = await newCell.aggregate([
            {
                $match: {
                    NameOfCell: { $nin: ["", " "] }
                }
            },
            {
                $group: {
                    _id: "$NameOfCell"
                }
            },
            {
                $project: {
                    _id: 0,
                    NameOfSeniorCell: "$_id"
                }
            }
        ]);
        res.json({ cells: CellLeadersData });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
});


// Update user route
app.post('/updateuser', async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.email) {
            return res.status(401).json({ error: 'User not logged in' });
        }

        const email = req.session.user.email; //last email shoudl be spelt {email} not {Email}
        const updateFields = req.body;


        const updatedUser = await Users.findOneAndUpdate(
            { Email: email },
            { $set: updateFields },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }


        const userChurchDetails = await UsersChurch.findOneAndUpdate(
            { Email: email },
            { $set: updateFields },
            { new: true }
        );

        if (!userChurchDetails) {
            return res.status(404).json({ error: 'User church details not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use((req, res, next) => {
    if (req.session.user) {
        req.session.touch();
    }
    next();
});


// Admin User Route
app.get('/admin', adminCheck, (req, res) => {
    res.send('Welcome Admin');
});


// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
