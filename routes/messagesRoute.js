import express from "express"
import { sendMessage, viewMessage, deleteMessage, sendMembership, listMemberships, viewAll } from "../controllers/messagesController.js";
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
messagesRouter.post("/api/messages/memberships/send",multer().none(), sendMembership);
messagesRouter.post("/api/messages/delete", deleteMessage);
messagesRouter.post("/api/messages/view", viewMessage);
messagesRouter.get("/api/messages/list", viewAll);
messagesRouter.get("/api/messages/memberships/view", listMemberships);

export default messagesRouter;