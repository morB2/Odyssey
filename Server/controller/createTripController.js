import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();

import Trip from "../models/tripModel.js";

const GEMINI_API_KEY = process.env.GEMINI_KEY;
if (!GEMINI_API_KEY) console.warn("GEMINI_KEY not set - AI calls will fail");
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const oneDaySuggestInstruction = `
You are a one-day trip planner.
The user will describe the kind of one-day trip they want (region, interests, style).

Task:
1. Suggest exactly 3 different one-day trip options that match the user's request.
2. Each option must contain:
   - "title": short descriptive name
   - "description": short summary
   - "destinations": array of exactly 3 locations (each with name and brief note)
3. Each destination must also include approximate coordinates (latitude, longitude).
4. Output strictly a JSON array of 3 objects, nothing else.

Example:
[
  {
    "title": "Cultural and Food Tour in Tel Aviv",
    "description": "A relaxed day exploring food, art, and beach life in Tel Aviv.",
    "destinations": [
      {"name": "Carmel Market", "lat": 32.068, "lon": 34.768, "note": "Local street food"},
      {"name": "Rothschild Boulevard", "lat": 32.063, "lon": 34.776, "note": "Bauhaus architecture"},
      {"name": "Tel Aviv Museum of Art", "lat": 32.077, "lon": 34.786, "note": "Modern art collection"},
      {"name": "Gordon Beach", "lat": 32.081, "lon": 34.769, "note": "Beautiful sunset view"}
    ]
  },
  ...
]
`;
const oneDayRouteInstruction = `
You are a travel route optimizer.
Given a list of destinations (each with coordinates), plan an efficient one-day route.

Task:
- Reorder the destinations for optimal travel.
- Describe how to travel between each destination based on the user’s chosen mode ("driving", "walking", or "public_transport").
- Return estimated travel times and short route instructions.
- Include the Google Maps URL that shows the entire route in the correct order.
- Return activities array with 5 most relevant categories related to the trip.(e.g.,<name of the place></name>, "museum", "hiking", "food tour", "historical sites", "beach")
- Output strictly in this JSON format:

{
"title": "<Trip Title>",
"description": "<Trip Description>",
  "ordered_route": [
    {"name": "Place A", "lat": ..., "lon": ..., "note":...},
    {"name": "Place B", "lat": ..., "lon": ..., "note":...},
    ...
  ],
  "mode": "<driving|walking|transit>",
  "instructions": ["Go from A to B via ...", "Then continue to ..."],
  "google_maps_url": "https://www.google.com/maps/dir/?api=1&origin=<lat1>,<lon1>&destination=<lat4>,<lon4>&waypoints=<lat2>,<lon2>|<lat3>,<lon3>&travelmode=driving"
  "activities": ["<activity 1>", "<activity 2>", "...","<activity 5>"]
}
`;

async function askGemini(systemInstruction, userPrompt) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await ai.models.generateContent({
        model: "gemini-2.5-pro",
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

const customizeInstruction = `You are a trip customizer. You will receive a user prompt describing desired customizations and trip detailes: title, description, ordered_route, mode, instructions, google_maps_url, activities. Apply the customizations to the trip and the trip in this format (JSON object):
{
"title": "<Trip Title>",
"description": "<Trip Description>",
  "ordered_route": [
    {"name": "Place A", "lat": ..., "lon": ..., "note":...},
    {"name": "Place B", "lat": ..., "lon": ..., "note":...},
    ...
  ],
  "mode": "<driving|walking|transit>",
  "instructions": ["Go from A to B via ...", "Then continue to ..."],
  "google_maps_url": "https://www.google.com/maps/dir/?api=1&origin=<lat1>,<lon1>&destination=<lat4>,<lon4>&waypoints=<lat2>,<lon2>|<lat3>,<lon3>&travelmode=driving"
  "activities": ["<activity 1>", "<activity 2>", "...","<activity 5>"]
}
Do not include any explanations, notes, or extra text.`;

export async function customizeTrip(prompt, tripObj) {
  if (!tripObj || typeof tripObj !== 'object') {
    throw new Error('trip object required');
  }
  const { title, description, ordered_route, mode, instructions, google_maps_url, activities } = tripObj;
  const userPrompt = `Prompt: ${prompt}\n\nTitle: ${title}\nDescription: ${description}\nOrdered_route: ${JSON.stringify(ordered_route)}\nMode: ${mode}\nInstructions: ${JSON.stringify(instructions)}\nGoogle_maps_url: ${google_maps_url}\nActivities: ${JSON.stringify(activities)}`;
  const out = await askGemini(customizeInstruction, userPrompt);
  const sanitized = sanitizeAIOutput(out);
  try {
    return JSON.parse(sanitized);
  } catch (e) {
    const err = new Error('AI returned non-JSON');
    err.type = 'ai_non_json';
    err.raw = out;
    err.sanitized = sanitized;
    throw err;
  }
}

export async function saveTrip({
  user,
  title,
  description,
  optimizedRoute,
  activities = [],
  notes = "",
}) {
  const doc = await Trip.create({
    user: user || null,
    title: title || "",
    description: description || "",
    optimizedRoute: optimizedRoute || {},
    activities: activities || [],
    notes: notes || "",
  });
  return doc;
}
