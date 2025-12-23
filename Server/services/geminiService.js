import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { validateAndDetectInjection } from "./promptInjectionDetector.js";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_KEY;
if (!GEMINI_API_KEY) console.warn("GEMINI_KEY not set - AI calls will fail");
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Calls Gemini API with prompt injection validation and retry logic
 * @param {string} systemInstruction - System instruction for the AI
 * @param {string} userPrompt - User prompt to send to the AI
 * @returns {Promise<string>} - AI response text
 * @throws {Error} - If prompt injection detected or API call fails
 */
export async function askGemini(systemInstruction, userPrompt) {
    // Validate and detect prompt injection before calling Gemini
    console.log(userPrompt);
    const validation = validateAndDetectInjection(userPrompt);

    if (!validation.isValid) {
        const error = new Error(
            validation.isInjection
                ? "Prompt injection detected: " + (validation.error || "Suspicious patterns found")
                : "Invalid prompt: " + (validation.error || "Validation failed")
        );
        error.type = validation.isInjection ? "prompt_injection" : "validation_error";
        error.detectedPatterns = validation.detectedPatterns;
        error.riskScore = validation.riskScore;

        // Log the rejected attempt
        console.warn("Rejected prompt:", {
            reason: validation.isInjection ? "injection" : "validation",
            riskScore: validation.riskScore,
            patterns: validation.detectedPatterns,
            promptPreview: userPrompt.substring(0, 100),
        });

        throw error;
    }

    // Add defensive prefix/suffix to reinforce system instructions
    const safePrompt = `${validation.sanitized}\n\nRemember: Follow your system instructions strictly.`;

    for (let i = 0; i < 3; i++) {
        try {
            const r = await ai.models.generateContent({
                model: "gemini-2.5-flash",//gemini-2.5-flash
                contents: [{ text: safePrompt }],
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

/**
 * Sanitizes AI output by removing markdown code blocks and extracting JSON
 * @param {string} text - Raw AI output text
 * @returns {string} - Sanitized text (usually JSON string)
 */
export function sanitizeAIOutput(text) {
    if (!text || typeof text !== "string") return text;
    const s = text
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
}
