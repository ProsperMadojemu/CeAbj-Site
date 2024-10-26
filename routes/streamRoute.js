import {streamKey, fetchStats} from "../controllers/streamController.js";
import express from "express"

const streamRouter = express.Router();

streamRouter.post("/auth", streamKey);
streamRouter.get("/api/stats", fetchStats);

export default streamRouter;