import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { MobileNav } from './MobileNav.js';
import { QuickAddModal } from '../ui/QuickAddModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { Loader2 } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory-100">
        <div className="w-12 h-12 rounded-2xl bg-sage-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-soft animate-gentle-pulse mb-3">
          D
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-charcoal-600">
          <Loader2 className="w-4 h-4 animate-spin text-sage-600" />
          <span>Awakening your workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-ivory-100/60 text-charcoal-900 flex flex-col">
      {/* Desktop Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Top Header */}
      <Header
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        collapsed={collapsed}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-16 pb-20 md:pb-8 px-4 sm:px-8 max-w-7xl w-full mx-auto ${
          collapsed ? 'md:pl-24' : 'md:pl-72'
        }`}
      >
        <div className="py-6 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Quick Add Action Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
};
