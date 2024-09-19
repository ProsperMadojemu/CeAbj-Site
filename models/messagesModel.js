import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    name: {type: String, required: true},
    Subject: {type: String, required: true},
    Image: {type: String, required: false},
    Content: {type: String, required: true},
    Recipients: {type: Array, required: true},
    type: {type: String, default: 'sent'},
    isSent: {type: Boolean, required: true},
    time: {        
        type: Date
    }
});

const messagesModel = mongoose.model("messages", messageSchema, "messages");

export default messagesModel;