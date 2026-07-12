import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BadgeCheck,
  BrainCircuit,
  Camera,
  CheckCircle,
  CheckSquare,
  Clock,
  Edit2,
  MessageSquare,
  Mail,
  MapPin,
  PartyPopper,
  Phone,
  Save,
  Search,
  Sparkles,
  ThumbsUp,
  User,
  X,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const SuccessBanner = ({ show }) => {
  return (
    <div
      className={`transition-all duration-300 overflow-hidden ${
        show ? "max-h-16 mb-6 opacity-100" : "max-h-0 mb-0 opacity-0"
      }`}
    >
      <div className="bg-primary-fixed/30 border border-primary/20 text-primary px-4 py-3 rounded-xl flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-primary" />
        <span className="font-medium text-sm">
          Profile updated successfully!
        </span>
      </div>
    </div>
  );
};

const UserProfileHeader = ({
  userData,
  isEditing,
  setIsEditing,
  onSave,
  onChange,
  inputEditingStyle,
}) => {
  return (
    <section className="glass-card rounded-2xl p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 group">
          <img
            alt="Profile"
            className="w-full h-full rounded-2xl object-cover border-4 border-surface shadow-lg"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              userData.name,
            )}&background=0D8ABC&color=fff&size=256`}
          />

          <div
            className="absolute -bottom-1 -right-1 bg-gradient-to-br from-primary to-primary-container text-white p-1.5 rounded-lg border-2 border-surface shadow-sm"
            title="Verified Citizen"
          >
            <BadgeCheck className="w-4 h-4" />
          </div>

          {isEditing && (
            <button
              type="button"
              className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Change</span>
            </button>
          )}
        </div>

        <div className="flex flex-col text-center md:text-left flex-grow">
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            {userData.name}
          </h1>
          <p className="text-base text-on-surface-variant mb-2">
            {userData.location}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-primary/20">
              Top 5% Contributor
            </span>
            <span className="bg-primary-fixed-dim/20 text-on-primary-fixed-variant font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-primary-fixed-dim/30">
              Verified Citizen
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-on-surface-variant font-medium text-sm hover:bg-surface-container-low hover:text-primary transition-colors active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>

              <Link
                to="/report"
                className="flex items-center px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#003da8] transition-colors shadow-md shadow-primary/20 active:scale-95"
              >
                Report Issue
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-on-surface-variant font-medium text-sm hover:bg-surface-container-low transition-colors active:scale-95"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={onSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#003da8] transition-colors shadow-md shadow-primary/20 active:scale-95"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 pt-6 border-t border-outline-variant/20 relative z-10">
          <form
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={onChange}
                  className={inputEditingStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={onChange}
                  className={inputEditingStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1">
                Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={onChange}
                  className={inputEditingStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1">
                Location / Ward
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={userData.location}
                  onChange={onChange}
                  className={inputEditingStyle}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1">
                About Me
              </label>
              <textarea
                name="bio"
                value={userData.bio}
                onChange={onChange}
                rows="2"
                className="block w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200 resize-none bg-white border border-outline-variant/40 focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface"
              />
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

const DailyInsightCard = () => {
  return (
    <section className="col-span-1 md:col-span-8 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 transition-colors hover:border-primary">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl text-primary font-bold">Daily AI Insight</h3>
        <Sparkles className="w-4 h-4 text-primary/50 ml-1" />
      </div>

      <p className="text-on-surface mb-4 leading-relaxed">
        There's an increase in reported waste management issues in your ward
        today. Your contribution to verifying these could speed up the
        resolution time by{" "}
        <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
          35%
        </span>
        .
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 border border-primary/30 text-primary font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all text-center active:scale-95">
          View Hotspots
        </button>
        <button className="flex-1 bg-gradient-to-r from-primary-container to-primary text-white font-medium text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-all text-center shadow-md shadow-primary/20 active:scale-95">
          Verify 3 Reports (+15 XP)
        </button>
      </div>
    </section>
  );
};

const ReputationCard = () => {
  const currentXP = 1250;
  const maxXP = 2000;
  const xpRemaining = maxXP - currentXP;
  const progressPercent = (currentXP / maxXP) * 100;

  return (
    <section className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col">
      <h3 className="font-bold text-xs text-outline mb-3 uppercase tracking-wider flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5" /> CURRENT RANK: MASTER ADVOCATE
      </h3>

      <div className="flex justify-between items-end mb-2">
        <span className="font-bold text-4xl text-gradient leading-none">
          {currentXP.toLocaleString()}
        </span>
        <span className="text-sm text-outline font-medium">
          / {maxXP.toLocaleString()} XP
        </span>
      </div>

      <div className="w-full bg-surface-container-highest rounded-full h-3 mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-primary-container h-3 rounded-full transition-all duration-1000 relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse-soft rounded-full" />
        </div>
      </div>

      <p className="text-sm text-on-surface-variant">
        {xpRemaining} XP until{" "}
        <span className="font-semibold text-on-surface">Civic Guardian</span>
      </p>

      <div className="mt-auto pt-3">
        <a
          className="text-primary font-medium text-sm flex items-center gap-1 hover:underline hover:gap-2 transition-all"
          href="#"
        >
          View Leaderboard <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};

const ImpactCounters = ({ impactStats }) => {
  const stats = [
    {
      icon: AlertTriangle,
      value: impactStats?.totalReports ?? "0",
      label: "Reports",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: CheckSquare,
      value: impactStats?.totalResolved ?? "0",
      label: "Resolved",
      color: "text-primary-container",
      bg: "bg-primary-container/10",
    },
    {
      icon: ThumbsUp,
      value: impactStats?.totalUpvotes ?? "0",
      label: "Upvotes",
      color: "text-surface-tint",
      bg: "bg-surface-tint/10",
    },
    {
      icon: MessageSquare,
      value: impactStats?.totalDiscussions ?? "0",
      label: "Discussions",
      color: "text-primary-fixed-dim",
      bg: "bg-primary-fixed-dim/10",
    },
  ];

  return (
    <section className="col-span-1 md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;

        return (
          <div
            key={stat.label}
            className="glass-card rounded-2xl p-5 text-center hover-lift group *:transition-all duration-200"
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            <div className="font-bold text-2xl text-on-surface">
              {stat.value}
            </div>

            <div className="text-xs font-semibold text-outline uppercase tracking-wider mt-1">
              {stat.label}
            </div>
          </div>
        );
      })}
    </section>
  );
};

const CommunityPulse = ({ activities: rawActivities }) => {
  const activities = (rawActivities || []).map((a) => ({
    id: a._id,
    type: a.type,
    userName: a.actorName,
    message: a.message,
    timeAgo: a.timeAgo,
    avatarUrl: a.actorAvatarUrl,
  }));

  return (
    <section className="col-span-1 md:col-span-5 glass-card rounded-2xl p-6">
      <h3 className="font-bold text-xl text-on-surface mb-5">Community Pulse</h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3 group cursor-pointer">
            
            {activity.avatarUrl ? (
        
              <div className="w-9 h-9 rounded-full bg-surface-container flex-shrink-0 overflow-hidden ring-2 ring-outline-variant/20 ring-offset-1 ring-offset-surface">
                <img
                  alt={activity.userName}
                  className="w-full h-full object-cover"
                  src={activity.avatarUrl}
                />
              </div>
            ) : (
              
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-fixed-dim to-primary-fixed flex items-center justify-center flex-shrink-0 text-on-primary-fixed shadow-sm">
                <PartyPopper className="w-4 h-4" />
              </div>
            )}

            {/* Activity text and timestamp */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-on-surface">
                <span className="font-semibold group-hover:text-primary transition-colors">
                  {activity.userName}
                </span>{' '}
                {activity.message}
              </p>
              <p className="text-xs font-semibold text-outline uppercase tracking-wider mt-1">
                {activity.timeAgo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const formatReportAge = (createdAt) => {
  const createdDate = new Date(createdAt);
  const diffMs = Date.now() - createdDate.getTime();

  if (Number.isNaN(diffMs)) {
    return "Recently";
  }

  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  }

  if (hours > 0) {
    return `${hours}h ago`;
  }

  return `${minutes}m ago`;
};

const ActiveReportsList = ({ reports }) => {
  return (
    <section className="col-span-1 md:col-span-7 glass-card rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="font-bold text-xl text-on-surface">Active Reports</h3>
        <Link
          to="/feed"
          className="text-primary font-medium text-sm flex items-center gap-1 hover:underline hover:gap-2 transition-all"
        >
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <Link
            key={report._id}
            to={`/issue/${report._id}`}
            className="block rounded-xl border border-outline-variant/30 bg-surface/70 p-4 transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.99]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h4 className="font-semibold text-on-surface line-clamp-2">
                  {report.title}
                </h4>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-outline">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatReportAge(report.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {report.upvoteCount} upvotes
                  </span>
                </div>
              </div>

              <span className="w-fit rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {report.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const DashboardSearch = ({ value, onChange }) => {
  return (
    <div className="relative w-full sm:max-w-md">
      <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-outline-variant" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-outline-variant/40 bg-white py-2.5 pl-11 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-4 focus:ring-primary/10"
        placeholder="Search reports, activity, status..."
      />
    </div>
  );
};


const UserDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState({
    name: "NagarBondhu User",
    email: "citizen@nagarbondhu.ai",
    phone: "+880 1700-000000",
    location: "Ward 12, Dhaka",
    bio: "Helping improve the city by reporting issues and following civic updates.",
  });
  const impactStats = {
    totalReports: 24,
    totalResolved: 18,
    totalUpvotes: 156,
    totalDiscussions: 9,
  };
  const activeReports = [
    {
      _id: "road-101",
      title: "Broken streetlight near Dhanmondi 27",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: "Under Review",
      upvoteCount: 18,
    },
    {
      _id: "waste-204",
      title: "Overflowing waste bin beside local market",
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      status: "In Progress",
      upvoteCount: 31,
    },
    {
      _id: "drain-315",
      title: "Blocked drain causing waterlogging",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Pending",
      upvoteCount: 12,
    },
  ];
  const communityActivities = [
    {
      _id: "activity-1",
      actorName: "Ayesha Rahman",
      message: "verified a drainage issue near Kalabagan.",
      timeAgo: "12 MIN AGO",
    },
    {
      _id: "activity-2",
      actorName: "Tanvir Ahmed",
      message: "added an update to the waste collection report.",
      timeAgo: "34 MIN AGO",
    },
    {
      _id: "activity-3",
      actorName: "NagarBondhu AI",
      message: "detected a rising cluster of streetlight reports.",
      timeAgo: "1 HR AGO",
    },
  ];

  const inputEditingStyle =
    "block w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200 bg-white border border-outline-variant/40 focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface";
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredReports = normalizedSearchQuery
    ? activeReports.filter((report) =>
        [report.title, report.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearchQuery),
      )
    : activeReports;
  const filteredActivities = normalizedSearchQuery
    ? communityActivities.filter((activity) =>
        [activity.actorName, activity.message, activity.timeAgo]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearchQuery),
      )
    : communityActivities;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-1 tracking-tight">
              User Dashboard Overview
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Real-time civic intelligence and activity tracking.
            </p>
          </div>
          <DashboardSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        <SuccessBanner show={showSuccess} />

        <UserProfileHeader
          userData={userData}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onSave={handleSave}
          onChange={handleChange}
          inputEditingStyle={inputEditingStyle}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <DailyInsightCard />
          <ReputationCard />
          <ImpactCounters impactStats={impactStats} />
          <ActiveReportsList reports={filteredReports} />
          <CommunityPulse activities={filteredActivities} />
        </div>
      </div>
    </main>
  );
};

export default UserDashboard;
