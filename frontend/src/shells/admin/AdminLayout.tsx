import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminEventNav } from './AdminEventNav';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  // Show contextual event tabs when navigating inside an event (excluding creation wizard)
  const isCreatingEvent = location.pathname === '/admin/events/new';
  const isInsideEvent =
    location.pathname.includes('/admin/events/') && !isCreatingEvent;


  return (
    <div className="min-h-screen bg-surface-bg flex text-content-primary selection:bg-gold-200 selection:text-navy-950">
      {/* Global Desktop Sidebar */}
      <AdminSidebar />

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        {isInsideEvent && <AdminEventNav />}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
