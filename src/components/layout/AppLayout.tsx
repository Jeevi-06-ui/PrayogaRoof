import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const location = useLocation();

  // On the landing page, we can show a spacious header or full-width view
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      <div className="flex flex-1">
        {/* Sidebar (Navigation) */}
        {!isLanding && (
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            isMobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!isLanding && (
            <Header onOpenMobileMenu={() => setMobileOpen(true)} />
          )}

          <main className={`flex-1 ${!isLanding ? 'p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8' : ''}`}>
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop & landing page) */}
      {!isLanding && <MobileNav />}
    </div>
  );
};
