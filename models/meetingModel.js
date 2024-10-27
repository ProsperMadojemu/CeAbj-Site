import mongoose from "mongoose";

const streamSchema = new mongoose.Schema({
    title: {type: String, required: true},
    outline: {type: String, required: true},
    participantLimit: {type: Number, required: false},
    allowedParticipants: {type: String, default: 'All', required: true},
    views: {type: Number, required: false},
    status: { type: String, enum: ['scheduled', 'live', 'finished'], default: 'scheduled' },
    viewers: {type: Array, required: false},
    likes: {type: Number, required: false},
    comments: {type: Array, required: false},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
});

// if current number plus the number saved in a variable is less than the one in the db add and post+-
const meetingModel = new mongoose.model("meetings", streamSchema);

export default meetingModel;