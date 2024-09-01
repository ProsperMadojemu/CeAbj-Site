import { submitReport, searchReports, searchReports2 } from "../controllers/cellReportsController.js";
import express from "express"

const reportsRouter = express.Router();

reportsRouter.post("/submitcellreport", submitReport);
reportsRouter.get("/cellReportSearch/:id", searchReports);
reportsRouter.get("/cellReportSearch", searchReports2);

export default reportsRouter;