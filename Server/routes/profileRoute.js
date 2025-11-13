import express from "express";
import {
  getProfile,
  listUserTrips,
  updateUserTrip,
  deleteUserTrip,
  updatePassword,
} from "../controller/profileController.js";

const router = express.Router();

// GET /profile/:userId - get user details
router.get("/:userId", async (req, res) => {
  try {
    const user = await getProfile(req.params.userId);
    res.json({ success: true, user });
  } catch (err) {
    console.error("get profile error", err);
    return res
      .status(err.status || 500)
      .json({ success: false, error: String(err) });
  }
});

// PUT /profile/:userId - update user details (protected)
// router.put("/:userId", async (req, res) => {
//   try {
//     const updated = await updateProfile(req.params.userId, req.body || {});
//     res.json({ success: true, user: updated });
//   } catch (err) {
//     console.error("update profile error", err);
//     return res
//       .status(err.status || 500)
//       .json({ success: false, error: String(err) });
//   }
// });

// POST /profile/:userId/changePassword - change user password (protected)
router.post("/:userId/changePassword", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const result = await updatePassword(
      req.params.userId,
      currentPassword,
      newPassword
    );
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("change password error", err);
    return res
      .status(err.status || 500)
      .json({ success: false, error: String(err) });
  }
});

// GET /profile/:userId/trips - list trips
router.get("/:userId/trips", async (req, res) => {
  try {
    const trips = await listUserTrips(req.params.userId);
    res.json({ success: true, trips });
  } catch (err) {
    console.error("list trips error", err);
    return res
      .status(err.status || 500)
      .json({ success: false, error: String(err) });
  }
});

// GET single trip
// router.get("/:userId/trips/:tripId", async (req, res) => {
//   try {
//     const trip = await getUserTrip(req.params.userId, req.params.tripId);
//     res.json({ success: true, trip });
//   } catch (err) {
//     console.error("get user trip error", err);
//     return res
//       .status(err.status || 500)
//       .json({ success: false, error: String(err) });
//   }
// });

// PUT update trip
router.put("/:userId/trips/:tripId", async (req, res) => {
  try {
    const trip = await updateUserTrip(
      req.params.userId,
      req.params.tripId,
      req.body || {}
    );
    res.json({ success: true, trip });
  } catch (err) {
    console.error("update trip error", err);
    return res
      .status(err.status || 500)
      .json({ success: false, error: String(err) });
  }
});

// DELETE trip
router.delete("/:userId/trips/:tripId", async (req, res) => {
  try {
    const trip = await deleteUserTrip(req.params.userId, req.params.tripId);
    res.json({ success: true, trip });
  } catch (err) {
    console.error("delete trip error", err);
    return res
      .status(err.status || 500)
      .json({ success: false, error: String(err) });
  }
});

export default router;
