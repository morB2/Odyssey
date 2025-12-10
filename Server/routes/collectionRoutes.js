import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    createCollection,
    getCollectionsByUser,
    getCollectionById,
    updateCollection,
    deleteCollection,
} from "../controller/collectionController.js";

const router = express.Router();

router.post("/", authMiddleware, createCollection);
router.get("/user/:userId", authMiddleware, getCollectionsByUser);
router.get("/:id", authMiddleware, getCollectionById);
router.put("/:id", authMiddleware, updateCollection);
router.delete("/:id", authMiddleware, deleteCollection);

export default router;
