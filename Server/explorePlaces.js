import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
dotenv.config();
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("Missing API_KEY in env");
const fetch = globalThis.fetch ?? (await import("node-fetch")).default;

// const systemInstruction = `A natural language travel request, e.g., "I want to visit Italy, go to Venice and Rome for three days, see historical sights and eat food."
// Task:

// Extract from the request:
// Locations (cities, regions, countries)
// Activities/categories (e.g., tourism, food, entertainment)
// Optional conditions (ratings, opening hours, price levels)
// For each location:
// Find its coordinates (latitude, longitude)
// Generate one API request per location with:
// categories=<all extracted activities>
// Any optional conditions
// Circle filter around coordinates: filter=circle:<longitude>,<latitude>,<radius_in_meters>
// apiKey=API_KEY
// Output only a JSON array of objects in this format:

// [
//   {
//     "location": "<city_or_region_name>",
//     "api_request": "<full_api_request_url>"
//   }]
// Constraints:

// Only use categories and parameters from Geoapify documentation
// Include all activities in one request per location
// Filter by circle around coordinates, not just by name
// Return only the JSON array, nothing else
// Example Output:

// [
//   {
//     "location": "Venice",
//     "api_request": "https://api.geoapify.com/v2/places?categories=tourism.historic,food.restaurant&filter=circle:12.3155,45.4408,5000"
//   },
//   {
//     "location": "Rome",
//     "api_request": "https://api.geoapify.com/v2/places?categories=tourism.historic,food.restaurant&filter=circle:12.4964,41.9028,5000"
//   }]
// send teh user just the object and not anyother text`;

const systemInstruction = `A natural language travel request is given, for example: “I want to visit Israel for five days, explore fjords and mountains, go hiking and kayaking, and see wildlife.” Extract all mentioned locations (cities, regions, or countries) and detect whether the request refers to exploring places, finding food, or looking for accommodation. For each location, find its geographic coordinates (latitude and longitude). Then generate exactly one Geoapify Places API request per location for each relevant category type: one for attractions and activities (e.g., tourism.attraction, leisure.park, or natural), one for accommodation (e.g., accommodation.hotel or accommodation.hostel), and one for food (e.g., food.restaurant or catering). Each request must include a circular filter around the coordinates using filter=circle:<longitude>,<latitude>,<radius_in_meters>(e.g., https://api.geoapify.com/v2/places?categories=natural.mountain,national_park,leisure.park.nature_reserve,natural.water&filter=circle:34.8516,31.0461,200000). Use only valid categories and parameters from the Geoapify documentation. Return strictly a JSON array of objects, each containing "location", "category_type" (values: “exploration”, “lodging”, “food”), and "api_request". If the request involves multiple locations, repeat the same three request types for each. Output only the JSON array and nothing else.`
const GEMINI_API_KEY = process.env.GEMINI_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const apiDocs = JSON.parse(
  fs.readFileSync(new URL("./apiDocs.json", import.meta.url), "utf8")
);
async function gemini(prompt) {
  if (!GEMINI_API_KEY) console.warn("GEMINI_KEY not set - AI may fail");
  for (let i = 0; i < 3; i++) {
    try {
      const r = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{ text: JSON.stringify(apiDocs) }, { text: prompt }],
        config: { systemInstruction },
      });
      const txt =
        r?.text ??
        (r.outputs
          ? r.outputs.map((o) => o.text).join("\n")
          : JSON.stringify(r));
      console.log("Gemini output:", txt);
      return txt;
    } catch (e) {
      if (e?.status === 503 && i < 2)
        await new Promise((s) => setTimeout(s, 500 * (i + 1)));
      else throw e;
    }
  }
}

async function extractUrl(urlArr) {
  if (!Array.isArray(urlArr)) return [];
  // Each item is expected to contain an `api_request` (full Geoapify Places URL).
  // Fetch all requests in parallel and attach results. If the AI didn't include
  // an apiKey in the URL, append our API_KEY.
  const jobs = urlArr.map(async (item) => {
    const api_request =
      typeof item === "string" ? item : item.api_request || item.url || "";
    if (!api_request) return null;
    // Ensure apiKey present
    let finalUrl = api_request;
    // const hasApiKey =
    //   /[?&]apiKey=/i.test(finalUrl) || /[?&]apikey=/i.test(finalUrl);
    // if (!hasApiKey) {
    const sep = finalUrl.includes("?") ? "&" : "?";
    finalUrl = `${finalUrl}${sep}limit=2&apiKey=${encodeURIComponent(API_KEY)}`;
    // }
    try {
      const res = await fetch(finalUrl);
      if (!res.ok) {
        const txt = await res.text();
        console.error("HTTP error for", finalUrl, res.status, txt);
        return {
          location: item.location,
          api_request: finalUrl,
          error: res.status,
        };
      }
      const data = await res.json();
      return { location: item.location, api_request: finalUrl, data };
    } catch (err) {
      console.error("fetch failed for", finalUrl, err);
      return {
        location: item.location,
        api_request: finalUrl,
        error: String(err),
      };
    }
  });
  const results = await Promise.all(jobs);
  return results.filter(Boolean);
}

/**
 * Try to extract a JSON payload from AI text output. The AI often returns
 * content wrapped in markdown code fences (```json ... ```). This helper
 * removes fences and attempts a best-effort extraction of a JSON array or
 * object so JSON.parse works reliably.
 */
const sanitizeAIOutput = (t) => {
  if (!t || typeof t !== "string") return t;
  let s = t
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

async function main() {
  const textPrompt =
    "I want to visit Israel for five days, explore fjords and mountains, go hiking and kayaking, and see wildlife.";
  // const textPrompt = `"I want to visit France, go to Paris and Lyon for four days, see museums and historical landmarks, and try local cuisine."`
  try {
    const generated = await gemini(textPrompt);
    const parsed = JSON.parse(sanitizeAIOutput(generated));
    const places = await extractUrl(parsed);
    // console.log(JSON.stringify(places, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main().catch((err) => console.error(err));
