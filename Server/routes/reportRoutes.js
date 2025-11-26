import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createReport, getReports, updateReportStatus, deleteReportedPost } from "../controller/reportController.js";

const router = express.Router();

router.post("/", createReport);
router.get("/", authMiddleware, getReports); // Ideally protect this with admin middleware
router.patch("/:reportId/status", authMiddleware, updateReportStatus);
router.delete("/post/:tripId", authMiddleware, deleteReportedPost);

export default router;
