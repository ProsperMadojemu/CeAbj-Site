import express from "express"
import { sendMessage, viewMessage } from "../controllers/messagesController.js";
import multer from "multer";
const messagesRouter = express.Router();

const storage = multer.diskStorage( {
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage});

messagesRouter.post("/api/messages/send",upload.single("image"), sendMessage);
messagesRouter.get("/api/messages/view", viewMessage);

export default messagesRouter;