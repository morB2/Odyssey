import dotenv from "dotenv";
import Trip from "../models/tripModel.js";
import {
  oneDaySuggestInstruction,
  oneDayRouteInstruction,
  customizeInstruction,
  parseTripFromPostInstruction
} from "./prompts.js";
import { validateAndDetectInjection } from "./promptInjectionDetector.js";
import { clearUserFeedCache, clearUserProfileCache } from "../utils/cacheUtils.js";
import { askGemini, sanitizeAIOutput } from "./geminiService.js";
dotenv.config();

export async function getSuggestions(prompt) {
  // Validation is handled in askGemini, but we can add additional checks here if needed
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt must be a non-empty string");
  }

  const out = await askGemini(oneDaySuggestInstruction, prompt);
  const sanitized = sanitizeAIOutput(out);
  try {
    return JSON.parse(sanitized);
  } catch (e) {
    const err = new Error("AI returned non-JSON");
    err.type = "ai_non_json";
    err.raw = out;
    err.sanitized = sanitized;
    throw err;
  }
}

export async function optimizeRoute(destinations, mode = "driving") {
  if (!Array.isArray(destinations) || destinations.length === 0) {
    throw new Error("destinations (array) required");
  }
  const prompt = `Plan an optimized one-day route for the following destinations: ${JSON.stringify(
    destinations
  )}. Use mode: ${mode}.`;
  const out = await askGemini(oneDayRouteInstruction, prompt);
  const sanitized = sanitizeAIOutput(out);
  try {
    return JSON.parse(sanitized);
  } catch (e) {
    const err = new Error("AI returned non-JSON");
    err.type = "ai_non_json";
    err.raw = out;
    err.sanitized = sanitized;
    throw err;
  }
}

export async function customizeTrip(prompt, tripObj) {
  if (!tripObj || typeof tripObj !== "object") {
    throw new Error("trip object required");
  }

  // Validate the prompt first (will throw if injection detected)
  const promptValidation = validateAndDetectInjection(prompt);
  if (!promptValidation.isValid) {
    const error = new Error(
      promptValidation.isInjection
        ? "Prompt injection detected in customization request"
        : "Invalid customization prompt"
    );
    error.type = promptValidation.isInjection ? "prompt_injection" : "validation_error";
    error.detectedPatterns = promptValidation.detectedPatterns;
    throw error;
  }

  const {
    title,
    description,
    ordered_route,
    mode,
    instructions,
    google_maps_url,
    activities,
  } = tripObj;

  // Use validated and sanitized prompt
  const userPrompt = `Prompt: ${promptValidation.sanitized}\n\nTitle: ${title}\nDescription: ${description}\nOrdered_route: ${JSON.stringify(
    ordered_route
  )}\nMode: ${mode}\nInstructions: ${JSON.stringify(
    instructions
  )}\nGoogle_maps_url: ${google_maps_url}\nActivities: ${JSON.stringify(
    activities
  )}`;

  const out = await askGemini(customizeInstruction, userPrompt);
  const sanitized = sanitizeAIOutput(out);
  try {
    return JSON.parse(sanitized);
  } catch (e) {
    const err = new Error("AI returned non-JSON");
    err.type = "ai_non_json";
    err.raw = out;
    err.sanitized = sanitized;
    throw err;
  }
}

export async function saveUserTrip(params) {
  const { userId, title, description, optimizedRoute, activities, notes, visabilityStatus, image } =
    params;
  return await saveTripToDB({
    user: userId,
    title,
    description,
    optimizedRoute,
    activities,
    notes,
    visabilityStatus,
    image
  });
}

async function saveTripToDB({
  user,
  title,
  description,
  optimizedRoute,
  activities = [],
  notes = "",
  visabilityStatus,
  image
}) {
  const doc = await Trip.create({
    user: user || null,
    title: title || "",
    description: description || "",
    optimizedRoute: optimizedRoute || {},
    activities: activities || [],
    notes: notes || "",
    visabilityStatus: visabilityStatus,
    likes: 0,
    comments: [],
    images: [image] || [],
  });

  // Invalidate caches when a new trip is created
  if (user) {
    await clearUserFeedCache(user);
    await clearUserProfileCache(user);
  }

  return doc;
}

export async function parseTripFromPost(userText) {
  if (!userText || typeof userText !== "string") {
    throw new Error("User post text is required");
  }

  const out = await askGemini(parseTripFromPostInstruction, userText);

  const sanitized = sanitizeAIOutput(out);

  try {
    return JSON.parse(sanitized);
  } catch (e) {
    const err = new Error("AI returned invalid JSON for trip parsing");
    err.type = "ai_non_json";
    err.raw = out;
    err.sanitized = sanitized;
    throw err;
  }
}
