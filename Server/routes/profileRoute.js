import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { authMiddleware } from "../middleware/authMiddleware.js";
import * as controller from "../controller/profileController.js";

const router = express.Router();

// --- Multer setup ---
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

// --- Middleware to identify owner/viewer (runs AFTER authMiddleware) ---
const identifyOwnerViewer = (req, res, next) => {
  const userIdFromUrl = req.params.userId;
  const userIdFromToken = req.user?.userId;
  if (userIdFromToken && String(userIdFromToken) === String(userIdFromUrl)) {
    // User is viewing their own profile
    req.ownerId = userIdFromToken;
    req.viewerId = userIdFromToken;
  } else {
    // User is viewing someone else's profile (or not authenticated)
    req.ownerId = userIdFromUrl;
    req.viewerId = userIdFromToken || null;
  }

  next();
};

// --- Profile routes ---

router.get("/:userId", controller.getProfile);

router.post("/:userId/changePassword", authMiddleware, identifyOwnerViewer, controller.updatePassword);

// Trips

router.get("/:userId/trips", authMiddleware, identifyOwnerViewer, controller.listUserTrips);

router.get("/:userId/trips/:tripId", controller.getUserTrip);

router.put(
  "/:userId/trips/:tripId",
  authMiddleware,
  identifyOwnerViewer,
  upload.array("images", 3),
  controller.updateUserTrip
);

router.delete("/:userId/trips/:tripId", authMiddleware, identifyOwnerViewer, controller.deleteUserTrip);

router.get("/:userId/liked-trips", authMiddleware, identifyOwnerViewer, controller.getProfileLikedTrips);

router.get("/:userId/saved-trips", authMiddleware, identifyOwnerViewer, controller.getProfileSavedTrips);

// Avatar

router.put(
  "/:userId/avatar",
  authMiddleware,
  identifyOwnerViewer,
  upload.single("avatar"),
  controller.updateProfileAvatar
);

export default router;
