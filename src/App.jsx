import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import NotificationPanel from './components/NotificationPanel';
import Toast from './components/Toast';

import Headquarters from './pages/Headquarters';
import Operations from './pages/Operations';
import GrandLibrary from './pages/GrandLibrary';
import AtlasArchives from './pages/AtlasArchives';
import MediaVault from './pages/MediaVault';
import ResearchNetwork from './pages/ResearchNetwork';
import CaseFiles from './pages/CaseFiles';
import AiProduction from './pages/AiProduction';
import Analytics from './pages/Analytics';
import SystemStatus from './pages/SystemStatus';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Terms from './pages/Terms';

import { INTELLIGENCE_FEED } from './data/mockData';

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [notifications, setNotifications] = useState(INTELLIGENCE_FEED);
  const [toastMessage, setToastMessage] = useState(null);

  const navigate = useNavigate();

  const handleCloseSidebar = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('ALL NOTIFICATIONS MARKED AS READ');
    setNotificationsOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNavigateCase = (path, caseId = null) => {
    if (caseId) setSelectedCaseId(caseId);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-command-room text-slate-200 flex font-sans overflow-x-hidden relative">
      <div className="pointer-events-none fixed inset-0 bg-moving-grid opacity-20" />
      <div className="pointer-events-none fixed inset-0 scanline-overlay opacity-15" />

      <Sidebar isMobileOpen={mobileMenuOpen} onClose={handleCloseSidebar} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/login" element={<Login showToast={showToast} onNavigate={navigate} />} />
            <Route path="/signup" element={<Signup showToast={showToast} onNavigate={navigate} />} />
            <Route path="/terms" element={<Terms onNavigate={navigate} />} />
            <Route
              path="/"
              element={
                <Headquarters
                  onNavigate={handleNavigateCase}
                  notifications={notifications}
                  showToast={showToast}
                />
              }
            />
            <Route path="/operations" element={<Operations showToast={showToast} />} />
            <Route path="/library" element={<GrandLibrary showToast={showToast} />} />
            <Route path="/archives" element={<AtlasArchives showToast={showToast} />} />
            <Route path="/vault" element={<MediaVault showToast={showToast} />} />
            <Route path="/research" element={<ResearchNetwork showToast={showToast} />} />
            <Route
              path="/cases"
              element={<CaseFiles selectedId={selectedCaseId} showToast={showToast} />}
            />
            <Route path="/ai-studio" element={<AiProduction showToast={showToast} />} />
            <Route path="/analytics" element={<Analytics showToast={showToast} />} />
            <Route path="/status" element={<SystemStatus showToast={showToast} />} />
            <Route path="/settings" element={<Settings showToast={showToast} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>

      <NotificationPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
