import { Filter, Globe, MoreHorizontal, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const CommunityFeed = () => {
  const [sort, setSort] = useState("recent");

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 mt-6 sm:mt-8">
      <div className="flex flex-col gap-4 animate-fade-in-up">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
            Community Feed
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant">
            Stay updated with reports and activity in your area.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSort("recent")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-sm font-medium ${
              sort === "recent"
                ? "text-primary bg-primary/5 border-primary/20 shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high border-outline-variant/30"
            }`}
          >
            <Filter className="w-4 h-4" /> Recent
          </button>
          <button
            onClick={() => setSort("top")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-sm font-medium ${
              sort === "top"
                ? "text-primary bg-primary/5 border-primary/20 shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high border-outline-variant/30"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Trending
          </button>
        </div>
      </div>

      <article className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-1">
        <div className="p-4 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <img
              alt="Reporter Avatar"
              className="w-10 h-10 rounded-full object-cover bg-surface-variant ring-2 ring-outline-variant/20 ring-offset-2 ring-offset-surface-container-lowest"
              src="https://ui-avatars.com/api/?name=Tariq+Rahman&background=random"
            />
            <div>
              <div className="font-semibold text-sm text-on-surface">
                Tariq Rahman
              </div>
              <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span>2 hrs ago</span>
                <span>•</span>
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <button className="text-on-surface-variant hover:bg-surface-container-high p-1.5 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <Link
          to="/issue/123"
          className="px-4 pb-4 flex flex-col gap-2 hover:bg-surface-container-low/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span className="bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
              In Progress
            </span>
            <h2 className="font-semibold text-lg text-on-surface group-hover:text-primary transition-colors">
              Severe Pothole on Mirpur Road
            </h2>
          </div>
          <p className="text-base text-on-surface-variant leading-relaxed">
            The recent rains have completely washed away a section of the road
            near the metro station. It's causing major traffic jams and is a
            hazard for motorbikes. City corp needs to address this ASAP.
          </p>
        </Link>
      </article>
    </div>
  );
};

export default CommunityFeed;
