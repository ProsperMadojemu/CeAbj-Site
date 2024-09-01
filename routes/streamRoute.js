import streamKey from "../controllers/streamController.js";
import express from "express"

const streamRouter = express.Router();

streamRouter.post("/auth", streamKey);

export default streamRouter;