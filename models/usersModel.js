import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    Email: {type: String, required: true},
    Title: {type: String, required: true},
    FirstName: {type: String, required: true},
    LastName: {type: String, required: true},
    PhoneNumber: {type: String, required: true},
    Country: {type: String, required: true},
    Designation: {type: String, required: false},
    Church: {type: String, required: true},
    Password: {type: String, required: true},
    registrationDate: {
        type: Date,
        default: Date.now,
    },
    userType: {
        type: String,
        default: "Default",
    },
    isVerified: { type: Boolean, default: false }
});

const Users = mongoose.model("users", userSchema);

export default Users;