import { unauthorizedAccess, adminCheck, redirect } from "../controllers/adminController.js";
import express from "express";

const adminRouter = express.Router();

adminRouter.get("/admin/", unauthorizedAccess, adminCheck, redirect);

export default adminRouter;