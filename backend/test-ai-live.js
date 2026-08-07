// Live end-to-end test of the AI analyzer (performAnalysis -> provider -> sanitizeAnalysis).
import dotenv from "dotenv";
dotenv.config();

const { performAnalysis, sanitizeAnalysis } = await import(
  "./services/aiService.js"
);

const provider =
  (process.env.AI_PROVIDER || "").toLowerCase() ||
  (process.env.GEMINI_API_KEY ? "gemini" : "openai");
console.log("Provider:", provider);
if (provider === "gemini") {
  console.log("Model:", process.env.GEMINI_MODEL || "gemini-2.5-flash (default)");
  console.log(
    "Gemini key present:",
    Boolean(process.env.GEMINI_API_KEY),
    "| prefix:",
    (process.env.GEMINI_API_KEY || "").slice(0, 6),
  );
} else {
  console.log("Model:", process.env.OPENAI_MODEL || "gpt-5.6-luna (default)");
  console.log(
    "OpenAI key present:",
    Boolean(process.env.OPENAI_API_KEY),
    "| prefix:",
    (process.env.OPENAI_API_KEY || "").slice(0, 7),
  );
}

console.log("\n--- Test 1: text-only report ---");
const raw = await performAnalysis({
  title: "Broken streetlight on main road",
  description:
    "The streetlight near the Ward 12 market has been out for a week. The area is completely dark at night and feels unsafe for pedestrians.",
});
console.log("Sanitized result:", JSON.stringify(sanitizeAnalysis(raw), null, 2));
const textOk = raw.analysisStatus === "completed";

console.log("\n--- Test 2: report with an image ---");
const rawImg = await performAnalysis({
  title: "Pothole on the road",
  description: "There is a large pothole causing problems for vehicles.",
  imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
});
console.log(
  "Sanitized result:",
  JSON.stringify(sanitizeAnalysis(rawImg), null, 2),
);
const imageOk = rawImg.analysisStatus === "completed";

console.log("\n==============================");
console.log(`Text analysis:  ${textOk ? "✅ WORKING" : "❌ FAILED"}`);
console.log(`Image analysis: ${imageOk ? "✅ WORKING" : "❌ FAILED"}`);
if (!textOk || !imageOk) process.exitCode = 1;
