import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Globe,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Filter,
  Loader2,
  AlertCircle,
  Inbox,
  Share2,
  Check,
  Send,
  Trash2,
  ChevronRight
} from 'lucide-react';

// Helper: format a date into "time ago" string
const timeAgo = (dateStr) => {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours} hrs ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

// Helper: get status badge styles
const getStatusBadge = (status) => {
  switch (status) {
    case 'Pending':
      return { bg: 'bg-primary-fixed text-on-primary-fixed', label: 'Open' };
    case 'Under Review':
      return { bg: 'bg-tertiary-fixed text-on-tertiary-fixed', label: 'Under Review' };
    case 'In Progress':
      return { bg: 'bg-tertiary-fixed text-on-tertiary-fixed', label: 'In Progress' };
    case 'Resolved':
      return { bg: 'bg-secondary-container text-on-secondary-container', label: '✓ Resolved' };
    case 'Rejected':
      return { bg: 'bg-error-container text-on-error-container', label: 'Rejected' };
    default:
      return { bg: 'bg-surface-container-high text-on-surface-variant', label: status };
  }
};

const avatarOf = (u) =>
  u?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'Citizen')}&background=0D8ABC&color=fff`;

// Skeleton loading card
const SkeletonCard = () => (
  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-4 flex flex-col gap-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-surface-container-high" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 bg-surface-container-high rounded w-24" />
        <div className="h-2 bg-surface-container-high rounded w-16" />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className="h-4 bg-surface-container-high rounded w-3/4" />
      <div className="h-3 bg-surface-container-high rounded w-full" />
      <div className="h-3 bg-surface-container-high rounded w-5/6" />
    </div>
    <div className="flex items-center gap-2">
      <div className="h-3 bg-surface-container-high rounded w-32" />
    </div>
  </div>
);

// ─── Inline comment section shown under a feed card ─────────────────────────

const CommentSection = ({ reportId, onCountChange }) => {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const list = await api.getReportComments(reportId);
        if (!cancelled) {
          setComments(list);
          onCountChange(list.length);
        }
      } catch (err) {
        console.error('Failed to load comments:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const post = async (e) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      const saved = await api.addReportComment(reportId, text.trim());
      const next = [...comments, saved];
      setComments(next);
      onCountChange(next.length);
      setText('');
    } catch (err) {
      console.error('Failed to post comment:', err.message);
    } finally {
      setPosting(false);
    }
  };

  const remove = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.deleteReportComment(commentId);
      const next = comments.filter((c) => c._id !== commentId);
      setComments(next);
      onCountChange(next.length);
    } catch (err) {
      console.error('Failed to delete comment:', err.message);
    }
  };

  return (
    <div className="border-t border-outline-variant/20 bg-surface-container-low/30 px-4 py-3 flex flex-col gap-3">
      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-on-surface-variant text-center py-1">
          No comments yet — start the conversation.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
          {comments.map((c) => {
            const canDelete = user && (c.user?._id === user._id || isAdmin);
            return (
              <div key={c._id} className="flex gap-2.5 group">
                <img src={avatarOf(c.user)} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl rounded-tl-md px-3.5 py-2 inline-block max-w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-on-surface">{c.user?.name || 'Citizen'}</span>
                      {c.user?.role === 'admin' && (
                        <span className="text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1 py-0.5 rounded">Official</span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface leading-snug whitespace-pre-line break-words">{c.comment}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 pl-2">
                    <span className="text-[10px] text-on-surface-variant">{timeAgo(c.createdAt)}</span>
                    {canDelete && (
                      <button
                        onClick={() => remove(c._id)}
                        className="text-[10px] font-semibold text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Composer */}
      {user ? (
        <form onSubmit={post} className="flex items-center gap-2.5">
          <img src={avatarOf(user)} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-full px-4 py-2 text-sm text-on-surface outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-outline"
          />
          <button
            type="submit"
            disabled={!text.trim() || posting}
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 active:scale-90 transition-all flex-shrink-0"
            aria-label="Post comment"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      ) : (
        <p className="text-xs text-on-surface-variant text-center">
          <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link> to comment.
        </p>
      )}
    </div>
  );
};

// ─── A single feed card ──────────────────────────────────────────────────────

const FeedCard = ({ report, index, onUpdate }) => {
  const { user } = useAuth();
  const [upvoting, setUpvoting] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const badge = getStatusBadge(report.status);
  const reporterName = report.reporter?.name || 'Anonymous';
  const upvoted = user ? (report.upvotes || []).includes(user._id) : false;

  // Support (upvote): optimistic flip, then sync with the server's real count.
  const handleUpvote = async () => {
    if (!user || upvoting) return;
    setUpvoting(true);
    const optimistic = {
      upvotes: upvoted
        ? (report.upvotes || []).filter((id) => id !== user._id)
        : [...(report.upvotes || []), user._id],
      upvoteCount: (report.upvoteCount || 0) + (upvoted ? -1 : 1),
    };
    onUpdate(report._id, optimistic);
    try {
      const res = await api.toggleUpvote(report._id);
      onUpdate(report._id, {
        upvoteCount: res.upvoteCount,
        upvotes: res.upvoted
          ? [...(report.upvotes || []).filter((id) => id !== user._id), user._id]
          : (report.upvotes || []).filter((id) => id !== user._id),
      });
    } catch (err) {
      // Server rejected — roll back to what it was.
      onUpdate(report._id, { upvotes: report.upvotes, upvoteCount: report.upvoteCount });
      console.error('Upvote failed:', err.message);
    } finally {
      setUpvoting(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/issue/${report._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: report.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      /* user cancelled the share sheet — nothing to do */
    }
  };

  const images = report.images || [];

  return (
    <article
      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <img
            alt={`${reporterName} avatar`}
            className="w-10 h-10 rounded-full object-cover bg-surface-variant ring-2 ring-outline-variant/20 ring-offset-2 ring-offset-surface-container-lowest"
            src={avatarOf(report.reporter)}
          />
          <div>
            <div className="font-semibold text-sm text-on-surface">{reporterName}</div>
            <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span>{timeAgo(report.createdAt)}</span>
              <span>•</span>
              <Globe className="w-3.5 h-3.5" />
              <span>{report.category}</span>
            </div>
          </div>
        </div>
        <span className={`${badge.bg} font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm flex-shrink-0`}>
          {badge.label}
        </span>
      </div>

      {/* Content */}
      <Link
        to={`/issue/${report._id}`}
        className="px-4 pb-3 flex flex-col gap-2 hover:bg-surface-container-low/50 transition-colors cursor-pointer group"
      >
        <h2 className="font-semibold text-lg text-on-surface group-hover:text-primary transition-colors leading-snug">
          {report.title}
        </h2>
        {report.description && (
          <p className="text-[15px] text-on-surface-variant leading-relaxed line-clamp-3">
            {report.description}
          </p>
        )}
        {report.location && (
          <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="line-clamp-1">{report.location}</span>
          </div>
        )}
      </Link>

      {/* Images: one image gets the full width, more become a grid */}
      {images.length > 0 && (
        <Link to={`/issue/${report._id}`} className="block">
          {images.length === 1 ? (
            <img
              src={images[0].url}
              alt="Report"
              className="w-full max-h-96 object-cover"
            />
          ) : (
            <div className={`grid gap-0.5 ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {images.slice(0, 3).map((img, i) => (
                <div key={i} className="relative aspect-[4/3]">
                  <img src={img.url} alt={`Report ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                  {i === 2 && images.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                      +{images.length - 3}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Link>
      )}

      {/* Counts strip */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/20">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
            <ThumbsUp className="w-3 h-3" />
          </span>
          <span className="font-medium">{report.upvoteCount || 0} Supports</span>
        </span>
        <button
          onClick={() => setCommentsOpen((o) => !o)}
          className="font-medium hover:text-primary hover:underline transition-colors"
        >
          {report.commentCount || 0} Comments
        </button>
      </div>

      {/* Action buttons */}
      <div className="px-2 py-1.5 flex items-center border-t border-outline-variant/20">
        <button
          onClick={handleUpvote}
          disabled={!user || upvoting}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg transition-all font-medium text-sm active:scale-95 disabled:opacity-60 ${
            upvoted
              ? 'text-secondary bg-secondary/10'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-secondary'
          }`}
        >
          <ThumbsUp className={`w-5 h-5 transition-transform ${upvoted ? 'fill-current scale-110' : ''}`} />
          <span>{upvoted ? 'Supported' : 'Support'}</span>
        </button>
        <button
          onClick={() => setCommentsOpen((o) => !o)}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg transition-all font-medium text-sm active:scale-95 ${
            commentsOpen
              ? 'text-primary bg-primary/10'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Comment</span>
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex justify-center items-center gap-2 py-2.5 text-on-surface-variant hover:bg-surface-container-low hover:text-primary rounded-lg transition-all font-medium text-sm active:scale-95"
        >
          {copied ? <Check className="w-5 h-5 text-secondary" /> : <Share2 className="w-5 h-5" />}
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
        <Link
          to={`/issue/${report._id}`}
          className="flex-1 flex justify-center items-center gap-1.5 py-2.5 text-on-surface-variant hover:bg-surface-container-low hover:text-primary rounded-lg transition-all font-medium text-sm active:scale-95"
        >
          <span>Details</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Expandable comments */}
      {commentsOpen && (
        <CommentSection
          reportId={report._id}
          onCountChange={(count) => onUpdate(report._id, { commentCount: count })}
        />
      )}
    </article>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const CommunityFeed = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'Pending' | 'In Progress' | 'Resolved'

  // Fetch reports from the API. The status filter runs server-side now,
  // so 'Resolved' shows real resolved issues instead of nothing.
  const fetchReports = async (pageNum = 1, statusFilter = 'all') => {
    setLoading(true);
    setError('');
    try {
      const status = statusFilter !== 'all' ? statusFilter : null;
      const data = await api.getActiveReports(null, 10, pageNum, status);
      setReports(data.reports);
      setTotalPages(data.pages || 1);
      setPage(data.page || 1);
    } catch (err) {
      console.error('Failed to load community feed:', err);
      setError('Could not load the feed. Check your connection and try again.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1, activeFilter);
  }, [activeFilter]);

  // Merge a partial update into one report in the list (upvotes, counts, ...).
  const handleUpdate = (reportId, patch) =>
    setReports((prev) => prev.map((r) => (r._id === reportId ? { ...r, ...patch } : r)));

  // Filter buttons
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'Pending', label: 'Open' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Resolved', label: 'Resolved' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Community Feed</h1>
          <p className="text-sm text-on-surface-variant mt-1">Stay updated with reports and activity in your area.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                activeFilter === f.key
                  ? 'text-primary bg-primary/10 border-primary/30'
                  : 'text-on-surface-variant hover:bg-surface-container-high border-outline-variant/30'
              }`}
            >
              {f.key === 'all' && <Filter className="w-4 h-4" />}
              {f.key === 'Resolved' && <CheckCircle className="w-4 h-4" />}
              {f.key === 'In Progress' && <TrendingUp className="w-4 h-4" />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center gap-3 bg-error-container/30 border border-error/30 text-error rounded-lg px-4 py-3 text-sm font-medium animate-fade-in-up">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button
            onClick={() => fetchReports(page, activeFilter)}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-outline" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">
            {activeFilter === 'Resolved' ? 'No resolved issues yet' : 'No reports yet'}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-xs">
            {activeFilter === 'Resolved'
              ? 'Resolved issues will appear here to celebrate community wins.'
              : 'Be the first to report an issue in your community.'}
          </p>
          {activeFilter !== 'Resolved' && (
            <Link
              to="/report"
              className="mt-4 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
            >
              Report an Issue
            </Link>
          )}
        </div>
      )}

      {/* Report Cards */}
      {!loading &&
        reports.map((report, idx) => (
          <FeedCard key={report._id} report={report} index={idx} onUpdate={handleUpdate} />
        ))}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 py-4">
          <button
            onClick={() => fetchReports(page - 1, activeFilter)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-on-surface-variant font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchReports(page + 1, activeFilter)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
