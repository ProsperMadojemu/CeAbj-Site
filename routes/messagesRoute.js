import express from "express"
import { sendMessage, viewMessage, deleteMessage, sendMembership, viewAll, getFullMessage } from "../controllers/messagesController.js";
import multer from "multer";
import autoComplete from "../controllers/autocomplete.js";
const messagesRouter = express.Router();

const storage = multer.diskStorage( {
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage});

messagesRouter.post("/api/messages/send",upload.single("image"), sendMessage);
messagesRouter.post("/api/messages/memberships/send",multer().none(), sendMembership);
messagesRouter.post("/api/messages/autocomplete", autoComplete);
messagesRouter.post("/api/messages/delete", deleteMessage);
messagesRouter.post("/api/messages/view", viewMessage);
messagesRouter.post("/api/messages/getall", getFullMessage);
messagesRouter.get("/api/messages/list", viewAll);

export default messagesRouter;