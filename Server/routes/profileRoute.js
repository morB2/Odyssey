// import express from "express";
// import path from "path";
// import multer from "multer";
// import fs from "fs";
// import * as services from "../services/profileServices.js";
// import {
//   getProfile,
//   listUserTrips,
//   updateUserTrip,
//   deleteUserTrip,
//   updatePassword,
// } from "../controller/profileController.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // configure multer for avatar uploads
// const uploadsDir = path.join(process.cwd(), "uploads");
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
// const storage = multer.diskStorage({
//   destination: uploadsDir,
//   filename: (req, file, cb) => {
//     const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
//     cb(null, name);
//   },
// });
// const upload = multer({ storage });

// // GET /profile/:userId - get user details
// router.get("/:userId", async (req, res) => {
//   try {
//     const user = await getProfile(req.params.userId);
//     res.json({ success: true, user });
//   } catch (err) {
//     console.error("get profile error", err);
//     return res
//       .status(err.status || 500)
//       .json({ success: false, error: String(err) });
//   }
// });

// // PUT /profile/:userId - update user details (protected)
// // router.put("/:userId", async (req, res) => {
// //   try {
// //     const updated = await updateProfile(req.params.userId, req.body || {});
// //     res.json({ success: true, user: updated });
// //   } catch (err) {
// //     console.error("update profile error", err);
// //     return res
// //       .status(err.status || 500)
// //       .json({ success: false, error: String(err) });
// //   }
// // });

// // POST /profile/:userId/changePassword - change user password (protected)
// router.post("/:userId/changePassword", authMiddleware, async (req, res) => {
//   try {
//     const paramUserId = req.params.userId;
//     const authId =
//       req.user?._id || req.user?.id || req.user?.userId || req.user?.id_str;
//     if (!authId || String(authId) !== String(paramUserId)) {
//       return res.status(403).json({ success: false, error: "Forbidden" });
//     }

//     const { currentPassword, newPassword } = req.body || {};
//     const result = await updatePassword(
//       paramUserId,
//       currentPassword,
//       newPassword
//     );
//     res.json({ success: true, ...result });
//   } catch (err) {
//     console.error("change password error", err);
//     return res
//       .status(err.status || 500)
//       .json({ success: false, error: String(err) });
//   }
// });

// // GET /profile/:userId/trips - list trips
// router.get("/:userId/trips", authMiddleware, async (req, res) => {
//   try {
//     //   // viewer is authenticated user
//     //   const viewerId = req.user?._id || req.user?.id;
//     //   // ensure the viewer is the profile owner for this endpoint
//     //   if (!viewerId || String(viewerId) !== String(req.params.userId)) {
//     //     console.log("Forbidden access attempt by viewer:", viewerId, "on profile:", req.params.userId);

//     //     return res
//     //       .status(403)
//     //       .json({
//     //         success: false,
//     //         error: "Forbidden: viewer must be profile owner",
//     //       });
//     //   }

//     const trips = await listUserTrips(req.params.userId, req.params.userId);
//     res.json({ success: true, trips });
//   } catch (err) {
//     console.error("list trips error", err);
//     return res
//       .status(err.status || 500)
//       .json({ success: false, error: String(err) });
//   }
// });

// // GET single trip
// router.get("/:userId/trips/:tripId", async (req, res) => {
//   try {
//     // Optional viewerId can be passed as query param (?viewerId=...)
//     const viewerId = req.query.viewerId;
//     const trip = await getUserTrip(
//       req.params.userId,
//       req.params.tripId,
//       viewerId
//     );
//     res.json({ success: true, trip });
//   } catch (err) {
//     console.error("get user trip error", err);
//     return res
//       .status(err.status || 500)
//       .json({ success: false, error: String(err) });
//   }
// });

// // PUT update trip (only profile owner may update)
// // Accept optional multipart files named 'images' for uploading trip images
// router.put(
//   "/:userId/trips/:tripId",
//   authMiddleware,
//   upload.array("images", 3),
//   async (req, res) => {
//     try {
//       const paramUserId = req.params.userId;
//       const authId =
//         req.user?._id || req.user?.id || req.user?.userId || req.user?.id_str;
//       if (!authId || String(authId) !== String(paramUserId)) {
//         return res.status(403).json({ success: false, error: "Forbidden" });
//       }
//       // Prepare updates object. If multipart upload sent files, merge them with any
//       // existing image URLs provided in the `imagesExisting` or `images` field.
//       const updates = req.body || {};
//       try {
//         if (req.files && req.files.length > 0) {
//           const newPaths = req.files.map((f) => `/uploads/${f.filename}`);

//           const parseIfString = (v) => {
//             try {
//               return JSON.parse(v);
//             } catch (e) {
//               return v;
//             }
//           };

//           let existing = [];
//           if (
//             typeof req.body.imagesExisting === "string" &&
//             req.body.imagesExisting
//           ) {
//             existing = parseIfString(req.body.imagesExisting);
//           } else if (req.body.images) {
//             if (Array.isArray(req.body.images)) {
//               for (const item of req.body.images) {
//                 const parsed = parseIfString(item);
//                 if (Array.isArray(parsed)) existing = existing.concat(parsed);
//                 else existing.push(parsed);
//               }
//             } else if (typeof req.body.images === "string") {
//               const parsed = parseIfString(req.body.images);
//               if (Array.isArray(parsed)) existing = parsed;
//               else existing = [parsed];
//             }
//           }

//           // ensure existing is an array of strings and filter out blob/data URLs and non-strings
//           existing = (existing || [])
//             .flat()
//             .filter((i) => typeof i === "string")
//             .map((s) => String(s).trim())
//             .filter(
//               (s) =>
//                 s.length > 0 && !s.startsWith("blob:") && !s.startsWith("data:")
//             );

//           updates.images = [...existing, ...newPaths];
//         }
//       } catch (e) {
//         console.warn("failed to process uploaded trip images", e);
//       }

//       const trip = await updateUserTrip(
//         paramUserId,
//         req.params.tripId,
//         updates
//       );
//       res.json({ success: true, trip });
//     } catch (err) {
//       console.error("update trip error", err);
//       return res
//         .status(err.status || 500)
//         .json({ success: false, error: String(err) });
//     }
//   }
// );

// // DELETE trip (only profile owner may delete)
// router.delete("/:userId/trips/:tripId", authMiddleware, async (req, res) => {
//   try {
//     const paramUserId = req.params.userId;
//     const authId =
//       req.user?._id || req.user?.id || req.user?.userId || req.user?.id_str;
//     if (!authId || String(authId) !== String(paramUserId)) {
//       return res.status(403).json({ success: false, error: "Forbidden" });
//     }

//     const trip = await deleteUserTrip(paramUserId, req.params.tripId);
//     res.json({ success: true, trip });
//   } catch (err) {
//     console.error("delete trip error", err);
//     return res
//       .status(err.status || 500)
//       .json({ success: false, error: String(err) });
//   }
// });

// // PUT /profile/:userId/avatar - upload or set avatar URL (protected)
// router.put(
//   "/:userId/avatar",
//   authMiddleware,
//   upload.single("avatar"),
//   async (req, res) => {
//     try {
//       // resolve authenticated id and param id
//       const paramUserId = req.params.userId;
//       const authId =
//         req.user?._id || req.user?.id || req.user?.userId || req.user?.id_str;
//       const resolvedUserId = paramUserId || authId;

//       if (!resolvedUserId) {
//         return res
//           .status(400)
//           .json({ success: false, error: "Missing user id" });
//       }

//       // if param provided, ensure it matches authenticated user
//       if (paramUserId && authId && String(authId) !== String(paramUserId)) {
//         console.warn(
//           "avatar upload forbidden: auth user does not match target user",
//           { authId, paramUserId }
//         );
//         return res.status(403).json({ success: false, error: "Forbidden" });
//       }

//       // Accept either multipart file (field 'avatar') or JSON field 'avatarUrl'
//       let avatarValue = null;
//       if (req.file) {
//         // saved to uploads directory; expose under /uploads
//         avatarValue = `/uploads/${req.file.filename}`;
//       } else if (req.body && req.body.avatarUrl) {
//         avatarValue = req.body.avatarUrl;
//       }

//       if (!avatarValue) {
//         return res
//           .status(400)
//           .json({ success: false, error: "No avatar provided" });
//       }

//       // If a new avatarValue is provided (file upload or URL), try to remove the previous uploaded avatar file
//       if (avatarValue) {
//         try {
//           const prev = await services
//             .getProfile(resolvedUserId)
//             .catch(() => null);
//           const prevAvatar = prev && prev.avatar ? String(prev.avatar) : null;
//           // only attempt to remove files that are stored under our /uploads path
//           if (
//             prevAvatar &&
//             prevAvatar.includes("/uploads/") &&
//             prevAvatar !== avatarValue
//           ) {
//             // extract filename after /uploads/
//             const idx = prevAvatar.lastIndexOf("/uploads/");
//             let filename = prevAvatar
//               .substring(idx + "/uploads/".length)
//               .split("?")[0];
//             filename = decodeURIComponent(filename);
//             const candidate = path.join(uploadsDir, filename);
//             const normalized = path.normalize(candidate);
//             const uploadsNorm = path.normalize(uploadsDir + path.sep);
//             if (
//               normalized.startsWith(uploadsNorm) &&
//               fs.existsSync(normalized)
//             ) {
//               fs.unlinkSync(normalized);
//             }
//           }
//         } catch (e) {
//           console.warn("failed to remove previous avatar file", e);
//         }
//       }

//       const updated = await services.updateProfile(resolvedUserId, {
//         avatar: avatarValue,
//       });
//       res.json({ success: true, user: updated });
//     } catch (err) {
//       console.error("update avatar error", err);
//       return res
//         .status(err.status || 500)
//         .json({ success: false, error: String(err) });
//     }
//   }
// );

// export default router;
import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import * as services from "../services/profileServices.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Multer setup ---
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    console.log("file\n",file);
    
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

// --- Profile routes ---

// GET /profile/:userId
router.get("/:userId", async (req, res) => {
  try {
    const user = await services.getProfile(req.params.userId);
    res.json({ success: true, user });
  } catch (err) {
    console.error("get profile error", err);
    res.status(err.status || 500).json({ success: false, error: String(err) });
  }
});

// POST /profile/:userId/changePassword
router.post("/:userId/changePassword", authMiddleware, async (req, res) => {
  try {
    const result = await services.updatePassword(
      req.params.userId,
      req.user,
      req.body.currentPassword,
      req.body.newPassword
    );
    res.json(result);
  } catch (err) {
    console.error("change password error", err);
    res.status(err.status || 500).json({ success: false, error: String(err) });
  }
});

// --- Trips routes ---

// GET /profile/:userId/trips
router.get("/:userId/trips", authMiddleware, async (req, res) => {
  try {
    const trips = await services.listUserTrips(req.params.userId, req.user?._id);
    res.json({ success: true, trips });
  } catch (err) {
    console.error("list trips error", err);
    res.status(err.status || 500).json({ success: false, error: String(err) });
  }
});

// GET /profile/:userId/trips/:tripId
router.get("/:userId/trips/:tripId", async (req, res) => {
  try {
    const trip = await services.getUserTrip(req.params.userId, req.params.tripId, req.query.viewerId);
    res.json({ success: true, trip });
  } catch (err) {
    console.error("get user trip error", err);
    res.status(err.status || 500).json({ success: false, error: String(err) });
  }
});

// PUT /profile/:userId/trips/:tripId
router.put("/:userId/trips/:tripId", authMiddleware, upload.array("images", 3), async (req, res) => {
  try {
    const trip = await services.updateUserTrip(req.params.userId, req.params.tripId, req.user, req.body, req.files);
    res.json({ success: true, trip });
  } catch (err) {
    console.error("update trip error", err);
    res.status(err.status || 500).json({ success: false, error: String(err) });
  }
});

// DELETE /profile/:userId/trips/:tripId
router.delete("/:userId/trips/:tripId", authMiddleware, async (req, res) => {
  try {
    const trip = await services.deleteUserTrip(req.params.userId, req.params.tripId, req.user);
    res.json({ success: true, trip });
  } catch (err) {
    console.error("delete trip error", err);
    res.status(err.status || 500).json({ success: false, error: String(err) });
  }
});

// PUT /profile/:userId/avatar
router.put("/:userId/avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    console.log("avatarUrl\n",  req.avater);
    // let avatarUrl = avatarUrl || req.file
    const updatedUser = await services.updateProfileAvatar(req.params.userId, req.user, req.file, req.body.avatarUrl);
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("update avatar error", err);
    res.status(err.status || 500).json({ success: false, error: String(err) });
  }
});

export default router;
