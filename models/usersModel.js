import mongoose from "mongoose";

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
        default: Date.now,
    },
    userType: {
        type: String,
        default: "Default",
    },
});

const Users = mongoose.model("users", userSchema);

export default Users;