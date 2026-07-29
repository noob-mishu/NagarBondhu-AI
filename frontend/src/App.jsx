import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';

import SidebarLayout from './components/layout/searchbar';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import ReportIssue from './pages/ReportIssue';
import CommunityFeed from './pages/CommunityFeed';
import Emergency from './pages/Emergency';
import Notifications from './pages/Notifications';

const PlaceholderPage = ({ title }) => {
  return (
    <main className="min-h-screen bg-surface px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <section className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            This section is connected to the app routing and ready for its full page.
          </p>
        </section>
      </div>
    </main>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PlaceholderPage title="Sign In" />} />
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/map" element={<PlaceholderPage title="Issue Map" />} />
          <Route path="/report" element={<ReportIssue/>} />
          <Route path="/feed" element={<CommunityFeed/>} />
          <Route path="/discussions" element={<PlaceholderPage title="Discussions" />} />
          <Route path="/notification" element={<Notifications />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/issue/:issueId" element={<PlaceholderPage title="Issue Details" />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
