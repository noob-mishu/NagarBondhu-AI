import React from "react";
import {
  Building,
} from "lucide-react";
import { Link } from "react-router-dom";
const sidebar = () => {
  return (
    <aside>
      <Link to="/" className="flex items-center gap-3 px-6 mb-6 group">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
          <Building className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-primary group-hover:text-primary-container transition-colors">
            NagarBondhu AI
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-outline font-semibold">
            Smart Civic Platform
          </p>
        </div>
      </Link>

      <div className="w-full h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent mx-auto mb-4"></div>

      
      <Link to="/dashboard" className="flex items-center gap-3 px-6 mb-6 group cursor-pointer hover:bg-surface-container-low/50 py-2 mx-2 rounded-xl transition-colors">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-surface-container overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-surface group-hover:ring-primary/40 transition-all">
            <img alt="User Profile Avatar" className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=Citizen+Advocate&background=0D8ABC&color=fff" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-secondary border-2 border-surface flex items-center justify-center">
            <span className="text-white text-[8px]">✓</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-base text-on-surface group-hover:text-primary transition-colors">Citizen Advocate</h3>
          <p className="text-xs text-on-surface-variant">1,250 XP • <span className="text-secondary font-semibold">Verified</span></p>
        </div>
      </Link>


    </aside>
  );
};

export default sidebar;
