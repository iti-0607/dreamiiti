import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Flame, Calendar as CalIcon, Menu } from 'lucide-react';

interface MobileNavProps {
  onOpenMenu?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenMenu }) => {
  const items = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'My Goals', path: '/app/goals', icon: Target },
    { name: 'Habits', path: '/app/habits', icon: Flame },
    { name: 'Calendar', path: '/app/calendar', icon: CalIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#101713]/95 backdrop-blur-md border-t border-[#27352C] md:hidden py-1 px-2 flex items-center justify-around shadow-2xl safe-area-bottom">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1.5 rounded-lg transition-all ${
                isActive
                  ? 'text-[#39E58C] font-bold scale-105'
                  : 'text-[#98A69C] hover:text-[#F2F7F3]'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}

      {/* Hamburger / Menu Drawer Trigger on Bottom Bar */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center p-1.5 rounded-lg text-[#98A69C] hover:text-[#39E58C] transition-colors"
        title="More options"
        aria-label="Open menu drawer"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Menu</span>
      </button>
    </nav>
  );
};
