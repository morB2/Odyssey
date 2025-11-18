import express from "express";
import {
  getSuggestions,
  optimizeRoute,
  customizeTrip,
  saveUserTrip,
} from "../services/createTripServices.js";
import {
  suggestionsRateLimiter,
  routeRateLimiter,
  customizeRateLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/suggestions", suggestionsRateLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const prompt = body.prompt || body.text || req.query.prompt;
    
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required and must be a non-empty string",
      });
    }
    
    const suggestions = await getSuggestions(prompt);
    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error("suggestions error", err);
    
    // Handle prompt injection errors
    if (err.type === "prompt_injection") {
      return res.status(403).json({
        success: false,
        error: "Request rejected: Invalid or suspicious input detected",
      });
    }
    
    // Handle validation errors
    if (err.type === "validation_error") {
      return res.status(400).json({
        success: false,
        error: err.message || "Invalid input",
      });
    }
    
    // Handle AI JSON errors
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

router.post("/findOptimalRoute", routeRateLimiter, async (req, res) => {
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
    
    // Handle prompt injection errors
    if (err.type === "prompt_injection") {
      return res.status(403).json({
        success: false,
        error: "Request rejected: Invalid or suspicious input detected",
      });
    }
    
    // Handle validation errors
    if (err.type === "validation_error") {
      return res.status(400).json({
        success: false,
        error: err.message || "Invalid input",
      });
    }
    
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

router.post("/customize", customizeRateLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const prompt = body.prompt || body.text || req.query.prompt;
    
    // Validate prompt presence and type
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required and must be a non-empty string",
      });
    }
    
    // Accept full trip object or top-level trip fields
    let trip = body.trip || body.optimizedRoute || body.route;
    if (!trip || typeof trip !== "object") {
      return res
        .status(400)
        .json({ success: false, error: "trip object is required" });
    }
    
    const customized = await customizeTrip(prompt, trip);
    return res.json(Object.assign({ success: true }, { route: customized }));
  } catch (err) {
    console.error("customize error", err);
    
    // Handle prompt injection errors
    if (err.type === "prompt_injection") {
      return res.status(403).json({
        success: false,
        error: "Request rejected: Invalid or suspicious input detected",
      });
    }
    
    // Handle validation errors
    if (err.type === "validation_error") {
      return res.status(400).json({
        success: false,
        error: err.message || "Invalid input",
      });
    }
    
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
    const saved = await saveUserTrip({ ...body });
    return res.status(201).json({ success: true, route: saved });
  } catch (err) {
    console.error("save trip error", err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
