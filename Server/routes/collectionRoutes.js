import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    createCollection,
    getCollectionsByUser,
    getCollectionById,
    updateCollection,
    deleteCollection,
    generateCollectionTitleController,
    generateCollectionDescriptionController
} from "../controller/collectionController.js";

const router = express.Router();

router.post("/", authMiddleware, createCollection);
router.get("/user/:userId", authMiddleware, getCollectionsByUser);
router.get("/:id", authMiddleware, getCollectionById);
router.put("/:id", authMiddleware, updateCollection);
router.delete("/:id", authMiddleware, deleteCollection);

// AI Generation Routes
router.post("/generate-title", authMiddleware, generateCollectionTitleController);
router.post("/generate-description", authMiddleware, generateCollectionDescriptionController);

export default router;
