import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Camera,
  CheckCircle,
  ClipboardList,
  Compass,
  Map,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const FEATURES_DATA = [
  {
    icon: Camera,
    title: "Photo-Based Reporting",
    desc: "Capture issues with photos and details so teams can understand the problem quickly.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: Bot,
    title: "AI Issue Detection",
    desc: "Classify civic problems faster with smart suggestions for category and priority.",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: Map,
    title: "Live Location Mapping",
    desc: "Pin reports on the city map and help authorities find exact problem spots.",
    color: "bg-violet-50 text-violet-700",
  },
  {
    icon: MessageCircle,
    title: "Community Updates",
    desc: "Discuss reports, share context, and keep neighbors informed as issues move forward.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: ShieldCheck,
    title: "Verified Progress",
    desc: "Track every step from submission to resolution with clear status updates.",
    color: "bg-rose-50 text-rose-700",
  },
  {
    icon: BarChart3,
    title: "Impact Insights",
    desc: "See issue trends and resolution patterns across communities and districts.",
    color: "bg-cyan-50 text-cyan-700",
  },
];

const FeatureCard = ({ icon: Icon, title, desc, color }) => {
  return (
    <article className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-lg shadow-blue-950/5 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/10">
      <div
        className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${color}`}
      >
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-black tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">{desc}</p>
    </article>
  );
};

const StatItem = ({ icon: Icon, endValue, suffix, label, accent }) => {
  return (
    <div className="group rounded-2xl border border-white bg-white p-6 text-center shadow-lg shadow-blue-950/10 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/15">
      <div
        className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${accent}`}
      >
        <Icon size={24} />
      </div>
      <div className="text-3xl font-black tracking-tight text-slate-950 transition-colors duration-300 group-hover:text-blue-700 md:text-4xl">
        {endValue.toLocaleString()}
        {suffix}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 w-full z-50 bg-white/50 backdrop-blur-lg shadow-sm py-3 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to={"/"} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md group-hover:shadow-lg transition-shadow bg-linear-to-br from-blue-600 to-blue-700">
              N
            </div>

            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-slate-900">Nagar</span>
              <span className="text-blue-600">Bondhu</span>
              <span className="text-slate-400 font-normal text-2xl ml-1">
                AI
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#impact"
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              Impact
            </a>
            <a
              href="#reviews"
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              Reviews
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to={"/login"}
              className="px-5 py-2.5 text-slate-700 text-sm font-semibold rounded-xl
              border border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              Sign in
            </Link>

            <Link
              to="/report"
              className="px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-linear-to-br from-blue-600 to-blue-700"
            >
              Report Issue
            </Link>
          </div>
        </div>
      </header>

      <section>
        <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-24 md:pt-48 md:pb-36">
          <div className="grid md:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-xs uppercase tracking-wider rounded-full mb-8">
                <div className="w-2 h-2 rounded-full animate-pulse bg-blue-600" />
                AI-Powered Civic Platform
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-6">
                <span className="text-slate-900">Build a</span>
                <br />
                <span className="text-slate-900">Better City,</span>
                <br />
                <span className="bg-linear-to-br from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  Together.
                </span>
              </h1>

              <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
                Report civic issues, track resolution progress, and collaborate
                with authorities for a cleaner, safer Bangladesh.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  to={"/report"}
                  className="flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-sm bg-linear-to-br from-blue-600 to-blue-700"
                >
                  <AlertTriangle size={20} />
                  Report a Problem <ArrowRight size={20} />
                </Link>

                <Link
                  to={"/report"}
                  className="flex items-center justify-center gap-2 px-7 py-4 bg-white text-slate-700 font-bold border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:-translate-y-0.5 transition-all duration-200 text-sm"
                >
                  <Compass size={20} />
                  Explore Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section
        id="impact"
        className="py-20 md:py-24"
        style={{
          background:
            "linear-gradient(135deg, #eff6ff 0%, #dbeafe 52%, #ecfdf5 100%)",
        }}
      >
          <div className="max-w-7xl mx-auto px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                Our Impact
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Making a Real Difference
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Real numbers from real communities across Bangladesh.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatItem
                icon={ClipboardList}
                endValue={12500}
                suffix="+"
                label="Issues Reported"
                accent="bg-blue-50 text-blue-700"
              />
              <StatItem
                icon={CheckCircle}
                endValue={8200}
                suffix="+"
                label="Problems Solved"
                accent="bg-emerald-50 text-emerald-700"
              />
              <StatItem
                icon={Users}
                endValue={24000}
                suffix="+"
                label="Active Citizens"
                accent="bg-violet-50 text-violet-700"
              />
              <StatItem
                icon={MapPin}
                endValue={64}
                suffix=""
                label="Districts Covered"
                accent="bg-amber-50 text-amber-700"
              />
            </div>
          </div>
      </section>


      <section id="features" className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-xs uppercase tracking-wider rounded-full mb-5">
                <Sparkles className="w-3.5 h-3.5" /> Features
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-5 tracking-tight">
                Everything You Need to <span className="bg-linear-to-br from-blue-600 to-blue-500 bg-clip-text text-transparent">Fix Your City</span>
              </h2>
            </div>

            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES_DATA.map((feature, idx) => (
                <FeatureCard key={idx} icon={feature.icon} title={feature.title} desc={feature.desc} color={feature.color} />
              ))}
            </div>
          </div>
      </section>
    </div>
  );
};

export default LandingPage;
