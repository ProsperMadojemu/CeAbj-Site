import { submitCell, getAllLeadersData, getPcfLeaders, getSeniorLeaders, getCellLeaders, searchAndUpdateLeaderById, searchForLeader, deleteCell } from "../controllers/cellsController.js"
import express from "express";

const cellsRouter = express.Router();

cellsRouter.post("/submitnewcell", submitCell);
cellsRouter.get("/getleadersdata", getAllLeadersData);
cellsRouter.get("/pcfleaders", getPcfLeaders);
cellsRouter.get("/seniorcell-leaders", getSeniorLeaders);
cellsRouter.get("/cell-leaders", getCellLeaders);
cellsRouter.put("/leadersSearch/:id", searchAndUpdateLeaderById);
cellsRouter.get("/leadersSearch", searchForLeader);
cellsRouter.delete("/leadersSearch/:id", deleteCell);

export default cellsRouter;