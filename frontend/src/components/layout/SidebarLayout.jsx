import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Search, Bell, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const SidebarLayout = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { unreadCount } = useNotifications();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background w-full font-body-md text-on-surface">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-80 flex flex-col min-h-screen">
        {/* Top App Bar */}
        <header className="bg-surface-container-lowest/80 backdrop-blur-xl fixed top-0 w-full lg:w-[calc(100%-20rem)] z-50 border-b border-outline-variant/20 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex justify-between items-center px-4 md:px-10 h-16 transition-all">
          <div className="flex items-center gap-4 lg:hidden">
            <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-all active:scale-90">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-headline-sm text-lg text-primary font-bold tracking-tight">NagarBondhu</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-2 w-96 relative group">
            <Search className="w-5 h-5 absolute left-3.5 text-outline-variant top-1/2 transform -translate-y-1/2 transition-colors group-focus-within:text-primary" />
            <input 
              className="w-full bg-surface-container-low/60 border border-transparent rounded-full py-2.5 pl-11 pr-4 text-sm text-on-surface focus:bg-surface-container-lowest focus:border-primary/30 focus:ring-2 focus:ring-primary/10 focus:shadow-sm outline-none transition-all placeholder:text-outline" 
              placeholder="Search reports, IDs, locations..." 
              type="text" 
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/notifications"
              className="relative text-on-surface-variant hover:bg-surface-container-low hover:text-primary p-2.5 rounded-full transition-all active:scale-90"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error text-[10px] font-bold text-white flex items-center justify-center rounded-full ring-2 ring-surface-container-lowest animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button className="relative text-on-surface-variant hover:bg-surface-container-low p-2.5 rounded-full transition-all lg:hidden active:scale-90">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/dashboard">
              <img 
                alt="User Profile" 
                className="w-9 h-9 rounded-full object-cover ml-1 border-2 border-outline-variant/30 shadow-sm lg:hidden hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer" 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Citizen')}&background=0D8ABC&color=fff`} 
              />
            </Link>
            <button 
              onClick={logout}
              className="relative text-error hover:bg-error-container/30 p-2.5 rounded-full transition-all lg:hidden active:scale-90"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 mt-16 p-4 md:p-10 bg-background overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
