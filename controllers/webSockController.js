import { WebSocketServer } from "ws";
import WebSocket from "ws";
import sessionMiddleware from "./sessionMiddleware.js";
import { fetchStats } from "./streamController.js";

let wss;
let connectedClients = []; // users ws array for realtime numbers analysis
let participantData = { peak: 0, users: [], comments: []}; // peak users values
let viewersDuration = 0; // total view duration (in seconds)
let FETCH_INTERVAL = 5000;
let stopFetching = false
const BACKOFF_INTERVAL = 300000;

// Middleware wrapping function for session access
const wrapMiddlewareForWs = (middleware) => (ws, req) =>
new Promise((resolve, reject) => {
    middleware(req, {}, (err) => {
        if (err) return reject(err);
        resolve();
    });
});

function throttle(fn, wait) {
    let isThrottling = false;
    return function (...args) {
        if (!isThrottling) {
            fn.apply(this, args);
            isThrottling = true;
            setTimeout(() => {
                isThrottling = false;
            }, wait);
        }
    };
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600); 
    const mins = Math.floor((seconds % 3600) / 60); 
    const secs = Math.floor(seconds % 60); 
    const formattedHrs = String(hrs).padStart(2, '0');
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${formattedHrs}:${formattedMins}:${formattedSecs}`;
}

const throttledUpdateAdminWithParticipantInfo = throttle(updateAdminWithParticipantInfo, 1000);

function updateComments () {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify ({
                    type: 'new-comment', 
                    comment: participantData.comments
                })
            )
        }
    });
}

function updateStats (stats) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify ({
                    type: 'stat-update', 
                    stats: stats
                })
            )
        }
    });
}


function updateAdminWithParticipantInfo() {
    let totalViewers = participantData.peak;
    const averageViewDuration = totalViewers > 0 ? formatTime(viewersDuration / totalViewers) : "00:00:00";
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    type: "update",
                    participants: connectedClients.length,
                    peakParticipants: participantData.peak,
                    names: participantData.users,
                    averageViewDuration: `${averageViewDuration}`
                })  
            );
        }
    });
}

const startFetching = () => {
    if (stopFetching) return
    setTimeout(async () => {
        stopFetching = false;
        const { stats, errorType } = await fetchStats();

        if (stats) {
            FETCH_INTERVAL = 5000;
            updateStats(stats);
        } else if (errorType === 'ENOTFOUND') {
            FETCH_INTERVAL = BACKOFF_INTERVAL;
            console.log(`Connection issue. Increasing interval to ${FETCH_INTERVAL / 1000} seconds.`);
        } else {
            FETCH_INTERVAL += 5000;
            console.log(`Data unchanged. Increasing interval to ${FETCH_INTERVAL / 1000} seconds.`);
        }
        startFetching();
    }, FETCH_INTERVAL);
};

const setupWebSocket = (server) =>{
    wss = new WebSocketServer({server})
    wss.on("connection", async (ws, req) => {
        try {
            await wrapMiddlewareForWs(sessionMiddleware)(ws, req);
            if (!req.session.user || !req.session.user.email) {
                ws.send(JSON.stringify({ error: "User not logged in" }));
                ws.close();
                return;
            }

            // Session data
            const userEmail = req.session.user.email;
            const fullName = `${req.session.user.firstName} ${req.session.user.lastName}`;

            const joinTime = Date.now();
            // console.log(`WebSocket connected for ${userEmail}.`);

            // verifies if new user's email is already attached
            const isUserConnected = connectedClients.some(
                (client) => client.email === userEmail
            );

            let duration = 0;

            // checks if condition is false
            if (!isUserConnected) {
                // if false, push real-time data to the connectedClients array
                connectedClients.push({ ws, email: userEmail, joinTime, duration});
                // console.log(`User ${userEmail} added to connected clients.`);
                // checks if user's email is not already in the participant data object array
                // console.log(connectedClients.length);
            } 
            if (!participantData.users.some((user) => user.email === userEmail)) {
                // adds the user that isn't present
                participantData.users.push({ email: userEmail, name: fullName, duration: duration, isOnline: true});
                // console.log(`User ${fullName} (email: ${userEmail}) added to participant list.`);
            }else {
                // console.log('condition met');
                duration = isUserConnected.duration
                const existingUser = participantData.users.find((user) => user.email === userEmail);
                if (existingUser) {
                    existingUser.isOnline = true;
                }
            }

            // if the length of the connected clients is greater than the peak value of the participant data
            if (connectedClients.length > participantData.peak) {
                // update peak value
                participantData.peak = connectedClients.length;
            }

            // Update the admin with participant info in real-time
            // throttledUpdateAdminWithParticipantInfo();
            updateAdminWithParticipantInfo();
            updateComments();
            startFetching();
            // console.log('Realtime length:', connectedClients.length, participantData);

            ws.send(JSON.stringify({ type: "resume-timer", duration }));

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    if (data.type === 'comment') {
                        participantData.comments.push({name: data.name, content: data.content, time: data.time});
                        // console.log(participantData.comments);
                        updateComments();
                    }
                } catch (error) {
                    console.log(err);
                    
                }
            });
            
            ws.on('close', () => {
                const leaveTime = Date.now(); // Track the time the user disconnects
                // Calculate how long the user stayed
                const clientIndex = connectedClients.findIndex(client => client.ws === ws);
                const client = connectedClients[clientIndex];
                if (clientIndex !== -1) {
                    const viewDuration = (leaveTime - client.joinTime) / 1000;
                    client.duration += viewDuration
                    viewersDuration += viewDuration; 
                    // console.log(`User ${userEmail} stayed for ${viewDuration} seconds.`);
                }
                const userIndex = participantData.users.findIndex(user => user.email === userEmail);
                if (userIndex !== -1) {
                    participantData.users[userIndex].duration = client.duration;
                    participantData.users[userIndex].isOnline = false;
                }
                // Remove the client when they refresh or leave
                connectedClients = connectedClients.filter((client) => client.ws !== ws);
                // Update the admin with participant info in real-time
                throttledUpdateAdminWithParticipantInfo();
                // console.log(`User ${userEmail} removed from connected clients. Connected clients: ${connectedClients.length}`);
                // cons0.ole.log(participantData);
                stopFetching = true;
            });
        } catch (error) {
            console.error("Error handling WebSocket session:", error);
            ws.close();
        }
    });
}

export default setupWebSocket;