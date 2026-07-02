import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';

const Searchbar = () => {
  return (
    <div className="min-h-screen bg-surface lg:flex">
      <div className="sticky top-0 z-20 h-screen w-72 shrink-0 overflow-y-auto border-r border-outline-variant/30 bg-surface-container-lowest/95 py-6 shadow-sm backdrop-blur max-lg:hidden">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Searchbar;
