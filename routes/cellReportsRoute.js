import { submitReport, listReports, updateStatus } from "../controllers/cellReportsController.js";
import express from "express"

const reportsRouter = express.Router();

reportsRouter.post("/api/reports/submit", submitReport);
reportsRouter.post("/api/reports/status/:id", updateStatus);
reportsRouter.get("/api/reports/search", listReports);

export default reportsRouter;