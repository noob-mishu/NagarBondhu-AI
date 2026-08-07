import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft, ImagePlus, X, Tag, MapPin, Loader2, Megaphone, Send, BarChart3, Plus
} from 'lucide-react';

// Categories mirror the backend enum (same list as report categories).
const CATEGORIES = [
  'Infrastructure', 'Waste Management', 'Utilities', 'Safety', 'Transportation', 'Environment', 'Other'
];

/**
 * AdminDiscussionForm — one form, two jobs:
 *  - /admin/discussions/new        → create mode (optionally prefilled from a report via ?reportId=)
 *  - /admin/discussions/:id/edit   → edit mode (prefilled from the existing discussion)
 * Admin-only (the route is wrapped in AdminRoute in App.jsx; the API also enforces it).
 */
const AdminDiscussionForm = () => {
  const { id } = useParams(); // present → edit mode
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId'); // present → prefill from this report
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({ title: '', description: '', category: 'Other', location: '' });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(''); // existing URL or local object URL
  const [linkedReport, setLinkedReport] = useState(null);

  // Optional poll: toggled on/off, with a question and at least 2 options.
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const [loading, setLoading] = useState(isEdit || Boolean(reportId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Prefill the form — from the discussion (edit mode) or from a report (assign flow).
  useEffect(() => {
    const load = async () => {
      try {
        if (isEdit) {
          const d = await api.getDiscussionById(id);
          setForm({
            title: d.title,
            description: d.description,
            category: d.category,
            location: d.location || '',
          });
          setTags(d.tags || []);
          if (d.coverImage?.url) setCoverPreview(d.coverImage.url);
          if (d.report) setLinkedReport(d.report);
          if (d.poll?.options?.length) {
            setHasPoll(true);
            setPollQuestion(d.poll.question);
            setPollOptions(d.poll.options.map((o) => o.text));
          }
        } else if (reportId) {
          const r = await api.getReportById(reportId);
          setLinkedReport(r);
          setForm({
            title: `Discussion: ${r.title}`,
            description: r.description,
            category: CATEGORIES.includes(r.category) ? r.category : 'Other',
            location: r.location || '',
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, reportId]);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Validate the poll before sending anything.
    const cleanOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (hasPoll) {
      if (!pollQuestion.trim()) {
        setError('Please enter a poll question, or remove the poll.');
        setSaving(false);
        return;
      }
      if (cleanOptions.length < 2) {
        setError('A poll needs at least 2 options.');
        setSaving(false);
        return;
      }
    }

    try {
      // FormData because the cover image is a file upload.
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('location', form.location);
      fd.append('tags', JSON.stringify(tags));
      if (coverFile) fd.append('coverImage', coverFile);
      if (!isEdit && linkedReport?._id) fd.append('reportId', linkedReport._id);

      // Poll: send the data when one is set. In edit mode, sending '' tells the
      // backend to remove a previously saved poll.
      if (hasPoll) {
        fd.append('poll', JSON.stringify({ question: pollQuestion.trim(), options: cleanOptions }));
      } else if (isEdit) {
        fd.append('poll', '');
      }

      const saved = isEdit
        ? await api.updateDiscussion(id, fd)
        : await api.createDiscussion(fd);

      navigate(`/discussions/${saved._id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <Link to="/discussions" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary font-medium mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Discussions
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-on-surface tracking-tight">
              {isEdit ? 'Edit Discussion' : 'Create Discussion'}
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              {isEdit ? 'Update this official discussion topic.' : 'Start an official discussion — every citizen will be notified.'}
            </p>
          </div>
        </div>
      </div>

      {/* Linked report banner (assign-from-report flow) */}
      {linkedReport && (
        <div className="px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl">
          <span className="font-label-caps text-[10px] text-primary font-bold tracking-wider uppercase">Linked Report</span>
          <p className="font-label-md text-sm text-on-surface font-medium mt-0.5">{linkedReport.title}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 bg-error/5 border border-error/20 text-error px-4 py-3 rounded-xl font-body-sm text-sm">
          <span>{error}</span>
          <button onClick={() => setError('')} className="p-1 hover:bg-error/10 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col gap-5">
        {/* Cover image */}
        <div>
          <label className="block font-label-md text-sm font-medium text-on-surface mb-2">Cover Image (optional)</label>
          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-outline-variant/30">
              <img src={coverPreview} alt="Cover preview" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={() => { setCoverFile(null); setCoverPreview(''); }}
                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 h-36 border-2 border-dashed border-outline-variant/50 rounded-xl cursor-pointer text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors">
              <ImagePlus className="w-7 h-7" />
              <span className="font-label-md text-sm font-medium">Click to upload a cover image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block font-label-md text-sm font-medium text-on-surface mb-1.5">Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 font-body-sm text-sm text-on-surface focus:outline-none focus:border-primary"
            placeholder="What should the community discuss?"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-label-md text-sm font-medium text-on-surface mb-1.5">Description *</label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 font-body-sm text-sm text-on-surface focus:outline-none focus:border-primary resize-none"
            placeholder="Explain the topic and what kind of suggestions you're looking for..."
          />
        </div>

        {/* Category + Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-label-md text-sm font-medium text-on-surface mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 font-body-sm text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-label-md text-sm font-medium text-on-surface mb-1.5">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location (optional)</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 font-body-sm text-sm text-on-surface focus:outline-none focus:border-primary"
              placeholder="e.g. Mirpur 10, Ward 12"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block font-label-md text-sm font-medium text-on-surface mb-1.5">
            <span className="inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Tags (optional)</span>
          </label>
          <div className="flex flex-wrap items-center gap-2 bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-2 focus-within:border-primary">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-semibold">
                {t}
                <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="hover:text-error">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              className="flex-1 min-w-[120px] bg-transparent font-body-sm text-sm text-on-surface focus:outline-none py-0.5"
              placeholder={tags.length === 0 ? 'Type a tag and press Enter' : 'Add another...'}
            />
          </div>
        </div>

        {/* Poll (optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-label-md text-sm font-medium text-on-surface">
              <span className="inline-flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Poll (optional)</span>
            </label>
            {hasPoll && (
              <button
                type="button"
                onClick={() => { setHasPoll(false); setPollQuestion(''); setPollOptions(['', '']); }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-error hover:underline"
              >
                <X className="w-3 h-3" /> Remove poll
              </button>
            )}
          </div>

          {!hasPoll ? (
            <button
              type="button"
              onClick={() => setHasPoll(true)}
              className="flex items-center justify-center gap-2 w-full h-14 border-2 border-dashed border-outline-variant/50 rounded-xl text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors font-label-md text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add a poll — let citizens vote on options
            </button>
          ) : (
            <div className="flex flex-col gap-3 bg-surface-container-low border border-outline-variant/40 rounded-xl p-4">
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-2.5 font-body-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                placeholder="Poll question, e.g. Which option do you prefer?"
              />
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => setPollOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-2 font-body-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                    placeholder={`Option ${i + 1}`}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions((prev) => prev.filter((_, j) => j !== i))}
                      className="p-2 text-on-surface-variant hover:text-error rounded-lg hover:bg-error/5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <button
                  type="button"
                  onClick={() => setPollOptions((prev) => [...prev, ''])}
                  className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary hover:underline"
                >
                  <Plus className="w-4 h-4" /> Add option
                </button>
              )}
              {isEdit && (
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Votes are kept for options whose text stays the same.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-outline-variant/40 font-label-md text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-label-md text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Publish & Notify Citizens'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminDiscussionForm;
