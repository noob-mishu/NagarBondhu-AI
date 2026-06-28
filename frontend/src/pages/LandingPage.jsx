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
    </div>
  );
};

export default LandingPage;
