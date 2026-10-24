import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Flame,
  Calendar as CalendarIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Coins,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'My Goals', path: '/app/goals', icon: Target },
    { name: 'Daily Habits', path: '/app/habits', icon: Flame },
    { name: 'Calendar', path: '/app/calendar', icon: CalendarIcon },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 z-50 bg-[#101713] border-r border-[#27352C] flex flex-col transition-all duration-300 md:left-0 md:flex ${
          mobileOpen
            ? 'left-0 w-72 shadow-2xl flex'
            : '-left-full hidden md:flex'
        } ${collapsed ? 'md:w-20' : 'md:w-60'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#27352C] shrink-0">
          <NavLink
            to="/app/dashboard"
            onClick={onMobileClose}
            className="flex items-center gap-2 overflow-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1B3024] border border-[#39E58C]/40 flex items-center justify-center text-[#39E58C] font-extrabold text-base shrink-0">
              D
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="font-extrabold text-lg tracking-tight text-[#F2F7F3]">
                Dream<span className="text-[#39E58C]">IITi</span>
              </span>
            )}
          </NavLink>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-[#98A69C] hover:text-[#F2F7F3] hover:bg-[#1B241E] transition-colors hidden md:block"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg text-[#98A69C] hover:text-[#F2F7F3] hover:bg-[#1B241E] border border-[#27352C] md:hidden transition-colors"
              title="Close menu"
            >
              <X className="w-4 h-4 text-[#39E58C]" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-[#1B3024] text-[#39E58C] font-semibold border border-[#39E58C]/30'
                      : 'text-[#98A69C] hover:bg-[#1B241E] hover:text-[#F2F7F3]'
                  } ${collapsed && !mobileOpen ? 'justify-center px-0' : ''}`
                }
                title={collapsed && !mobileOpen ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User & Coin Section */}
        <div className="p-3 border-t border-[#27352C] space-y-2 bg-[#101713] shrink-0">
          {(!collapsed || mobileOpen) && (
            <div className="px-3 py-2 rounded-xl bg-[#151C17] border border-[#27352C] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#39E58C]" />
                <span className="text-xs text-[#98A69C]">Coins</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#39E58C]">
                {user?.coinBalance || 0}
              </span>
            </div>
          )}

          <div
            className={`flex items-center ${
              collapsed && !mobileOpen ? 'justify-center' : 'justify-between'
            } px-2 py-1.5`}
          >
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-xs font-semibold text-[#F2F7F3] truncate">
                  {user?.name || 'Aspirant'}
                </span>
                <span className="text-[10px] text-[#98A69C] truncate">{user?.email}</span>
              </div>
            )}
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-[#98A69C] hover:text-red-400 hover:bg-[#1B241E] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
