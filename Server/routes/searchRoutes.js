import express from "express";
import { handleSearch } from "../controller/searchController.js";

const router = express.Router();

// GET /api/search?q=<query>&userId=<optional>
router.get("/", handleSearch);

export default router;
