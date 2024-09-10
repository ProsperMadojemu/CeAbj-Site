import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
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

const MongoDBStore = MongoDBSession(session); 

const app = express();

dbConnection();

// Middleware setup
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const store = new MongoDBStore({
uri: process.env.MONGODB_URI,
collection: "sessions",
});

app.use(
    session({
        secret: "process.env.SESSION_SECRET",
        resave: false,
        saveUninitialized: true,
        store: store,
        cookie: {
            // secure: true, // or true if you're using HTTPS
            sameSite: 'strict', // or 'strict' depending on your requirements
            httpOnly: false,
        }
    })
);
app.use((req, res, next) => {
    if (req.session.user) {
        req.session.touch();
    }
    next();
});

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

// Server setup
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});