import {
  submitCell,
  getAllLeadersData,
  getPcfLeaders,
  getSeniorLeaders,
  getCellLeaders,
  searchAndUpdateLeaderById,
  deleteCell,
  leadersApi,
} from "../controllers/cellsController.js";
import express from "express";

const cellsRouter = express.Router();

cellsRouter.post("/submitnewcell", submitCell);
cellsRouter.get("/getleadersdata", getAllLeadersData);
cellsRouter.get("/pcfleaders", getPcfLeaders);
cellsRouter.get("/seniorcell-leaders", getSeniorLeaders);
cellsRouter.get("/api/leaders/search", leadersApi);
cellsRouter.get("/cell-leaders", getCellLeaders);
cellsRouter.put("/leadersSearch/:id", searchAndUpdateLeaderById);
cellsRouter.delete("/leadersSearch/:id", deleteCell);

export default cellsRouter;
