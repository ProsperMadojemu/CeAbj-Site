import "dotenv/config";
import express from "express";
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import http from "http";
import { fileURLToPath } from "url";
import path from "path";
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
import meetingRouter from "./routes/meetingRoute.js";
import {
    scheduleWebMessages,
    weeklyEmails,
} from "./controllers/scheduleController.js";
import { allowMeetingAccess } from "./controllers/meetingController.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MongoDBStore = MongoDBSession(session);
const app = express();
dbConnection();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: "sessions",
});

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        sameSite: "strict",
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
});

app.use(sessionMiddleware);
app.use((req, res, next) => {
    if (req.session.user) {
        req.session.touch();
    }
    next();
});

// Page Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "home", "index.html"));
});
app.get("/watch", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "watch", "watch.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "login", "login.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "pages", "register", "register.html")
    );
});
app.get("/dashboard/edit-profile", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "dashboard",
            "edit-profile",
            "edit-profile.html"
        )
    );
});
app.get("/dashboard/submit-report", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "dashboard",
            "submit-report",
            "submit-report.html"
        )
    );
});
app.get("/dashboard/messages", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "dashboard", "messages", "messages.html")
    );
});
app.get("/admin/overview", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "admin", "overview", "overview.html")
    );
});
app.get("/admin/live-service", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "admin",
            "schedule-service",
            "schedule-service.html"
        )
    );
});
app.get("/admin/messages", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "admin", "messages", "messages.html")
    );
});
app.get("/admin/souls-won", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "admin", "souls-won", "souls-won.html")
    );
});
app.get("/admin/view-users", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "admin", "view-users", "view-users.html")
    );
});
app.get("/admin/view-cells-leaders", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "admin",
            "view-cell-leaders",
            "view-cells-leaders.html"
        )
    );
});
app.get("/admin/view-cell-reports", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "admin",
            "view-cell-reports",
            "view-cell-reports.html"
        )
    );
});
app.get("/admin/addacell", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "admin", "addacell", "addacell.html")
    );
});
app.get("/admin/watch", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "admin", "templates", "watch.html")
    );
});
// like the admin change the way session is checked and verified it should ne done server side like the admin
scheduleWebMessages();
weeklyEmails();
app.use(meetingRouter);
app.use(userRouter);
app.use(chartRouter);
app.use(commentsRouter);
app.use(cellsRouter);
app.use(reportsRouter);
app.use(adminRouter);
app.use(streamRouter);
app.use("/images", express.static("uploads"));
app.use(messagesRouter);
app.get("/check-session", (req, res) => {
    if (req.session.user) {
        req.session.touch();
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: "User not logged in" });
    }
});

//Web socket setup

const server = http.createServer(app);
const wss = new WebSocketServer({ server });


let connectedClients = []; //  users ws array for realtime numbers analysis
let participantData = { peak: 0, users: [] }; // peak users values

// Middleware wrapping function for session access
const wrapMiddlewareForWs = (middleware) => (ws, req) =>
    new Promise((resolve, reject) => {
    middleware(req, {}, (err) => {
        if (err) return reject(err);
        resolve();
    });
});

// Websockets dont usually have access to session data hence the middleware wrapper

wss.on("connection", async (ws, req) => {
    try {
        // session middleware for WebSocket
        await wrapMiddlewareForWs(sessionMiddleware)(ws, req);
        
        //returns and closes connection if user isnt logged in
        if (!req.session.user || !req.session.user.email) {
            ws.send(JSON.stringify({ error: "User not logged in" }));
            ws.close();
            return;
        }

        const userEmail = req.session.user.email; // session email
        const fullName = `${req.session.user.firstName} ${req.session.user.lastName}`;
        console.log(`WebSocket connected for ${userEmail}.`); //logs

        // verifies if new users email is already attached
        const isUserConnected = connectedClients.some(
            (client) => client.email === userEmail
        );
        
        // checks if condition is false
        if (!isUserConnected) {

            //if false push realtime data to the connectedClients array
            connectedClients.push({ ws, email: userEmail });
            console.log(`User ${userEmail} added to connected clients.`);

            // checks if users email is not already in the participant data object array
            if (!participantData.users.some((user) => user.email === userEmail)) {
                // adds the user that isnt present
                participantData.users.push({ email: userEmail, name: fullName });
                console.log(`User ${fullName} (email: ${userEmail}) added to participant list.`);
            }
            console.log(connectedClients.length);
        }

        // if the length of the connected clients are greater than the peak value of the participants value 
        if (connectedClients.length > participantData.peak) {
            // update peak value
            participantData.peak = connectedClients.length;
        }
        updateAdminWithParticipantInfo(); // function to update users with realtime values
        console.log('realtime length:',connectedClients.length, participantData);
        
        ws.on('close', () => { // on close event
            // removes the client when client refreshes or leaves 
            connectedClients = connectedClients.filter(
                (client) => client.ws !== ws
            );
            updateAdminWithParticipantInfo(); // function to update users with realtime values
            console.log(`User ${userEmail} removed from connected clients., connected clients: ${connectedClients.length}`);
            console.log(participantData);
            
        });

    } catch (error) {
        console.error("Error handling WebSocket session:", error);
        ws.close();
    }
});




// function handleMeetingEnd() {
//     meeting.findByIdAndUpdate(meetingId, {
//       peakViews: participantData.peak,
//       participants: participantData.users,
//     });

//     // Reset data
//     participantData = { peak: 0, users: [] };
//   }

function updateAdminWithParticipantInfo() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    type: "update",
                    participants: connectedClients.length,
                    names: participantData.users,
                })
            );
        }
    });
}

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
