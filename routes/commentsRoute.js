import { pullComments, pushComments } from "../controllers/commentsController.js";
import express from "express";

const commentsRouter = express.Router();

commentsRouter.post("/comments", pushComments);
commentsRouter.get("/comments", pullComments);

export default commentsRouter