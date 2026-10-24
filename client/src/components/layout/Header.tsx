import React from 'react';
import { Plus, Calendar as CalIcon, Coins, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenQuickAdd: () => void;
  onOpenMobileMenu?: () => void;
  collapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickAdd,
  onOpenMobileMenu,
}) => {
  const { user } = useAuth();
  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <header className="sticky top-0 z-20 h-16 w-full bg-[#101713]/95 backdrop-blur-md border-b border-[#27352C] flex items-center justify-between px-3 sm:px-6 shrink-0 transition-all">
      {/* Left: Mobile Hamburger & Brand / Desktop Date */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Hamburger Menu on Mobile */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-[#98A69C] hover:text-[#F2F7F3] hover:bg-[#1B241E] border border-[#27352C] md:hidden transition-colors flex items-center justify-center shrink-0"
          title="Open Menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-[#39E58C]" />
        </button>

        {/* Mobile Brand Name */}
        <Link to="/app/dashboard" className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-[#1B3024] border border-[#39E58C]/40 flex items-center justify-center text-[#39E58C] font-black text-xs shrink-0">
            D
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#F2F7F3]">
            Dream<span className="text-[#39E58C]">IITi</span>
          </span>
        </Link>

        {/* Desktop / Tablet Date display */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#98A69C] bg-[#151C17] px-3 py-1.5 rounded-lg border border-[#27352C]">
          <CalIcon className="w-3.5 h-3.5 text-[#39E58C]" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      {/* Right: Coin Balance & Add Task */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#151C17] border border-[#27352C] text-xs font-mono font-bold text-[#39E58C]">
          <Coins className="w-3.5 h-3.5" />
          <span>{user?.coinBalance || 0}</span>
          <span className="text-[10px] text-[#98A69C] font-sans font-normal hidden md:inline">
            coins
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Add Task</span>
          <span className="xs:hidden">Task</span>
        </button>
      </div>
    </header>
  );
};
