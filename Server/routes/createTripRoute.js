import express from "express";
import {
  getSuggestions,
  optimizeRoute,
  saveTrip,
  customizeTrip,
} from "../controller/createTripController.js";

const router = express.Router();

router.post("/suggestions", async (req, res) => {
  try {
    const body = req.body || {};
    const prompt = body.prompt || body.text || req.query.prompt;
    let suggestions;
    if (prompt) suggestions = await getSuggestions(prompt);
    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error("suggestions error", err);
    if (err.type === "ai_non_json")
      return res.status(502).json({
        success: false,
        error: err.message,
        raw: err.raw,
        sanitized: err.sanitized,
      });
    return res.status(500).json({ success: false, error: String(err) });
  }
});

router.post("/findOptimalRoute", async (req, res) => {
  try {
    const body = req.body || {};
    const destinations = body.destinations;
    const mode = body.mode || req.query.mode || "driving";
    if (!Array.isArray(destinations) || destinations.length === 0)
      return res
        .status(400)
        .json({ success: false, error: "destinations (array) required" });
    const route = await optimizeRoute(destinations, mode);
    return res.json({ success: true, route });
  } catch (err) {
    console.error("find optimal route error", err);
    if (err.type === "ai_non_json")
      return res.status(502).json({
        success: false,
        error: err.message,
        raw: err.raw,
        sanitized: err.sanitized,
      });
    return res.status(500).json({ success: false, error: String(err) });
  }
});

router.post("/save", async (req, res) => {
  try {
    const body = req.body || {};
    const { userId, optimizedRoute, activities, notes } = body;
    const saved = await saveTrip({
      user: userId,
      optimizedRoute,
      activities,
      notes,
    });
    return res.status(201).json({ success: true, route: saved });
  } catch (err) {
    console.error("save trip error", err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

router.post("/customize", async (req, res) => {
  try {
    const body = req.body || {};
    const prompt = body.prompt || body.text || req.query.prompt;
    // Accept full trip object or top-level trip fields
    let trip = body.trip || body.optimizedRoute || body.route;
    if (!prompt || !trip)
      return res
        .status(400)
        .json({ success: false, error: "prompt and trip required" });
    const customized = await customizeTrip(prompt, trip);
    return res.json(Object.assign({ success: true }, {route:customized}));
  } catch (err) {
    console.error("customize error", err);
    if (err.type === "ai_non_json")
      return res.status(502).json({
        success: false,
        error: err.message,
        raw: err.raw,
        sanitized: err.sanitized,
      });
    return res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
