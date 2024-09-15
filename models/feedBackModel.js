import mongoose from "mongoose";

const feedBackModel = new mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String, required: true},
    content: {type: String, required: true},
    isRead : {type:Boolean,default: false}
});