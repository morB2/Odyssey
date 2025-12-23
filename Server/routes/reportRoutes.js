import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { createReport, getReports, updateReportStatus, deleteReportedPost } from "../controller/reportController.js";

const router = express.Router();

router.post("/", authMiddleware, createReport); // ✅ Authenticated users can create reports
router.get("/", authMiddleware, adminMiddleware, getReports); // ✅ Admin-only
router.patch("/:reportId/status", authMiddleware, adminMiddleware, updateReportStatus); // ✅ Admin-only
router.delete("/post/:tripId", authMiddleware, adminMiddleware, deleteReportedPost); // ✅ Admin-only

export default router;
