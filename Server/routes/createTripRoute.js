import express from "express";
import {
  getSuggestions,
  optimizeRoute,
} from "../controller/createTripController.js";

router.post("/suggestions", async (req, res) => {
  try {
    const prompt =
      req.body.prompt ||
      req.body.text ||
      req.query.prompt ||
      "Create 3 one-day trip options for a user request.";
    const suggestions = await getSuggestions(prompt);
    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error("suggestions error", err);
    if (err.type === "ai_non_json")
      return res
        .status(502)
        .json({
          success: false,
          error: err.message,
          raw: err.raw,
          sanitized: err.sanitized,
        });
    return res.status(500).json({ success: false, error: String(err) });
  }
});

router.post("/optimize", async (req, res) => {
  try {
    const destinations = req.body.destinations;
    const mode = req.body.mode || req.query.mode || "driving";
    if (!Array.isArray(destinations) || destinations.length === 0)
      return res
        .status(400)
        .json({ success: false, error: "destinations (array) required" });
    const route = await optimizeRoute(destinations, mode);
    return res.json({ success: true, route });
  } catch (err) {
    console.error("optimize error", err);
    if (err.type === "ai_non_json")
      return res
        .status(502)
        .json({
          success: false,
          error: err.message,
          raw: err.raw,
          sanitized: err.sanitized,
        });
    return res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
