import "dotenv/config";
import express from "express";
import http from "http";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import dbConnection from "./dbConnection.js";
import WebSocket, { WebSocketServer } from 'ws';
import userRouter from "./routes/usersRoute.js";
import chartRouter from "./routes/chartRoute.js";
import commentsRouter from "./routes/commentsRoute.js";
import cellsRouter from "./routes/cellsandleadersRoute.js";
import reportsRouter from "./routes/cellReportsRoute.js";
import adminRouter from "./routes/adminRoute.js";
import streamRouter from "./routes/streamRoute.js";
import messagesRouter from "./routes/messagesRoute.js";
import meetingRouter from "./routes/meetingRoute.js";
import pageRouter from "./routes/pageRoutes.js";
import sessionMiddleware from "./controllers/sessionMiddleware.js";
import {
    scheduleWebMessages,
    weeklyEmails,
} from "./controllers/scheduleController.js";
import setupWebSocket from "./controllers/webSockController.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dbConnection();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(sessionMiddleware);
app.use((req, res, next) => {
    if (req.session.user) {
        req.session.touch();
    }
    next();
});

// like the admin change the way session is checked and verified it should ne done server side like the admin
scheduleWebMessages();
weeklyEmails();
app.use(pageRouter)
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

const ws = new WebSocketServer({port: 8080})
const server = http.createServer(app);
ws.on('connection', (socket) => {
    console.log('New client connected to second WebSocket server');
    
    socket.on('message', (event) => {
        const message = JSON.parse(event);
        ws.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify({
                        message
                    })
                );
            }
        });
    });

    socket.on('close', () => {
        console.log('Client disconnected from second WebSocket server');
    });
});
setupWebSocket(server);

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
