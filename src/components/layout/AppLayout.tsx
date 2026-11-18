import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { useMobileBackButton } from '../../services/mobile/mobileBackHandler';
import { initializeMobileAuthDeepLinks } from '../../services/mobile/mobileAuthHandler';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const location = useLocation();

  // Attach global mobile hardware back-button listener
  useMobileBackButton();

  // Attach mobile authentication deep link handler for native capacitor redirects
  React.useEffect(() => {
    return initializeMobileAuthDeepLinks();
  }, []);

  const isLanding = location.pathname === '/' || location.pathname === '/welcome' || location.pathname === '/auth';
  const isFullscreenWorkspace = location.pathname.startsWith('/workspace');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased overflow-x-hidden">
      <div className="flex flex-1 min-w-0">
        {/* Desktop Sidebar (Navigation) */}
        {!isLanding && !isFullscreenWorkspace && (
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            isMobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!isLanding && !isFullscreenWorkspace && (
            <Header onOpenMobileMenu={() => setMobileOpen(true)} />
          )}

          <main
            className={`flex-1 min-w-0 ${
              isLanding
                ? ''
                : isFullscreenWorkspace
                ? 'p-0 h-screen overflow-hidden'
                : 'p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8'
            }`}
          >
            <Outlet />
          </main>

          {!isLanding && !isFullscreenWorkspace && <Footer />}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop, landing page, and fullscreen lab) */}
      {!isLanding && !isFullscreenWorkspace && <MobileNav />}
    </div>
  );
};
