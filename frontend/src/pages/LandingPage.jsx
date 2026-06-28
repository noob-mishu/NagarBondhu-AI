import React from "react";
import { Link } from "react-router-dom";

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
        <div>
          <div>
            <div >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-xs uppercase tracking-wider rounded-full mb-8">
                <div className="w-2 h-2 rounded-full animate-pulse bg-blue-600" />
                AI-Powered Civic Platform
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-6">
                  <span className="text-slate-900">Build a</span><br />
                  <span className="text-slate-900">Better City,</span><br />
                  <span style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Together.
                  </span>
                </h1>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
