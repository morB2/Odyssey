import express from "express";
import {
  getSuggestions,
  optimizeRoute,
  saveTrip,
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
    const { userId, chosenTrip, optimizedRoute, activities, notes } =
      body;
    const saved = await saveTrip({
      user: userId,
      chosenTrip,
      optimizedRoute,
      activities,
      notes,
    });
    return res.status(201).json({ success: true, trip: saved });
  } catch (err) {
    console.error("save trip error", err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
