import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    getAdminTrips,
    getTopViewedPostsController,
    getTopLikedPostsController,
    // getViewsTrendController,
    getCategoryDistributionController,
    getTopActiveUsersController,
    getTopReportedPostsController,
    getTopReportedUsersController,
    getTopReportersController,
    getReportReasonDistributionController,
    getReportsTrendController
} from "../controller/adminController.js";

const router = express.Router();

// Posts management
router.get("/all", authMiddleware, getAdminTrips);

// Statistics endpoints
router.get("/stats/top-viewed-posts", authMiddleware, getTopViewedPostsController);
router.get("/stats/top-liked-posts", authMiddleware, getTopLikedPostsController);
// router.get("/stats/views-trend", authMiddleware, getViewsTrendController);
router.get("/stats/category-distribution", authMiddleware, getCategoryDistributionController);
router.get("/stats/top-active-users", authMiddleware, getTopActiveUsersController);

// Report statistics endpoints
router.get("/stats/top-reported-posts", authMiddleware, getTopReportedPostsController);
router.get("/stats/top-reported-users", authMiddleware, getTopReportedUsersController);
router.get("/stats/top-reporters", authMiddleware, getTopReportersController);
router.get("/stats/report-reason-distribution", authMiddleware, getReportReasonDistributionController);
router.get("/stats/reports-trend", authMiddleware, getReportsTrendController);

export default router;
