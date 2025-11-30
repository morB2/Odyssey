import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getAdminTrips } from "../controller/adminController.js";

const router = express.Router();

router.get("/all", authMiddleware, getAdminTrips);

export default router;

