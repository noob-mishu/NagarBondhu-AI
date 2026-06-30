import React from "react";
import {
  AlertTriangle,
  Bell,
  Building,
  LayoutDashboard,
  Map,
  MessagesSquare,
  Phone,
  Rss,
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";
const sidebar = () => {
  const mainNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Issue Map", path: "/map", icon: Map },
    { name: "Report an Issue", path: "/report", icon: AlertTriangle },
    { name: "Community Feed", path: "/feed", icon: Rss },
    { name: "Discussions", path: "/discussions", icon: MessagesSquare },
    { name: "Notification", path: "/notification", icon: Bell },
    { name: "Emergency", path: "/emergency", icon: Phone, emergency: true },
  ];
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
    </aside>
  );
};

export default sidebar;
