import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { analyzeReportWithPuter } from "../services/puterAI";
import {
  MapPin,
  ImagePlus,
  BrainCircuit,
  Sparkles,
  PenTool,
  Bot,
  Send,
  Loader2,
  Check,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Tag,
  FileText,
} from "lucide-react";

// Map frontend category values to backend enum values
const CATEGORY_MAP = {
  infrastructure: "Infrastructure",
  sanitation: "Waste Management",
  water: "Utilities",
  electricity: "Utilities",
  safety: "Safety",
  transportation: "Transportation",
  environment: "Environment",
  other: "Other",
};

// Map severity to colors and scores
const SEVERITY_CONFIG = {
  High: {
    color: "text-red-600",
    bg: "bg-red-100",
    barColor: "bg-red-500",
    score: 85,
  },
  Medium: {
    color: "text-orange-600",
    bg: "bg-orange-100",
    barColor: "bg-orange-500",
    score: 55,
  },
  Low: {
    color: "text-green-600",
    bg: "bg-green-100",
    barColor: "bg-green-500",
    score: 25,
  },
  Unknown: {
    color: "text-gray-600",
    bg: "bg-gray-100",
    barColor: "bg-gray-400",
    score: 0,
  },
};

// Priority tiers derived from the AI severity score
const PRIORITY_TIERS = [
  { min: 85, label: "Critical", color: "text-red-700", bg: "bg-red-100" },
  { min: 70, label: "High", color: "text-orange-700", bg: "bg-orange-100" },
  { min: 40, label: "Medium", color: "text-amber-700", bg: "bg-amber-100" },
  { min: 0, label: "Low", color: "text-green-700", bg: "bg-green-100" },
];
const getPriority = (score) =>
  PRIORITY_TIERS.find((tier) => score >= tier.min) ??
  PRIORITY_TIERS[PRIORITY_TIERS.length - 1];

// Map categories to suggested authorities
const AUTHORITY_MAP = {
  Infrastructure: "City Public Works Dept.",
  "Waste Management": "Sanitation & Waste Dept.",
  Utilities: "Utilities Board",
  Safety: "Public Safety Office",
  Transportation: "Transport Authority",
  Environment: "Environmental Agency",
  Other: "General Municipal Office",
};

const ReportIssue = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle"); // 'idle' | 'submitting' | 'analyzing' | 'submitted'
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  // AI analysis result from backend (populated after submission)
  const [aiResult, setAiResult] = useState(null);

  const handleSubmit = async () => {
    setError("");

    // Basic validation
    if (!title.trim()) {
      setError("Please provide a title for the issue.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (!location.trim()) {
      setError("Please provide a location.");
      return;
    }

    setStatus("submitting");

    try {
      const backendCategory = CATEGORY_MAP[category] || "Other";

      // Create report via API
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append(
        "description",
        description.trim() || "No description provided",
      );
      formData.append("category", backendCategory);
      formData.append("location", location.trim());
      images.forEach((file) => {
        formData.append("images", file);
      });

      const createdReport = await api.createReport(formData);

      setStatus("analyzing");
      const firstImageIndex = images.findIndex((file) =>
        file.type.startsWith("image/"),
      );
      const imageUrl =
        firstImageIndex !== -1
          ? createdReport.images?.[firstImageIndex]?.url
          : undefined;

      // Run the AI analysis in the browser with Puter (free — redirects the
      // visitor to Puter's sign-in page first if they aren't logged in yet).
      let clientAnalysis = null;
      try {
        clientAnalysis = await analyzeReportWithPuter({
          title: title.trim(),
          description: description.trim() || "No description provided",
          imageUrl,
        });
      } catch (puterErr) {
        // Puter unavailable or sign-in cancelled — backend will analyze instead.
        console.warn("Puter AI analysis failed, using backend fallback:", puterErr);
      }

      let saved;
      try {
        saved = await api.saveReportAnalysis(createdReport._id, {
          title: title.trim(),
          description: description.trim() || "No description provided",
          imageUrl,
          analysis: clientAnalysis,
        });
      } catch (saveErr) {
        console.error("Failed to save AI analysis:", saveErr);
      }

      if (saved?.analysisStatus === "completed") {
        setAiResult(saved);
      } else {
        setAiResult({
          failed: true,
          summary:
            saved?.summary ||
            "AI analysis was unavailable at the time of submission.",
        });
      }

      setStatus("submitted");

      // Navigate to feed after a delay to let user see the AI result
      setTimeout(() => {
        navigate("/feed");
      }, 5000);
    } catch (err) {
      console.error("Report submission error:", err);
      setError(err.message || "Failed to submit report. Please try again.");
      setStatus("idle");
    }
  };

  // Get severity config for display. The score comes from the AI (severityScore);
  // SEVERITY_CONFIG scores are only a fallback for results missing a numeric score.
  const severityInfo = aiResult
    ? SEVERITY_CONFIG[aiResult.severity] || SEVERITY_CONFIG.Unknown
    : null;
  const severityScore =
    aiResult && !aiResult.failed
      ? (aiResult.severityScore ?? severityInfo.score)
      : null;
  const suggestedAuthority =
    aiResult && !aiResult.failed
      ? AUTHORITY_MAP[aiResult.verifiedCategory] || "General Municipal Office"
      : null;
  const priority = severityScore !== null ? getPriority(severityScore) : null;

  return (
    <div className="w-full flex flex-col gap-6 md:gap-12 pb-12">
      <div className="flex flex-col gap-2 max-w-3xl">
        <h2 className="font-headline-md text-3xl font-semibold text-on-surface">
          Report an Issue
        </h2>
        <p className="font-body-md text-base text-on-surface-variant">
          Provide details to help us and our AI quickly route your concern to
          the right authority.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-3xl lg:max-w-none flex items-center gap-3 bg-error-container/30 border border-error/30 text-error rounded-lg px-4 py-3 text-sm font-medium animate-fade-in-up">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-4 md:p-8">
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-1">
              <label
                className="font-medium text-sm text-on-surface"
                htmlFor="title"
              >
                Issue Title
              </label>
              <input
                className="border border-outline-variant/50 rounded-lg px-4 py-2 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base text-on-surface"
                id="title"
                placeholder="e.g., Large pothole on Main St."
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={status !== "idle"}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="font-medium text-sm text-on-surface"
                htmlFor="category"
              >
                Category
              </label>
              <select
                className="border border-outline-variant/50 rounded-lg px-4 py-2 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base text-on-surface appearance-none"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={status !== "idle"}
              >
                <option value="">Select a category</option>
                <option value="infrastructure">Infrastructure & Roads</option>
                <option value="sanitation">Waste & Sanitation</option>
                <option value="water">Water Supply</option>
                <option value="electricity">Electricity & Lighting</option>
                <option value="safety">Safety Concern</option>
                <option value="transportation">Transportation</option>
                <option value="environment">Environment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="font-medium text-sm text-on-surface"
                htmlFor="location"
              >
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-outline-variant" />
                <input
                  className="w-full border border-outline-variant/50 rounded-lg pl-10 pr-4 py-2 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base text-on-surface"
                  id="location"
                  placeholder="Search address or drop pin"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={status !== "idle"}
                />
              </div>
              <div
                className="h-32 bg-surface-container-low rounded-lg mt-2 overflow-hidden relative bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800&h=300')",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="font-semibold text-sm text-primary">
                    Adjust Map Pin
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="font-medium text-sm text-on-surface"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                className="border border-outline-variant/50 rounded-lg px-4 py-2 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base text-on-surface resize-none"
                id="description"
                placeholder="Provide more details about the issue..."
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={status !== "idle"}
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm text-on-surface">
                Image Upload (Optional — improves AI Analysis)
              </label>
              <div
                className="border-2 border-dashed border-outline-variant/50 rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current.click()}
              >
                <ImagePlus className="w-10 h-10 text-outline-variant group-hover:text-primary transition-colors mb-2" />
                <p className="text-base text-on-surface-variant text-center">
                  Drag and drop or click to upload
                </p>
                <p className="text-sm text-outline text-center mt-1">
                  JPG, PNG up to 5MB — AI will analyze your image
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {images.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-16 h-16 object-cover rounded-md border border-outline-variant/30"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImages((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-error/90"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status !== "idle"}
                className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all shadow-sm flex items-center gap-2 ${
                  status === "submitted"
                    ? "bg-outline-variant text-on-surface"
                    : "bg-secondary text-white hover:opacity-90 active:scale-[0.98]"
                } ${status === "submitting" || status === "analyzing" ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {status === "idle" && "Submit Report"}
                {status === "submitting" && (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
                  </>
                )}
                {status === "analyzing" && (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> AI Analyzing...
                  </>
                )}
                {status === "submitted" && (
                  <>
                    <Check className="w-5 h-5" /> Submitted
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* AI Analysis & Status Section */}
        <div
          className={`lg:col-span-5 flex flex-col gap-4 transition-all duration-500 ${status === "idle" ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        >
          <div className="bg-[#F0F7FF] rounded-xl p-4 md:p-8 ai-gradient-border shadow-sm flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit className="w-20 h-20" />
            </div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Sparkles className="w-6 h-6 text-primary fill-current" />
              <h3 className="text-xl font-semibold text-primary">
                AI Analysis
              </h3>
              {(status === "submitting" || status === "analyzing") && (
                <Loader2 className="w-5 h-5 text-primary animate-spin ml-auto" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/60 rounded-lg p-3">
                <p className="font-bold text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3" /> AI Verified Category
                </p>
                <p className="font-medium text-sm text-on-surface">
                  {aiResult
                    ? aiResult.failed
                      ? "Unavailable"
                      : aiResult.verifiedCategory
                    : status === "analyzing"
                      ? "Analyzing..."
                      : "--"}
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <p className="font-bold text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Severity Level
                </p>
                {aiResult ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${severityInfo.bg} ${severityInfo.color}`}
                  >
                    {aiResult.failed ? "Unavailable" : aiResult.severity}
                  </span>
                ) : (
                  <p className="font-medium text-sm text-on-surface">
                    {status === "analyzing" ? "Analyzing..." : "--"}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-4 mt-2 relative z-10">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Severity Score
                  </p>
                  {priority && (
                    <span
                      className={`inline-flex items-center self-start px-2 py-0.5 rounded-full text-xs font-bold ${priority.bg} ${priority.color}`}
                    >
                      {priority.label} Priority
                    </span>
                  )}
                </div>
                <p
                  className={`text-3xl font-bold ${severityScore !== null ? severityInfo.color : "text-gray-400"}`}
                >
                  {severityScore !== null ? `${severityScore}/100` : "--/100"}
                </p>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${severityScore !== null ? severityInfo.barColor : "bg-gray-300"}`}
                  style={{
                    width: severityScore !== null ? `${severityScore}%` : "0%",
                  }}
                ></div>
              </div>
              <p className="text-sm text-on-surface-variant mt-2">
                {aiResult
                  ? aiResult.failed
                    ? "AI analysis was unavailable — your report was still submitted successfully."
                    : `Priority: ${priority?.label ?? "Unknown"} · Severity: ${aiResult.severity}. Suggested authority: ${suggestedAuthority}.`
                  : status === "analyzing"
                    ? "AI is analyzing your report..."
                    : "Awaiting submission for analysis..."}
              </p>
            </div>

            <div className="bg-white/60 rounded-lg p-4 mt-2 relative z-10">
              <p className="font-bold text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3" /> AI Generated Summary
              </p>
              <p className="text-sm text-on-surface italic">
                {aiResult
                  ? aiResult.summary
                  : status === "analyzing"
                    ? "Generating summary from your report..."
                    : "Submit your report to generate an AI-powered analysis."}
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-4 md:p-8 flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-on-surface">
              Report Status
            </h3>

            {/* Step 1 */}
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${status !== "idle" ? "bg-secondary-container text-secondary" : "bg-surface-container-high text-outline"}`}
              >
                {status !== "idle" ? (
                  <CheckCircle className="w-4 h-4 fill-current text-white" />
                ) : (
                  <PenTool className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-on-surface">Drafting</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-4 relative">
              <div className="absolute left-4 top-[-24px] bottom-full w-[2px] bg-outline-variant/30 -z-0"></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${
                  status === "analyzing"
                    ? "bg-primary text-white animate-pulse"
                    : status === "submitted"
                      ? "bg-secondary-container text-secondary"
                      : "bg-surface-container-high text-outline"
                }`}
              >
                {status === "submitted" ? (
                  <CheckCircle className="w-4 h-4 fill-current text-white" />
                ) : status === "analyzing" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium text-sm ${
                    status === "analyzing"
                      ? "text-primary font-bold"
                      : status === "submitted"
                        ? "text-on-surface"
                        : "text-on-surface-variant"
                  }`}
                >
                  {status === "analyzing"
                    ? "AI Analyzing Report..."
                    : "AI Processing"}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-4 relative">
              <div className="absolute left-4 top-[-24px] bottom-full w-[2px] bg-outline-variant/30 -z-0"></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${status === "submitted" ? "bg-primary-container text-primary" : "bg-surface-container-high text-outline"}`}
              >
                <Send className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium text-sm ${status === "submitted" ? "text-on-surface" : "text-on-surface-variant"}`}
                >
                  Routed to Authority
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
