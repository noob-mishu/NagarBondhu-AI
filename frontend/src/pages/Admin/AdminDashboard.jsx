import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Megaphone, AlertTriangle, BrainCircuit, CheckCircle, Timer,
  Users, MessagesSquare, Loader2, Inbox, X, ChevronLeft, ChevronRight,
  Plus, Pin, Pencil, Lock
} from 'lucide-react';

const REPORT_STATUSES = ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];

// Colors for the category distribution bars
const CATEGORY_COLORS = ['bg-primary', 'bg-secondary', 'bg-tertiary-container', 'bg-error', 'bg-on-surface-variant', 'bg-outline', 'bg-primary/50'];

// Helper: badge styles for each report status
const statusBadge = (status) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500/10 text-yellow-700';
    case 'Under Review': return 'bg-purple-500/10 text-purple-700';
    case 'In Progress': return 'bg-blue-500/10 text-blue-700';
    case 'Resolved': return 'bg-secondary/10 text-secondary';
    case 'Rejected': return 'bg-error/10 text-error';
    default: return 'bg-surface-container-highest/50 text-on-surface-variant';
  }
};

// Helper: badge styles for AI severity
const severityBadge = (severity) => {
  switch (severity) {
    case 'High': return 'bg-error/10 text-error';
    case 'Medium': return 'bg-yellow-500/10 text-yellow-700';
    case 'Low': return 'bg-surface-container-highest/50 text-on-surface-variant';
    default: return 'bg-surface-container-highest/50 text-on-surface-variant';
  }
};

// Helper: initials for the submitter avatar circle
const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ─── Stats ───────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);

  // ─── Reports table ───────────────────────────────────────────────────────
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  // ─── Discussions panel ───────────────────────────────────────────────────
  const [discussions, setDiscussions] = useState([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);

  const [error, setError] = useState('');

  // ─── Data loading ────────────────────────────────────────────────────────

  const loadStats = useCallback(async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err.message);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const data = await api.getAdminReports({ status: statusFilter, page, limit: 8 });
      setReports(data.reports);
      setPages(data.pages || 1);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setReportsLoading(false);
    }
  }, [statusFilter, page]);

  const loadDiscussions = useCallback(async () => {
    setDiscussionsLoading(true);
    try {
      const data = await api.getDiscussions({ sort: 'latest', limit: 8 });
      setDiscussions(data.discussions);
    } catch (err) {
      console.error('Failed to load discussions:', err.message);
    } finally {
      setDiscussionsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadReports(); }, [loadReports]);
  useEffect(() => { loadDiscussions(); }, [loadDiscussions]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  // Change a report's status inline from the table.
  const handleStatusChange = async (reportId, newStatus) => {
    setUpdatingId(reportId);
    try {
      const updated = await api.updateReportStatus(reportId, newStatus);
      setReports((prev) => prev.map((r) => (r._id === reportId ? { ...r, status: updated.status } : r)));
      loadStats(); // Keep the stat cards in sync
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle a discussion between Open and Closed.
  const handleToggleDiscussion = async (discussion) => {
    try {
      const updated = await api.setDiscussionStatus(
        discussion._id,
        discussion.status === 'Open' ? 'Closed' : 'Open'
      );
      setDiscussions((prev) => prev.map((d) => (d._id === discussion._id ? { ...d, status: updated.status } : d)));
    } catch (err) {
      setError(err.message);
    }
  };

  // Pin / unpin a discussion.
  const handleTogglePin = async (discussion) => {
    try {
      const updated = await api.togglePinDiscussion(discussion._id);
      setDiscussions((prev) => prev.map((d) => (d._id === discussion._id ? { ...d, isPinned: updated.isPinned } : d)));
    } catch (err) {
      setError(err.message);
    }
  };

  // ─── Derived values ──────────────────────────────────────────────────────

  const resolutionRate = stats && stats.totalReports > 0
    ? ((stats.resolvedReports / stats.totalReports) * 100).toFixed(1)
    : '0.0';

  const categoryTotal = stats?.categoryCounts?.reduce((sum, c) => sum + c.count, 0) || 0;

  return (
    <>
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-1 tracking-tight">Admin Dashboard Overview</h1>
          <p className="font-body-md text-sm text-on-surface-variant">Manage citizen reports and assign discussions to community groups.</p>
        </div>
        <Link
          to="/admin/discussions/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-label-md text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Discussion
        </Link>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-3 bg-error/5 border border-error/20 text-error px-4 py-3 rounded-xl font-body-sm text-sm">
          <span>{error}</span>
          <button onClick={() => setError('')} className="p-1 hover:bg-error/10 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-label-md text-sm font-medium text-on-surface-variant mb-1 tracking-tight">Total Reports</p>
              <h2 className="font-headline-md text-3xl text-on-surface font-bold tracking-tight">{stats ? stats.totalReports : '—'}</h2>
            </div>
            <div className="bg-primary/5 p-2 rounded-xl text-primary border border-primary/10">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Users className="w-4 h-4" />
            <span className="font-label-md text-xs font-semibold">{stats ? stats.totalUsers : '—'} registered citizens</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-label-md text-sm font-medium text-on-surface-variant mb-1 tracking-tight">Pending Reports</p>
              <h2 className="font-headline-md text-3xl text-on-surface font-bold tracking-tight">{stats ? stats.pendingReports : '—'}</h2>
            </div>
            <div className="bg-error/5 p-2 rounded-xl text-error border border-error/10">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Timer className="w-4 h-4" />
            <span className="font-label-md text-xs font-semibold">Awaiting review</span>
          </div>
        </div>

        {/* Resolution Rate (AI Focus) */}
        <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-primary/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-80"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-label-md text-sm font-medium text-on-surface-variant mb-1 tracking-tight">Resolution Rate</p>
                <h2 className="font-headline-md text-3xl text-primary font-bold tracking-tight">{resolutionRate}%</h2>
              </div>
              <div className="bg-primary p-2 rounded-xl text-white shadow-sm">
                <BrainCircuit className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-primary">
              <CheckCircle className="w-4 h-4" />
              <span className="font-label-md text-xs font-semibold">{stats ? stats.resolvedReports : '—'} resolved</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-label-md text-sm font-medium text-on-surface-variant mb-1 tracking-tight">In Progress</p>
              <h2 className="font-headline-md text-3xl text-on-surface font-bold tracking-tight">{stats ? stats.inProgressReports : '—'}</h2>
            </div>
            <div className="bg-secondary/5 p-2 rounded-xl text-secondary border border-secondary/10">
              <MessagesSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <CheckCircle className="w-4 h-4" />
            <span className="font-label-md text-xs font-medium">{stats ? stats.rejectedReports : '—'} rejected overall</span>
          </div>
        </div>
      </section>

      {/* Management Section: Reports Table & Discussions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Management Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-outline-variant/20 flex flex-wrap justify-between items-center gap-3">
            <h3 className="font-headline-sm text-lg font-bold tracking-tight text-on-surface">Manage Reports</h3>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-1.5 font-label-md text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              {REPORT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {reportsLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-on-surface-variant">
              <Inbox className="w-12 h-12 mb-3 text-outline" />
              <p className="font-body-sm text-sm">No reports found for this filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/30 border-b border-outline-variant/20 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">Report</th>
                    <th className="py-4 px-6 font-semibold">Submitter</th>
                    <th className="py-4 px-6 font-semibold">Severity</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold">Discussion</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-sm text-on-surface divide-y divide-outline-variant/10">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="py-4 px-6">
                        <Link to={`/issue/${report._id}`} className="font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {report.title}
                        </Link>
                        <span className="block text-xs text-on-surface-variant mt-0.5">{report.category} • {report.location}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px] shrink-0">
                            {initials(report.reporter?.name)}
                          </div>
                          <span className="font-medium text-on-surface whitespace-nowrap">{report.reporter?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${severityBadge(report.aiAnalysis?.severity)}`}>
                          {report.aiAnalysis?.severity || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <select
                            value={report.status}
                            disabled={updatingId === report._id}
                            onChange={(e) => handleStatusChange(report._id, e.target.value)}
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 ${statusBadge(report.status)}`}
                          >
                            {REPORT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {updatingId === report._id && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => navigate(`/admin/discussions/new?reportId=${report._id}`)}
                          className="flex items-center gap-1.5 text-primary font-label-md text-xs font-semibold border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors whitespace-nowrap"
                        >
                          <MessagesSquare className="w-3.5 h-3.5" /> Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-outline-variant/20 flex items-center justify-between mt-auto">
            <span className="font-label-md text-xs text-on-surface-variant">Page {page} of {pages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="p-2 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Discussions + Category Distribution */}
        <div className="flex flex-col gap-6">
          {/* Assigned Discussions Panel */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                <MessagesSquare className="w-5 h-5" />
              </div>
              <h3 className="font-headline-sm text-lg font-bold tracking-tight text-on-surface">Group Discussions</h3>
            </div>

            {discussionsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : discussions.length === 0 ? (
              <p className="font-body-sm text-sm text-on-surface-variant py-6 text-center">
                No discussions yet. Use the “+ New Discussion” button or “Assign” on a report to start one.
              </p>
            ) : (
              <div className="space-y-3">
                {discussions.map((d) => (
                  <div key={d._id} className={`p-4 rounded-xl border border-outline-variant/20 shadow-sm transition-all ${d.status === 'Closed' ? 'opacity-60 bg-surface-container-low/40' : 'bg-surface-container-lowest hover:shadow-md'}`}>
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="font-label-caps text-primary text-[10px] font-bold tracking-wider uppercase">{d.category}</span>
                      <button
                        onClick={() => handleToggleDiscussion(d)}
                        title={d.status === 'Open' ? 'Click to close this discussion' : 'Click to reopen this discussion'}
                        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md transition-colors ${d.status === 'Open' ? 'bg-secondary/10 text-secondary hover:bg-secondary/20' : 'bg-surface-container-highest/50 text-on-surface-variant hover:bg-surface-container-highest'}`}
                      >
                        {d.status === 'Closed' && <Lock className="w-3 h-3" />}
                        {d.status}
                      </button>
                    </div>
                    <Link to={`/discussions/${d._id}`} className="font-label-md text-on-surface font-semibold mb-1 tracking-tight line-clamp-1 hover:text-primary transition-colors block">
                      {d.title}
                    </Link>
                    <p className="font-body-sm text-[12px] text-on-surface-variant mb-2">
                      {d.commentCount} comments • {d.reactionCount} reactions
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePin(d)}
                        className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${d.isPinned ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' : 'text-on-surface-variant border-outline-variant/40 hover:border-primary/40 hover:text-primary'}`}
                      >
                        <Pin className="w-3 h-3" /> {d.isPinned ? 'Pinned' : 'Pin'}
                      </button>
                      <Link
                        to={`/admin/discussions/${d._id}/edit`}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm">
            <h3 className="font-headline-sm text-lg font-bold tracking-tight text-on-surface mb-5">Category Distribution</h3>
            {!stats || categoryTotal === 0 ? (
              <p className="font-body-sm text-sm text-on-surface-variant text-center py-4">No report data yet.</p>
            ) : (
              <div className="space-y-4">
                {stats.categoryCounts.map((c, i) => {
                  const percent = Math.round((c.count / categoryTotal) * 100);
                  return (
                    <div key={c._id}>
                      <div className="flex items-center justify-between font-label-md text-sm mb-1.5">
                        <span className="text-on-surface font-medium">{c._id}</span>
                        <span className="font-bold text-on-surface">{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default AdminDashboard;
