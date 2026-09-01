import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminEventNav } from './AdminEventNav';
import { Drawer } from '../../design-system';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Show contextual event tabs when navigating inside an event (excluding creation wizard)
  const isCreatingEvent = location.pathname === '/admin/events/new';
  const isInsideEvent =
    location.pathname.includes('/admin/events/') && !isCreatingEvent;

  return (
    <div className="min-h-screen bg-obsidian-950 flex text-silver-100 selection:bg-gold-500/30 selection:text-silver-50">
      {/* Global Desktop & Tablet Persistent Sidebar (hidden on mobile < 1024px) */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Navigation Drawer (< 1024px) */}
      <Drawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        placement="left"
        size="sm"
        title="Plataforma GR"
        description="Navegación Administrativa"
      >
        <div className="-m-6 h-full flex flex-col">
          <AdminSidebar onNavigate={() => setIsMobileNavOpen(false)} className="w-full border-r-0" />
        </div>
      </Drawer>

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onOpenMobileNav={() => setIsMobileNavOpen(true)} />

        {isInsideEvent && <AdminEventNav />}

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn focus:outline-none"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
