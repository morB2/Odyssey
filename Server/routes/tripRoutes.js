import { fetchTrips } from "../controller/tripController.js";
import express from "express";
const router = express.Router();

// Route to fetch trips for the current user
router.get("/:id", fetchTrips);

export default router;