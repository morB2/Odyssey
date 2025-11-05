// // save as inspect_geoapify.js
// // usage: API_KEY=your_key node inspect_geoapify.js
import dotenv from 'dotenv';
dotenv.config();
// const API_KEY = process.env.API_KEY;
// if (!API_KEY) {
//   console.error("Missing API_KEY in env. Export API_KEY=your_key");
//   process.exit(1);
// }

// const fetch = global.fetch || require('node-fetch'); // node 18+ יש fetch מובנה

// async function inspectGeocoding(query = "1600 Amphitheatre Parkway") {
//   const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${API_KEY}&limit=2`;
//   const res = await fetch(url);
//   if (!res.ok) {
//     console.error("HTTP error", res.status, await res.text());
//     return;
//   }
//   const data = await res.json();

//   console.log("Top-level keys:", Object.keys(data));

  
//   if (Array.isArray(data.features)) {
//     data.features.forEach((feat, idx) => {
//       console.log(`\n--- feature[${idx}] keys:`, Object.keys(feat));
//       // geometry
//       if (feat.geometry) {
//         console.log(" geometry.type:", typeof feat.geometry.type, "coords type:", typeof feat.geometry.coordinates);
//       }
      
//       if (feat.properties) {
//         console.log(" properties keys:", Object.keys(feat.properties).slice(0, 30).join(", "));
        
//         const exampleFields = ["formatted", "lat", "lon", "country", "city", "postcode", "address_line1"];
//         exampleFields.forEach(k => {
//           if (k in feat.properties) {
//             console.log(`  - ${k}: type=${typeof feat.properties[k]}, sample=${JSON.stringify(feat.properties[k]).slice(0,100)}`);
//           }
//         });
//         // בדיקה כללית של כל שדות ב־properties
//         Object.entries(feat.properties).forEach(([k, v]) => {
//           // להמנע מספירה ארוכה מדי — רק אם הערך לא פשוט נדפיס טיפוס
//           if (typeof v === "object" && v !== null) {
//             console.log(`  * ${k}: ${Array.isArray(v) ? "array" : "object"} (keys: ${Object.keys(v).slice(0,5).join(", ")})`);
//           }
//         });
//       }
//     });
//   } else {
//     console.log("No features array in response. Full response:");
//     console.log(JSON.stringify(data, null, 2));
//   }
// }

// inspectGeocoding().catch(e => console.error(e));



































let userText = 'I want to travel from New York to Los Angeles next month. I prefer a direct flight and would like to avoid long layovers. I would also like to have a window seat if possible. The trip should last about 6 hours.';

// const prompt = `
// Analyze the following user text describing a trip request.
// Extract the data and return ONLY a valid JSON object that matches this schema:
// {
//   "origin": "string | null",
//   "destination": "string | null",
//   "trip_type": "string | null",
//   "preferences": ["string"],
//   "duration": "string | null"
// }

// User text: "${userText}"
// `;

const prompt = `
Analyze the following user text describing a trip request.
Extract the data and return ONLY a valid JSON object that matches this docs:
https://apidocs.geoapify.com/docs

User text: "${userText}"
`;
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_KEY; 

const ai = new GoogleGenAI({
  apiKey: API_KEY, // העברת המפתח ישירות
});
async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log(response.text);
}

await main();

