import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    Subject: {type: String, required: true},
    Image: {type: String, required: false},
    Content: {type: String, required: true},
    Recipients: {type: Array, required: true},
    type: {type: String, default: 'sent'},
    isSent: {type: Boolean, default: true},
    isRead: {type: Boolean, default: false},
    time: {        
        type: Date,
        default: Date.now
    }
});

const messagesModel = mongoose.model("messages", messageSchema, "messages");

export default messagesModel;