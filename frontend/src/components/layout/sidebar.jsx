import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Map, AlertTriangle, Rss, MessageSquare, Bell, LogOut, Shield, Building, Phone, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

// The sidebar is adjustable in two ways:
//  - Desktop (lg+): a chevron on the edge collapses it to an icon-only rail (w-20).
//    The choice is remembered in localStorage by SidebarLayout.
//  - Mobile: it slides in as a drawer over a backdrop, opened from the top bar.
// 'collapsed' only affects lg+ screens (via lg: classes), so the mobile drawer
// always shows the full labels.
const Sidebar = ({ collapsed = false, onToggleCollapse, mobileOpen = false, onCloseMobile }) => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

  const mainNavItems = [
    // Admins get the Admin Dashboard instead of the citizen Dashboard / Report pages.
    ...(isAdmin
      ? [{ name: 'Admin Dashboard', path: '/admin', icon: Shield }]
      : [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        ]),
    { name: 'Issue Map', path: '/map', icon: Map },
    ...(isAdmin ? [] : [{ name: 'Report an Issue', path: '/report', icon: AlertTriangle }]),
    { name: 'Community Feed', path: '/feed', icon: Rss },
    { name: 'Discussions', path: '/discussions', icon: MessageSquare },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Emergency Contact', path: '/emergency', icon: Phone, emergency: true },
  ];

  // Hide an element only when the sidebar is collapsed on desktop.
  const hideWhenCollapsed = collapsed ? 'lg:hidden' : '';

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
          onClick={onCloseMobile}
        ></div>
      )}

      <aside
        className={`flex flex-col h-full py-6 bg-linear-to-b from-surface via-surface to-surface-container-low/50 shadow-xl fixed left-0 top-0 z-[60] border-r border-outline-variant/15 transition-all duration-300 w-80 ${
          collapsed ? 'lg:w-20' : 'lg:w-80'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Desktop collapse / expand toggle on the sidebar edge */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-surface border border-outline-variant/40 shadow-md items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden absolute right-3 top-3 p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <Link
          to="/"
          onClick={onCloseMobile}
          className={`flex items-center gap-3 mb-6 group px-6 ${collapsed ? 'lg:px-0 lg:justify-center' : ''}`}
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div className={hideWhenCollapsed}>
            <h1 className="text-lg font-bold tracking-tight text-primary group-hover:text-primary-container transition-colors">NagarBondhu AI</h1>
            <p className="text-[10px] uppercase tracking-widest text-outline font-semibold">Smart Civic Platform</p>
          </div>
        </Link>

        <div className="w-full h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent mx-auto mb-4"></div>

        {/* User Profile */}
        <Link
          to={isAdmin ? '/admin' : '/dashboard'}
          onClick={onCloseMobile}
          title={user?.name || 'Citizen'}
          className={`flex items-center gap-3 mb-6 group cursor-pointer hover:bg-surface-container-low/50 py-2 mx-2 rounded-xl transition-colors px-6 ${
            collapsed ? 'lg:px-0 lg:justify-center' : ''
          }`}
        >
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-surface-container overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-surface group-hover:ring-primary/40 transition-all">
              <img alt="User Profile Avatar" className="w-full h-full object-cover" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Citizen')}&background=0D8ABC&color=fff`} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-secondary border-2 border-surface flex items-center justify-center">
              <span className="text-white text-[8px]">✓</span>
            </div>
          </div>
          <div className={hideWhenCollapsed}>
            <h3 className="font-semibold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-1">{user?.name || 'Citizen'}</h3>
            <p className="text-xs text-on-surface-variant capitalize">{user?.role || 'Citizen'}</p>
          </div>
        </Link>

        <div className="w-full h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent mx-auto mb-2"></div>

        {/* Navigation + Logout — single scrollable column */}
        <nav className="flex flex-col gap-1 flex-grow px-3 mt-2 overflow-y-auto">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onCloseMobile}
              title={item.name}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                  collapsed ? 'lg:justify-center lg:px-2' : ''
                } ${
                  item.emergency
                    ? isActive
                      ? 'bg-red-100 text-red-700 font-bold shadow-sm border border-red-200'
                      : 'text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200'
                    : isActive
                      ? 'bg-primary/10 text-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !item.emergency && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
                  )}
                  {isActive && item.emergency && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r-full"></div>
                  )}
                  <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                  <span className={`text-sm ${hideWhenCollapsed}`}>{item.name}</span>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className={`ml-auto w-5 h-5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse-soft ${hideWhenCollapsed}`}>
                      {unreadCount}
                    </span>
                  )}
                  {/* Collapsed rail: unread notifications become a small dot on the bell */}
                  {item.name === 'Notifications' && unreadCount > 0 && collapsed && (
                    <span className="hidden lg:block absolute top-2 right-2.5 w-2 h-2 rounded-full bg-error animate-pulse-soft"></span>
                  )}
                  {item.emergency && (
                    <span className={`ml-auto text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider ${hideWhenCollapsed}`}>SOS</span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Divider */}
          <div className="w-full h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent my-2"></div>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            title="Logout"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-on-surface-variant hover:bg-error-container/30 hover:text-error group ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`text-sm ${hideWhenCollapsed}`}>Logout</span>
          </button>

          {/* Version */}
          <div className={`text-center mt-2 mb-1 ${hideWhenCollapsed}`}>
            <span className="text-[10px] text-outline tracking-wider">v2.0 • NagarBondhu AI</span>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
