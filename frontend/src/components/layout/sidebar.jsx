import React from "react";
import { AlertTriangle, Bell, LayoutDashboard, Map, MessagesSquare, Phone, Rss } from "lucide-react";

const sidebar = () => {
  const mainNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Issue Map", path: "/map", icon: Map },
    { name: "Report an Issue", path: "/report", icon: AlertTriangle },
    { name: "Community Feed", path: "/feed", icon: Rss},
    { name: "Discussions", path: "/discussions", icon: MessagesSquare },
    { name: "Notification", path: "/notification", icon:  Bell},
    { name: "Emergency", path: "/emergency", icon: Phone, emergency:true }
  ];
  return (
    <aside>

        
    </aside>
  );
};

export default sidebar;
