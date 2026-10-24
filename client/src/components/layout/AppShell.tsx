import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { MobileNav } from './MobileNav.js';
import { QuickAddModal } from '../ui/QuickAddModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { Loader2 } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F0D] text-[#F2F7F3]">
        <div className="w-12 h-12 rounded-xl bg-[#1B3024] border border-[#39E58C]/40 flex items-center justify-center text-[#39E58C] font-extrabold text-2xl mb-4">
          D
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#98A69C]">
          <Loader2 className="w-4 h-4 animate-spin text-[#39E58C]" />
          <span>Opening workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user hasn't completed onboarding and isn't on onboarding, redirect
  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-[#F2F7F3] flex flex-col selection:bg-[#1B3024] selection:text-[#39E58C]">
      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Layout Area — shifted cleanly right of the sidebar on desktop */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-60'
        }`}
      >
        {/* Sticky Header */}
        <Header
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenMobileMenu={() => setMobileOpen(true)}
          collapsed={collapsed}
        />

        {/* Page Content */}
        <main className="flex-1 pb-24 md:pb-8 px-3 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto overflow-x-hidden">
          <div className="py-4 sm:py-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav onOpenMenu={() => setMobileOpen(true)} />

      {/* Quick Add Task Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
};
