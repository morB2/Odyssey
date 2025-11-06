import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_KEY;
if (!GEMINI_API_KEY) console.warn("GEMINI_KEY not set - AI calls will fail");
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const oneDaySuggestInstruction = `You are a one-day trip planner. Return EXACTLY a JSON array of 3 trip option objects with title, description and destinations (4 items each with name, lat, lon, note). Nothing else.`;
const oneDayRouteInstruction = `You are a travel route optimizer. Given destinations with coordinates and a travel mode, return a JSON object with ordered_route (array), mode, instructions (array), and google_maps_url. Nothing else.`;

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
