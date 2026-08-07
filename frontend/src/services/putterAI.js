/**
 * ============================================================================
 *  Puter AI Service — Free in-browser AI analysis via Puter.js
 * ============================================================================
 *
 * Runs the report analysis directly in the browser using Puter.js
 * (loaded from https://js.puter.com/v2/ in index.html). Puter's "User Pays"
 * model makes the AI call free for the app: if the visitor isn't signed in
 * to Puter yet, Puter automatically opens its sign-in page and continues the
 * analysis after login.
 *
 * The backend keeps its own server-side analyzer as a fallback, and always
 * re-validates whatever the client sends (sanitizeAnalysis), so a forged
 * result can never corrupt the database.
 */

const AI_MODEL = "gemini-3.6-flash";

// Must stay in sync with backend/services/aiService.js and models/Report.js.
const buildPrompt = ({ title, description, imageUrl }) => {
  const header =
    "You are an AI assistant for a civic issue reporting platform called NagarBondhu.\n" +
    "You analyze citizen reports of civic issues. A report always has a title and description, and MAY include a photo.\n" +
    "Verify the category, assess the severity, and provide a short summary.\n\n" +
    "Reply with ONLY valid JSON (no markdown, no extra text) matching this structure:\n" +
    "{\n" +
    '  "verifiedCategory": "Infrastructure", // exactly one of: Infrastructure, Waste Management, Utilities, Safety, Transportation, Environment, Other\n' +
    '  "severity": "High", // exactly one of: High, Medium, Low\n' +
    '  "severityScore": 85, // integer 0-100, consistent with severity (Low: 1-39, Medium: 40-69, High: 70-100)\n' +
    '  "summary": "A concise 1-2 sentence summary. If an image is attached, describe what is actually visible in it; otherwise base the summary on the title and description only."\n' +
    "}\n\n";

  return `${header}\nThe user provided this title: "${title}" and description: "${description}". ${
    imageUrl
      ? "Analyze the attached image of the issue and output the JSON."
      : "No image was provided; analyze the issue based on the title and description only and output the JSON."
  }`;
};

// Puter's chat response shape varies by model: it can be a plain string, or an
// object with message.content as a string or an array of content parts.
const extractText = (response) => {
  if (typeof response === "string") return response;
  const content = response?.message?.content ?? response?.text ?? response;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  }
  return String(content ?? "");
};

const parseJson = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in AI response");
  }
  return JSON.parse(text.slice(start, end + 1));
};

/**
 * Analyze a report in the browser with Puter AI.
 * Triggers Puter's sign-in flow automatically when the visitor isn't logged in.
 * @returns {Promise<Object>} raw analysis: { analysisStatus, verifiedCategory, severity, severityScore, summary }
 * @throws when Puter.js isn't loaded, the user cancels sign-in, or the model fails
 */
export const analyzeReportWithPuter = async ({ title, description, imageUrl }) => {
  if (typeof window === "undefined" || !window.puter?.ai?.chat) {
    throw new Error("Puter.js is not loaded");
  }

  const prompt = buildPrompt({ title, description, imageUrl });

  const response = imageUrl
    ? await window.puter.ai.chat(prompt, imageUrl, { model: AI_MODEL })
    : await window.puter.ai.chat(prompt, { model: AI_MODEL });

  const parsed = parseJson(extractText(response));

  return {
    analysisStatus: "completed",
    verifiedCategory: parsed.verifiedCategory,
    severity: parsed.severity,
    severityScore: parsed.severityScore,
    summary: parsed.summary,
  };
};

export default { analyzeReportWithPuter };
