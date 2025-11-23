import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createReport, getReports } from "../controller/reportController.js";

const router = express.Router();

router.post("/", authMiddleware, createReport);
router.get("/", authMiddleware, getReports); // Ideally protect this with admin middleware

export default router;
