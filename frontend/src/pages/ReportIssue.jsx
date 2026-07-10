import React, { useRef, useState } from "react";
import { Check, ImagePlus, Loader2, MapPin, Navigation, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialForm = {
  title: "",
  category: "",
  location: "",
  description: "",
};

const ReportIssue = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [locationStatus, setLocationStatus] = useState("idle");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectImage = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, image: "Please choose a JPG or PNG image." }));
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, image: "Image size must be 5MB or less." }));
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
    setErrors((current) => ({ ...current, image: "" }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors((current) => ({ ...current, location: "Location is not supported by this browser." }));
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          location: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
        }));
        setErrors((current) => ({ ...current, location: "" }));
        setLocationStatus("idle");
      },
      () => {
        setErrors((current) => ({ ...current, location: "We could not access your location. Enter it manually instead." }));
        setLocationStatus("idle");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Please enter an issue title.";
    if (!form.category) nextErrors.category = "Please select a category.";
    if (!form.location.trim()) nextErrors.location = "Please provide the issue location.";
    if (!form.description.trim()) nextErrors.description = "Please describe the issue.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus("submitting");
    const report = {
      id: `NB-${Date.now().toString().slice(-6)}`,
      ...form,
      imageName: image?.name || null,
      status: "Submitted",
      createdAt: new Date().toISOString(),
    };

    try {
      const reports = JSON.parse(localStorage.getItem("nagarbondhu-reports") || "[]");
      localStorage.setItem("nagarbondhu-reports", JSON.stringify([report, ...reports]));
      setStatus("submitted");
      window.setTimeout(() => navigate("/dashboard"), 1200);
    } catch {
      setStatus("idle");
      setErrors({ form: "Your report could not be saved. Please try again." });
    }
  };

  const inputClass = "w-full border border-outline-variant/50 rounded-lg px-4 py-2 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base text-on-surface";

  return (
    <div className="w-full max-w-4xl px-4 py-8 md:px-8 md:py-12 pb-12">
      <div className="flex flex-col gap-2 max-w-3xl">
        <h2 className="font-headline-md text-3xl font-semibold text-on-surface">Report an Issue</h2>
        <p className="font-body-md text-base text-on-surface-variant">
          Provide details to help us and our AI quickly route your concern to the right authority.
        </p>
      </div>

      <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        {errors.form && <p className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">{errors.form}</p>}
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-on-surface" htmlFor="title">Issue Title</label>
          <input className={inputClass} id="title" name="title" value={form.title} onChange={updateField} placeholder="e.g., Large pothole on Main St." type="text" aria-invalid={Boolean(errors.title)} />
          {errors.title && <p className="text-sm text-error">{errors.title}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-on-surface" htmlFor="category">Category</label>
          <select className={inputClass} id="category" name="category" value={form.category} onChange={updateField} aria-invalid={Boolean(errors.category)}>
            <option value="">Select a category</option><option value="infrastructure">Infrastructure & Roads</option><option value="sanitation">Waste & Sanitation</option><option value="water">Water Supply</option><option value="electricity">Electricity & Lighting</option><option value="other">Other</option>
          </select>
          {errors.category && <p className="text-sm text-error">{errors.category}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-on-surface" htmlFor="location">Location</label>
          <div className="flex gap-2">
            <div className="relative flex-1"><MapPin className="absolute left-3 top-2.5 w-5 h-5 text-outline-variant" /><input className={`${inputClass} pl-10`} id="location" name="location" value={form.location} onChange={updateField} placeholder="Search address or drop pin" type="text" aria-invalid={Boolean(errors.location)} /></div>
            <button type="button" onClick={useCurrentLocation} disabled={locationStatus === "loading"} className="rounded-lg border border-outline-variant/50 px-3 text-primary hover:bg-primary/5 disabled:opacity-60" aria-label="Use current location"><Navigation className={`h-5 w-5 ${locationStatus === "loading" ? "animate-pulse" : ""}`} /></button>
          </div>
          <p className="text-xs text-outline">Use the location button to add your current GPS coordinates.</p>
          {errors.location && <p className="text-sm text-error">{errors.location}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-on-surface" htmlFor="description">Description</label>
          <textarea className={`${inputClass} resize-none`} id="description" name="description" value={form.description} onChange={updateField} placeholder="Provide more details about the issue..." rows="4" aria-invalid={Boolean(errors.description)} />
          {errors.description && <p className="text-sm text-error">{errors.description}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm text-on-surface">Image Upload (Optional)</span>
          <input ref={fileInputRef} id="issue-image" className="sr-only" type="file" accept="image/jpeg,image/png" onChange={selectImage} />
          {imagePreview ? <div className="relative overflow-hidden rounded-xl border border-outline-variant/50"><img src={imagePreview} alt="Selected issue" className="h-52 w-full object-cover" /><button type="button" onClick={removeImage} className="absolute right-3 top-3 rounded-full bg-white p-2 text-on-surface shadow" aria-label="Remove selected image"><X className="h-4 w-4" /></button><p className="px-3 py-2 text-sm text-on-surface-variant">{image.name}</p></div> : <label htmlFor="issue-image" className="cursor-pointer border-2 border-dashed border-outline-variant/50 rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-low/50 hover:bg-surface-container-low"><ImagePlus className="w-10 h-10 text-outline-variant mb-2" /><p className="text-base text-on-surface-variant text-center">Drag and drop or click to upload</p><p className="text-sm text-outline text-center mt-1">JPG, PNG up to 5MB</p></label>}
          {errors.image && <p className="text-sm text-error">{errors.image}</p>}
        </div>

        <div className="pt-2 flex justify-end"><button type="submit" disabled={status !== "idle"} className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all shadow-sm flex items-center gap-2 ${status === "submitted" ? "bg-secondary text-white" : "bg-primary text-white hover:bg-primary-container"} ${status === "submitting" ? "opacity-75 cursor-not-allowed" : ""}`}>{status === "idle" && <><Upload className="h-5 w-5" />Submit Report</>}{status === "submitting" && <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</>}{status === "submitted" && <><Check className="w-5 h-5" />Submitted</>}</button></div>
      </form>
    </div>
  );
};

export default ReportIssue;
