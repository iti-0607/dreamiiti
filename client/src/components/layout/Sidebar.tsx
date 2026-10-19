import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sun,
  LayoutDashboard,
  Sparkles,
  Target,
  CheckSquare,
  Calendar as CalendarIcon,
  Sprout,
  Clock,
  HeartHandshake,
  Compass,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Today', path: '/app/today', icon: Sun, color: 'text-amber-500' },
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, color: 'text-sage-600' },
    { name: 'Dream Vault', path: '/app/dreams', icon: Sparkles, color: 'text-lavender-600' },
    { name: 'Goal Tree', path: '/app/goals', icon: Target, color: 'text-sage-600' },
    { name: 'Tasks', path: '/app/tasks', icon: CheckSquare, color: 'text-sage-700' },
    { name: 'Calendar', path: '/app/calendar', icon: CalendarIcon, color: 'text-amber-600' },
    { name: 'Habit Garden', path: '/app/habits', icon: Sprout, color: 'text-emerald-600' },
    { name: 'Focus Mode', path: '/app/focus', icon: Clock, color: 'text-sage-600' },
    { name: 'Wellness & Journal', path: '/app/wellness', icon: HeartHandshake, color: 'text-lavender-600' },
    { name: 'Reviews', path: '/app/reviews', icon: Compass, color: 'text-amber-600' },
    { name: 'Insights', path: '/app/insights', icon: BarChart3, color: 'text-sage-600' },
    { name: 'Settings', path: '/app/settings', icon: Settings, color: 'text-charcoal-500' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-white border-r border-charcoal-200/80 flex flex-col transition-all duration-300 shadow-soft hidden md:flex ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-charcoal-200/60">
        <NavLink to="/app/today" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-sage-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            D
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-charcoal-900 leading-none">
                DreamIITi
              </span>
              <span className="text-[10px] text-sage-600 font-medium tracking-wide mt-0.5">
                Plans become reality
              </span>
            </div>
          )}
        </NavLink>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-sage-50 text-sage-800 font-semibold shadow-inner-soft border border-sage-200/60'
                    : 'text-charcoal-600 hover:bg-ivory-100 hover:text-charcoal-900'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${item.color}`} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-charcoal-200/60 bg-ivory-50/50">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-sage-100 text-sage-800 border border-sage-300 font-semibold text-xs flex items-center justify-center shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-charcoal-900 truncate">
                {user?.name || 'Dreamer'}
              </div>
              <div className="text-[11px] text-charcoal-500 truncate">{user?.email}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => logout()}
              className="text-charcoal-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
