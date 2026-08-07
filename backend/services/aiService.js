import OpenAI from "openai";

// Must stay in sync with the enums in models/Report.js — unvalidated values would
// throw a Mongoose ValidationError inside report.save().
const VALID_CATEGORIES = [
  "Infrastructure",
  "Waste Management",
  "Utilities",
  "Safety",
  "Transportation",
  "Environment",
  "Other",
];
const VALID_SEVERITIES = ["High", "Medium", "Low"];
const SEVERITY_FALLBACK_SCORE = { High: 85, Medium: 55, Low: 25 };
const MAX_SUMMARY_LENGTH = 1000;
const AI_TIMEOUT_MS = 60_000;

// Provider selection: "gemini" (free tier) or "openai" (paid).
// Defaults to Gemini when a GEMINI_API_KEY is present, since it costs nothing.
const resolveProvider = () => {
  const explicit = (process.env.AI_PROVIDER || "").toLowerCase();
  if (explicit === "openai" || explicit === "gemini") return explicit;
  return process.env.GEMINI_API_KEY ? "gemini" : "openai";
};

const OPENAI_MODEL = () => process.env.OPENAI_MODEL || "gpt-5.6-luna";
const GEMINI_MODEL = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

let openaiClient;
const getOpenAI = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

export const FAILED_ANALYSIS = Object.freeze({
  analysisStatus: "failed",
  severity: "Unknown",
  summary: "AI analysis was unavailable at the time of submission.",
});

/**
 * Validates and clamps an AI analysis payload before it is saved to the database.
 * @param {Object} raw - Raw analysis values.
 * @returns {Object} A safe { analysisStatus, verifiedCategory, severity, severityScore, summary }.
 */
export const sanitizeAnalysis = (raw) => {
  if (!raw || typeof raw !== "object" || raw.analysisStatus !== "completed") {
    return { ...FAILED_ANALYSIS };
  }

  const verifiedCategory = VALID_CATEGORIES.includes(raw.verifiedCategory)
    ? raw.verifiedCategory
    : "Other";

  let severityScore = Number(raw.severityScore);
  severityScore = Number.isFinite(severityScore)
    ? Math.round(Math.min(100, Math.max(0, severityScore)))
    : undefined;

  let severity = raw.severity;
  if (!VALID_SEVERITIES.includes(severity)) {
    if (severityScore !== undefined) {
      severity =
        severityScore >= 70 ? "High" : severityScore >= 40 ? "Medium" : "Low";
    } else {
      severity = "Unknown";
    }
  }

  if (severityScore === undefined && severity !== "Unknown") {
    severityScore = SEVERITY_FALLBACK_SCORE[severity];
  }

  return {
    analysisStatus: "completed",
    verifiedCategory,
    severity,
    severityScore,
    summary:
      typeof raw.summary === "string"
        ? raw.summary.trim().slice(0, MAX_SUMMARY_LENGTH)
        : "",
  };
};

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`AI call timed out after ${ms}ms`)),
        ms,
      ),
    ),
  ]);

const extractText = (response) => {
  if (typeof response === "string") return response;
  if (typeof response.output_text === "string") return response.output_text;
  if (Array.isArray(response.output)) {
    return response.output
      .map((item) => {
        if (typeof item === "string") return item;
        if (Array.isArray(item?.content)) {
          return item.content
            .map((part) => (typeof part === "string" ? part : part?.text || ""))
            .join("");
        }
        return "";
      })
      .join("\n");
  }
  return String(response ?? "");
};

const parseJson = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in AI response");
  }
  return JSON.parse(text.slice(start, end + 1));
};

// --- OpenAI caller (paid) ---
const callOpenAI = async ({ analysisPrompt, imageUrl }) => {
  const response = await withTimeout(
    getOpenAI().responses.create({
      model: OPENAI_MODEL(),
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: analysisPrompt },
            ...(imageUrl ? [{ type: "input_image", image_url: imageUrl }] : []),
          ],
        },
      ],
    }),
    AI_TIMEOUT_MS,
  );
  return extractText(response);
};

// --- Gemini caller (free tier) ---
// Uses the REST API directly with Node's built-in fetch, so no SDK is needed.
// Gemini can't read arbitrary image URLs, so we download the (Cloudinary) image
// and send it inline as base64.
const callGemini = async ({ analysisPrompt, imageUrl }) => {
  const parts = [{ text: analysisPrompt }];

  if (imageUrl) {
    const imgRes = await withTimeout(fetch(imageUrl), AI_TIMEOUT_MS);
    if (!imgRes.ok) {
      throw new Error(`Failed to download report image (${imgRes.status})`);
    }
    const mimeType =
      imgRes.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    const data = Buffer.from(await imgRes.arrayBuffer()).toString("base64");
    parts.push({ inline_data: { mime_type: mimeType, data } });
  }

  const res = await withTimeout(
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL()}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({ contents: [{ role: "user", parts }] }),
      },
    ),
    AI_TIMEOUT_MS,
  );

  if (!res.ok) {
    throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
  }

  const body = await res.json();
  const text = body.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");
  if (!text) {
    throw new Error(
      `Gemini returned no text (finishReason: ${body.candidates?.[0]?.finishReason || "unknown"})`,
    );
  }
  return text;
};

export const performAnalysis = async ({ title, description, imageUrl }) => {
  const provider = resolveProvider();
  try {
    const prompt = `${
      "You are an AI assistant for a civic issue reporting platform called NagarBondhu.\n" +
      "You analyze citizen reports of civic issues. A report always has a title and description, and MAY include a photo.\n" +
      "Verify the category, assess the severity, and provide a short summary.\n\n" +
      "Reply with ONLY valid JSON (no markdown, no extra text) matching this structure:\n" +
      "{\n" +
      '  "verifiedCategory": "Infrastructure", // exactly one of: Infrastructure, Waste Management, Utilities, Safety, Transportation, Environment, Other\n' +
      '  "severity": "High", // exactly one of: High, Medium, Low\n' +
      '  "severityScore": 85, // integer 0-100, consistent with severity (Low: 1-39, Medium: 40-69, High: 70-100)\n' +
      '  "summary": "A concise 1-2 sentence summary. If an image is attached, describe what is actually visible in it; otherwise base the summary on the title and description only."\n' +
      "}"
    }\n\n`;

    const analysisPrompt = `${prompt}\nThe user provided this title: "${title}" and description: "${description}". ${
      imageUrl
        ? "Analyze the attached image of the issue and output the JSON."
        : "No image was provided; analyze the issue based on the title and description only and output the JSON."
    }`;

    const rawText =
      provider === "gemini"
        ? await callGemini({ analysisPrompt, imageUrl })
        : await callOpenAI({ analysisPrompt, imageUrl });

    const parsed = parseJson(rawText);

    return {
      analysisStatus: "completed",
      verifiedCategory: parsed.verifiedCategory,
      severity: parsed.severity,
      severityScore: parsed.severityScore,
      summary: parsed.summary,
    };
  } catch (error) {
    console.error(`AI analysis error (provider: ${provider}):`, error);
    return { ...FAILED_ANALYSIS };
  }
};
