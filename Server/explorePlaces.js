import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_KEY;
if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_KEY in .env");

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const oneDaySuggestInstruction = `
You are a one-day trip planner.
The user will describe the kind of one-day trip they want (region, interests, style).

Task:
1. Suggest exactly 3 different one-day trip options that match the user's request.
2. Each option must contain:
   - "title": short descriptive name
   - "description": short summary
   - "destinations": array of exactly 4 locations (each with name and brief note)
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
- Output strictly in this JSON format:

{
  "ordered_route": [
    {"name": "Place A", "lat": ..., "lon": ...},
    {"name": "Place B", "lat": ..., "lon": ...},
    ...
  ],
  "mode": "<driving|walking|transit>",
  "instructions": ["Go from A to B via ...", "Then continue to ..."],
  "google_maps_url": "https://www.google.com/maps/dir/?api=1&origin=<lat1>,<lon1>&destination=<lat4>,<lon4>&waypoints=<lat2>,<lon2>|<lat3>,<lon3>&travelmode=driving"
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
      if (e.status === 503 && i < 2) {
        console.warn("Gemini overloaded, retrying in 3s...");
        await new Promise((s) => setTimeout(s, 3000));
      } else throw e;
    }
  }
}

async function main() {
  const userPrompt =
    "I want a one-day trip in Ashdod with beaches, good food, and local culture.";
  console.log("Fetching one-day trip options...");
  const suggestions = await askGemini(oneDaySuggestInstruction, userPrompt);
  console.log("Trip suggestions:\n", suggestions);
const chosenDestinations = [
    {
      name: "Carmel Market",
      lat: 32.068,
      lon: 34.768,
    },
    {
      name: "Rothschild Boulevard",
      lat: 32.063,
      lon: 34.776,
    },
    {
      name: "Tel Aviv Museum of Art",
      lat: 32.077,
      lon: 34.786,
    },
    {
      name: "Gordon Beach",
      lat: 32.081,
      lon: 34.769,
    },
  ];

  const travelMode = "walking"; // or "driving" or "transit"

  const routePrompt = `Plan an optimized one-day route for the following destinations: ${JSON.stringify(
    chosenDestinations
  )}. Use mode: ${travelMode}.`;

  console.log("\nCalculating optimal route...");
  const route = await askGemini(oneDayRouteInstruction, routePrompt);
  console.log("Optimized route:\n", route);
}

main().catch(console.error);
