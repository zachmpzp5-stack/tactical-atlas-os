import React, { lazy, Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import NotificationPanel from './components/NotificationPanel';
import Toast from './components/Toast';
import BootSequence from './components/BootSequence';

const Headquarters = lazy(() => import('./pages/Headquarters'));
const Operations = lazy(() => import('./pages/Operations'));
const GrandLibrary = lazy(() => import('./pages/GrandLibrary'));
const AtlasArchives = lazy(() => import('./pages/AtlasArchives'));
const MediaVault = lazy(() => import('./pages/MediaVault'));
const ResearchNetwork = lazy(() => import('./pages/ResearchNetwork'));
const CaseFiles = lazy(() => import('./pages/CaseFiles'));
const AiProduction = lazy(() => import('./pages/AiProduction'));
const Analytics = lazy(() => import('./pages/Analytics'));
const SystemStatus = lazy(() => import('./pages/SystemStatus'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Terms = lazy(() => import('./pages/Terms'));
const FieldCommand = lazy(() => import('./pages/FieldCommand'));

import { INTELLIGENCE_FEED } from './data/mockData';

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [notifications, setNotifications] = useState(INTELLIGENCE_FEED);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  const navigate = useNavigate();

  const handleCloseSidebar = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

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
          <Suspense
            fallback={
              <div className="p-6 font-mono text-xs text-emerald-300">LOADING COMMAND MODULE…</div>
            }
          >
            <Routes>
              <Route
                path="/login"
                element={<Login showToast={showToast} onNavigate={navigate} />}
              />
              <Route
                path="/signup"
                element={<Signup showToast={showToast} onNavigate={navigate} />}
              />
              <Route path="/terms" element={<Terms onNavigate={navigate} />} />
              <Route
                path="/"
                element={
                  Capacitor.isNativePlatform() ? (
                    <Navigate to="/field-command" replace />
                  ) : (
                    <Headquarters
                      onNavigate={handleNavigateCase}
                      notifications={notifications}
                      showToast={showToast}
                    />
                  )
                }
              />
              <Route
                path="/headquarters"
                element={
                  <Headquarters
                    onNavigate={handleNavigateCase}
                    notifications={notifications}
                    showToast={showToast}
                  />
                }
              />
              <Route path="/operations" element={<Operations showToast={showToast} />} />
              <Route path="/field-command" element={<FieldCommand showToast={showToast} />} />
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
          </Suspense>
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
      <BootSequence>
        <AppContent />
      </BootSequence>
    </Router>
  );
}
