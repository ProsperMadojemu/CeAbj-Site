const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dbConnection = require('./dbConnection');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
const app = express();

// Middleware
dbConnection();
app.use(cors());

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
        httpOnly: true
    }
}));

const hashPassword = async (plainTextPassword) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainTextPassword, salt);
};

(async () => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const hashedPassword = await hashPassword(adminPassword);
    // console.log('Hashed Admin Password:', hashedPassword);
})();




const adminCheck = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
    res.status(403).json({ error: 'Access denied. Admins only' });
  }
};

const unauthorizedAccess = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    next();
};  

// Page Routes
app.get('/', (req, res) => {
    res.send('Hello World');
});



// STREAM APP INI
// Authentication for RTMP streaming
app.post('/auth', (req, res) => {
    const streamkey = req.query.key || req.body.key;
    if (streamkey === process.env.STREAM_KEY ) {
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

const adminSchema = new mongoose.Schema({
    email: String,
    password: String,
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
    PhoneNumber: String,
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
const newCell = mongoose.model("cellsAndLeaders", newCellSchema);
const Admin = mongoose.model('Admin', adminSchema);

const checkAndCreateAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD is not set in environment variables.");
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const admin = await Admin.findOne({ email: adminEmail });

        if (!admin) {
            // If no admin exists, create one
            const newAdmin = new Admin({
                email: adminEmail,
                password: hashedPassword,
            });
            
            await newAdmin.save();
            console.log('Admin user created.');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('An error occurred while checking or creating the admin:', error);
    }
};

// Invoke the function
checkAndCreateAdmin();


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
            PhoneNumber,
            LeaderPosition,
            CellType,
            NameOfPcf,
            NameOfSeniorCell,
            NameOfCell,
            SubmissionDate
        } = req.body;

        const newCellsField = {
            NameOfLeader,
            PhoneNumber,
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
                { NameOfCell: NameOfCell },
                { PhoneNumber: PhoneNumber }

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

        const admin = await Admin.findOne({ email: usersinput });
        if (admin) {
            const isPasswordValid = await bcrypt.compare(userspassword, admin.password);
            if (isPasswordValid && admin.email === process.env.ADMIN_EMAIL) {
                req.session.user = {
                    email: admin.email,
                    isAdmin: true,
                    userType: 'admin'
                };
                return res.json({ redirectUrl: '../admin/overview.html' });
            } else {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
        }
            const user = await Users.findOne({ Email: usersinput });
        if (!user) {
            console.log(`Failed login attempt with email: ${usersinput}`);
            return res.status(404).json({ error: 'Information does not match' });
        }

        const isPasswordValid = await bcrypt.compare(userspassword, user.Password);
        if (isPasswordValid) {
            req.session.user = {
                id: user._id,
                firstName: user.FirstName,
                lastName: user.LastName,
                email: user.Email,
                userType: user.userType
            };
            return res.json({ redirectUrl: '../dashboard/edit-profile.html' });
        } else {
            return res.status(401).json({ error: 'Invalid password' });
        }

    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Login error' });
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

app.get('/admin/', unauthorizedAccess, adminCheck, (req, res) => {
    res.send('Welcome to the Admin Dashboard');
});  

// Checking session route
app.get('/check-session', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});


// Getting data from all collections
app.get('/getalldata', async (req, res) => {
    try {
        const usersData = await Users.find(
            {},
            {
              Church: 1,
              Country: 1,
              Email: 1,
              FirstName: 1,
              LastName: 1,
              LeadershipPosition: 1,
              PhoneNumber: 1,
              registrationDate: 1,
              Title: 1,
              userType: 1,
              _id: 0
            }
          );
        const usersChurchData = await UsersChurch.find(
            {},
            {
              Church: 1,
              Department: 1,
              Email: 1,
              FirstName: 1,
              LastName: 1,
              LeadershipPosition: 1,
              NameOfCell: 1,
              Zone: 1,
              _id: 0
            }
        );

        const adminData = await Admin.find(
            {},
            { email: 1, _id: 0 }
        );

        res.json({ users: usersData, usersChurch: usersChurchData, admin: adminData});
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
});

app.get('/getleadersdata', async (req, res) => {
    try {
        const usersCellData = await newCell.find({});

        res.json({ cellsAndLeaders: usersCellData });
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

app.put ('/leadersSearch/:id', async (req, res) => {
    try {

        const leaderId = req.params.id;
        const updateFields = req.body;

        const updatedUser = await newCell.findByIdAndUpdate(
            leaderId,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
});

app.get('/leadersSearch', async (req, res) => {
    try {
        const searchTerm = req.query.q || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const regex = new RegExp(searchTerm, 'i');

        const searchCriteria = searchTerm ? {
            $or: [
                { NameOfLeader: regex },
                { PhoneNumber: regex },
                { LeaderPosition: regex },
                { CellType: regex },
                { NameOfCell: regex },
                { NameOfPcf: regex },
                { NameOfSeniorCell: regex },
            ]
        } : {};

        // Fetch leaders from the database with pagination
        const cellsAndLeaders = await newCell.find(searchCriteria, {
            NameOfLeader: 1,
            PhoneNumber: 1,
            LeaderPosition: 1,
            CellType: 1,
            NameOfCell: 1,
            NameOfPcf: 1,
            NameOfSeniorCell: 1,
            _id: 1
        })
        .skip((page - 1) * limit)
        .limit(limit);
        
        // Count total matching documents for pagination
        const totalUsers = await newCell.countDocuments(searchCriteria);
        
        res.json({
            cells: cellsAndLeaders,
            totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit) // Calculate total pages
        });

    } catch (error) {
        console.error("Error searching data:", error);
        res.status(500).json({ error: "Error searching data" });
    }
});

app.delete('/leadersSearch/:id', async (req, res) => {
    try {
        const leaderId = req.params.id;

        const result = await newCell.findByIdAndDelete(leaderId);

        if (!result) {
            return res.status(404).json({ error: "Leader not found" });
        }

        res.json({ message: "Leader deleted successfully" });
    } catch (error) {
        console.error("Error deleting leader:", error);
        res.status(500).json({ error: "Error deleting leader" });
    }
});



app.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.q || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const regex = new RegExp(searchTerm, 'i');

        const searchCriteria = searchTerm ? {
            $or: [
                { FirstName: regex },
                { LastName: regex },
                { Email: regex },
                { Church: regex },
                { NameOfCell: regex },
                { PhoneNumber: regex },
                { LeadershipPosition: regex },
                { Department: regex }
            ]
        } : {};

        // Fetch users from the database with pagination
        const users = await Users.find(searchCriteria, {
            _id: 0, 
            Email: 1, 
            FirstName: 1, 
            LastName: 1, 
            PhoneNumber: 1, 
            Church: 1, 
            LeadershipPosition: 1,
            Department: 1, 
            registrationDate: 1
        })
        .skip((page - 1) * limit)
        .limit(limit);

        // Count total matching documents for pagination
        const totalUsers = await Users.countDocuments(searchCriteria);

        // Fetch usersChurch data and create a map
        const usersChurchData = await UsersChurch.find({}, {
            Email: 1,
            NameOfCell: 1,
            Department: 1
        });

        const usersChurchMap = new Map(usersChurchData.map((uc) => [uc.Email, uc]));

        // Merge users with usersChurch data
        const mergedUsers = users.map((user) => {
            const userChurchInfo = usersChurchMap.get(user.Email) || {};
            return {
                ...user,
                NameOfCell: userChurchInfo.NameOfCell || 'N/A',
                Department: userChurchInfo.Department || 'N/A',
            };
        });
        // console.log('Merged Users:', mergedUsers);
        res.json({
            users: mergedUsers,
            totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit) // Calculate total pages
        });

    } catch (error) {
        console.error("Error searching data:", error);
        res.status(500).json({ error: "Error searching data" });
    }
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
