import express from "express";
import {
    submitContactForm,
    getContactMessages,
    markMessageRead,
    deleteContactMessage,
} from "../controller/contactController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for submission
router.post("/", submitContactForm);

// Protected admin routes
// Assuming admins are just authenticated users with a specific role, or currently just authenticated users.
// Based on adminRoutes.js, it uses authMiddleware. Ideally should also check for admin role, but sticking to existing pattern.
router.get("/", authMiddleware, getContactMessages);
router.patch("/:id/read", authMiddleware, markMessageRead);
router.delete("/:id", authMiddleware, deleteContactMessage);

export default router;
