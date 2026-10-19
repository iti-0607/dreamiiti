import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Target, Sprout, CheckSquare, Sparkles } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { name: 'Today', path: '/app/today', icon: Sun },
    { name: 'Tasks', path: '/app/tasks', icon: CheckSquare },
    { name: 'Goals', path: '/app/goals', icon: Target },
    { name: 'Habits', path: '/app/habits', icon: Sprout },
    { name: 'Dreams', path: '/app/dreams', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-charcoal-200/80 md:hidden py-1.5 px-3 flex items-center justify-around shadow-elevated">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-sage-700 font-bold scale-105'
                  : 'text-charcoal-400 hover:text-charcoal-700'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
