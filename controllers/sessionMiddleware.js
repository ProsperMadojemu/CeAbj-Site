import "dotenv/config";
import session from "express-session";
import MongoDBSession from "connect-mongodb-session";
const MongoDBStore = MongoDBSession(session);

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

export default sessionMiddleware;

