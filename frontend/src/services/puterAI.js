const AI_MODEL = "gemini-3.6-flash";

const buildPrompt = ({ title, description, imageUrl }) => {
  const header =
    "You are an AI assistant for a civic issue reporting platform called NagarBondhu.\n" +
    "You analyze citizen reports of civic issues. A report always has a title and description, and MAY include a photo.\n" +
    "Verify the category, assess the severity, and provide a short summary.\n\n" +
    "Reply with ONLY valid JSON (no markdown, no extra text) matching this structure:\n" +
    "{\n" +
    '  "verifiedCategory": "Infrastructure",\n' +
    '  "severity": "High",\n' +
    '  "severityScore": 85,\n' +
    '  "summary": "A concise 1-2 sentence summary."\n' +
    "}\n\n";

  return `${header}\nThe user provided this title: "${title}" and description: "${description}". ${
    imageUrl
      ? "Analyze the attached image of the issue and output the JSON."
      : "No image was provided; analyze the issue based on the title and description only and output the JSON."
  }`;
};

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
