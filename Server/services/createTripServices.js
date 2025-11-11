import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import Trip from "../models/tripModel.js";
import {
  oneDaySuggestInstruction,
  oneDayRouteInstruction,
  customizeInstruction,
} from "./prompts.js";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_KEY;
if (!GEMINI_API_KEY) console.warn("GEMINI_KEY not set - AI calls will fail");
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function askGemini(systemInstruction, userPrompt) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: userPrompt }],
        config: { systemInstruction },
      });
      const txt =
        r?.text ??
        (r.outputs
          ? r.outputs.map((o) => o.text).join("\n")
          : JSON.stringify(r));
      return txt.trim();
    } catch (e) {
      if (e?.status === 503 && i < 2)
        await new Promise((s) => setTimeout(s, 1000 * (i + 1)));
      else throw e;
    }
  }
}

const sanitizeAIOutput = (t) => {
  if (!t || typeof t !== "string") return t;
  const s = t
    .trim()
    .replace(/```\w*\n?|```/g, "")
    .trim();
  try {
    JSON.parse(s);
    return s;
  } catch {
    const m = s.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    return m ? m[0] : s;
  }
};

export async function getSuggestions(prompt) {
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
  const {
    title,
    description,
    ordered_route,
    mode,
    instructions,
    google_maps_url,
    activities,
  } = tripObj;
  const userPrompt = `Prompt: ${prompt}\n\nTitle: ${title}\nDescription: ${description}\nOrdered_route: ${JSON.stringify(
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
  const { userId, title, description, optimizedRoute, activities, notes,visabilityStatus } =
        params;
      return await saveTripToDB({
        user: userId,
        title,
        description,
        optimizedRoute,
        activities,
        notes,
        visabilityStatus,
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
}) {
  const doc = await Trip.create({
    user: user || null,
    title: title || "",
    description: description || "",
    optimizedRoute: optimizedRoute || {},
    activities: activities || [],
    notes: notes || "",
    visabilityStatus: visabilityStatus,
  });
  return doc;
}
