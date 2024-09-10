import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    Subject: {type: String, required: true},
    Image: {type: String, required: true},
    Content: {type: String, required: true},
    Recipients: {type: String, required: true}
});

const messagesModel = new mongoose.model("messages", messageSchema);

export default messagesModel;