import mongoose from "mongoose";

const streamSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: false},
    allowedParticipants: {type: String, required: true},
    // : {type: String, required: true},
    title: {type: String, required: true},
});