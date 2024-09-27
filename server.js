import "dotenv/config";
import express from "express";
import { fileURLToPath } from 'url';
import path from 'path';
import cors from "cors";
import dbConnection from "./dbConnection.js";
import session from "express-session";
import MongoDBSession from "connect-mongodb-session"; 
import userRouter from "./routes/usersRoute.js";
import chartRouter from "./routes/chartRoute.js";
import commentsRouter from "./routes/commentsRoute.js";
import cellsRouter from "./routes/cellsandleadersRoute.js";
import reportsRouter from "./routes/cellReportsRoute.js";
import adminRouter from "./routes/adminRoute.js";
import streamRouter from "./routes/streamRoute.js";
import messagesRouter from "./routes/messagesRoute.js";
import { scheduleWebMessages, weeklyEmails } from "./controllers/scheduleController.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MongoDBStore = MongoDBSession(session); 
const app = express();
dbConnection();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const store = new MongoDBStore({
uri: process.env.MONGODB_URI,
collection: "sessions",
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: store,
        cookie: {
            // secure: true, // or true if you're using HTTPS
            sameSite: 'strict', // or 'strict' depending on your requirements
            httpOnly: false,
            maxAge: 7 * 24 * 60 * 60 * 1000 
        }
    })
);
app.use((req, res, next) => {
    if (req.session.user) {
        req.session.touch();
    }
    next();
});

// Page Routes
app.get('/', (req,res)=> {
    res.sendFile(path.join(__dirname,'public', 'pages', 'home', 'index.html'));
})
app.get('/watch', (req, res)=> {
    res.sendFile(path.join(__dirname,'public', 'pages', 'watch', 'watch.html'));
})
app.get('/login', (req,res)=> {
    res.sendFile(path.join(__dirname,'public', 'pages', 'login', 'login.html'));
})
app.get('/register', (req,res)=> {
    res.sendFile(path.join(__dirname,'public', 'pages', 'register', 'register.html'));
})
app.get('/dashboard/edit-profile', (req,res)=> {
    res.sendFile(path.join(__dirname,'public', 'dashboard', 'edit-profile', 'edit-profile.html'));
})
app.get('/dashboard/submit-report', (req,res)=> {
    res.sendFile(path.join(__dirname,'public', 'dashboard', 'submit-report', 'submit-report.html'));
})
app.get('/dashboard/messages', (req,res)=> {
    res.sendFile(path.join(__dirname,'public', 'dashboard', 'messages', 'messages.html'));
})
app.get('/admin/overview', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'overview', 'overview.html'));
});
app.get('/admin/schedule-service', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'schedule-service', 'schedule-service.html'));
});
app.get('/admin/messages', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'messages', 'messages.html'));
});
app.get('/admin/souls-won', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'souls-won', 'souls-won.html'));
});
app.get('/admin/view-users', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'view-users', 'view-users.html'));
});
app.get('/admin/view-cells-leaders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'view-cell-leaders', 'view-cells-leaders.html'));
});
app.get('/admin/view-cell-reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'view-cell-reports', 'view-cell-reports.html'));
});
app.get('/admin/addacell', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'addacell', 'addacell.html'));
});

// main();
// Timed Functionx
scheduleWebMessages();
weeklyEmails();
// API ENDPOINTS
app.use(userRouter);
app.use(chartRouter);
app.use(commentsRouter);
app.use(cellsRouter);
app.use(reportsRouter);
app.use(adminRouter);
app.use(streamRouter);
app.use("/images",express.static('uploads'))
app.use(messagesRouter);
app.get('/check-session', (req, res) => {
    if (req.session.user) {
        req.session.touch();
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});