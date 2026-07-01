import React from "react";
import {
  AlertTriangle,
  Bell,
  Building,
  LayoutDashboard,
  LogOut,
  Map,
  MessagesSquare,
  Phone,
  Rss,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const mainNavItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Issue Map", path: "/map", icon: Map },
  { name: "Report an Issue", path: "/report", icon: AlertTriangle },
  { name: "Community Feed", path: "/feed", icon: Rss },
  { name: "Discussions", path: "/discussions", icon: MessagesSquare },
  { name: "Notifications", path: "/notification", icon: Bell },
  { name: "Emergency", path: "/emergency", icon: Phone, emergency: true },
];

const Sidebar = () => {
  return (
    <aside className="flex h-full flex-col">
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

      <div className="w-full h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent mx-auto mb-4" />

      <Link
        to="/dashboard"
        className="flex items-center gap-3 px-6 mb-6 group cursor-pointer hover:bg-surface-container-low/50 py-2 mx-2 rounded-xl transition-colors"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-surface-container overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-surface group-hover:ring-primary/40 transition-all">
            <img
              alt="User Profile Avatar"
              className="w-full h-full object-cover"
              src="https://ui-avatars.com/api/?name=Citizen+Advocate&background=0D8ABC&color=fff"
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-secondary border-2 border-surface flex items-center justify-center">
            <span className="text-white text-[8px]">OK</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-base text-on-surface group-hover:text-primary transition-colors">
            Citizen Advocate
          </h3>
          <p className="text-xs text-on-surface-variant">
            1,250 XP - <span className="text-secondary font-semibold">Verified</span>
          </p>
        </div>
      </Link>

      <div className="w-full h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent mx-auto mb-2" />

      <nav className="flex flex-col gap-1 flex-grow px-3 mt-2">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                item.emergency
                  ? isActive
                    ? "bg-red-100 text-red-700 font-bold shadow-sm border border-red-200"
                    : "text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200"
                  : isActive
                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !item.emergency && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                {isActive && item.emergency && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r-full" />
                )}
                <item.icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "" : "group-hover:scale-110"
                  }`}
                />
                <span className="text-sm">{item.name}</span>
                {item.name === "Notifications" && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse-soft">
                    3
                  </span>
                )}
                {item.emergency && (
                  <span className="ml-auto text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                    SOS
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 mt-auto">
        <div className="w-full h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent mb-3" />
        <NavLink
          to="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-on-surface-variant hover:bg-error-container/30 hover:text-error group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm">Logout</span>
        </NavLink>
        <div className="text-center mt-4 mb-2">
          <span className="text-[10px] text-outline tracking-wider">
            v2.0 - NagarBondhu AI
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
