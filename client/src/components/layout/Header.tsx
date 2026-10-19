import React from 'react';
import { Plus, Sparkles, Bell, Calendar as CalIcon } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { format } from 'date-fns';

interface HeaderProps {
  onOpenQuickAdd: () => void;
  collapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickAdd, collapsed }) => {
  const { user } = useAuth();
  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-charcoal-200/80 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 left-0 ${
        collapsed ? 'md:left-20' : 'md:left-64'
      }`}
    >
      {/* Left: Date / Greeting Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-charcoal-500 bg-ivory-100/80 px-3 py-1.5 rounded-xl border border-charcoal-200/60">
          <CalIcon className="w-3.5 h-3.5 text-sage-600" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={onOpenQuickAdd}
          className="shadow-sm font-semibold"
        >
          <span className="hidden sm:inline">Add Action</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
};
