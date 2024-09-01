import mongoose from "mongoose"
// Database connection
const dbConnection = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to database"))
    .catch(err => console.log("Error connecting to database", err));
}


export default dbConnection;