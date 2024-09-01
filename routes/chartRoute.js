import { chartItemsData } from "../controllers/chartController.js";
import express from "express"

const chartRouter = express.Router();

chartRouter.get("/charts-data", chartItemsData);

export default chartRouter;