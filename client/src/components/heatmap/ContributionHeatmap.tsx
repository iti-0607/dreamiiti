import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { HeatmapResponse, HeatmapDay } from '../../types/index.js';
import { Flame, Trophy, Calendar, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const LEVEL_COLORS = [
  'bg-[#151C17] border-[#27352C]', // Level 0: No activity
  'bg-[#166534] border-[#22C55E]', // Level 1: 1 activity (Lights up bright emerald on 1 completed task!)
  'bg-[#15803D] border-[#4ADE80]', // Level 2: 2-3 activities
  'bg-[#22C55E] border-[#86EFAC]', // Level 3: 4-5 activities
  'bg-[#39E58C] border-[#B8F7D4] shadow-[0_0_10px_rgba(57,229,140,0.6)]', // Level 4: 6+ activities
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ContributionHeatmap: React.FC = () => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Local user today formatted as YYYY-MM-DD
  const todayDateObj = new Date();
  const localTodayIso = format(todayDateObj, 'yyyy-MM-dd');
  const localTodayFormatted = format(todayDateObj, 'EEEE, MMM d, yyyy');

  const { data, isLoading } = useQuery<HeatmapResponse>({
    queryKey: ['heatmap'],
    queryFn: () => api.get(`/insights/heatmap?today=${localTodayIso}`),
    staleTime: 0, // Always fresh when invalidated
  });

  if (isLoading) {
    return (
      <div className="discipline-card rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
        <div className="flex items-center gap-2 text-xs text-[#98A69C]">
          <Loader2 className="w-4 h-4 animate-spin text-[#39E58C]" />
          <span>Loading activity heatmap...</span>
        </div>
      </div>
    );
  }

  const days = data?.days || [];
  const todayDay = days.find((d) => d.date === localTodayIso || d.isToday);
  const todayCompletedCount = todayDay?.totalActivity || data?.todayCompletedCount || 0;
  const isTodayActive = todayCompletedCount > 0;

  // Group days into weeks (columns). Each week has 7 days (index 0=Mon ... 6=Sun)
  // Let's align dayOfWeek where 1=Mon, ..., 6=Sat, 0=Sun -> row index: (dayOfWeek + 6) % 7
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  // Pad the first week if necessary
  if (days.length > 0) {
    const firstDay = days[0];
    const firstRowIndex = (firstDay.dayOfWeek + 6) % 7; // 0 for Mon, 6 for Sun
    for (let i = 0; i < firstRowIndex; i++) {
      currentWeek.push({
        date: '',
        dayOfWeek: i,
        tasksCompleted: 0,
        tasksScheduled: 0,
        habitsCompleted: 0,
        habitsExpected: 0,
        coinsEarned: 0,
        totalActivity: 0,
        level: -1, // Empty placeholder
        isToday: false,
      });
    }
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Month labels calculation based on first week containing day 1 of month
  const monthLabels: { label: string; weekIndex: number }[] = [];
  weeks.forEach((wk, wIndex) => {
    const monthFirstDay = wk.find((d) => d.date && d.date.endsWith('-01'));
    if (monthFirstDay) {
      const monthIdx = parseInt(monthFirstDay.date.split('-')[1], 10) - 1;
      monthLabels.push({ label: MONTH_NAMES[monthIdx], weekIndex: wIndex });
    }
  });

  return (
    <div className="discipline-card rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Top Header & Streak Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#27352C] pb-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[#F2F7F3] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39E58C]"></span>
            Consistency Heatmap
          </h3>
          <p className="text-xs text-[#98A69C] mt-0.5">
            Real activity from completed daily tasks, goals, and habits over the past year.
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap text-xs">
          {/* Today's Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151C17] border border-[#27352C]">
            <Calendar className="w-3.5 h-3.5 text-[#39E58C]" />
            <span className="text-[#98A69C]">Today:</span>
            <span className="font-mono font-bold text-[#F2F7F3]">
              {format(todayDateObj, 'MMM d, yyyy')}
            </span>
            {isTodayActive ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#39E58C] bg-[#166534]/50 px-2 py-0.5 rounded border border-[#22C55E]/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39E58C] animate-pulse"></span>
                {todayCompletedCount} Done 🔥
              </span>
            ) : (
              <span className="text-[11px] text-[#98A69C] bg-[#1B241E] px-2 py-0.5 rounded border border-[#27352C]">
                0 Done
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B241E] border border-[#27352C]">
            <Flame className="w-3.5 h-3.5 text-[#39E58C]" />
            <span className="text-[#98A69C]">Streak:</span>
            <span className="font-mono font-bold text-[#39E58C]">{data?.currentStreak || 0}d</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B241E] border border-[#27352C]">
            <Trophy className="w-3.5 h-3.5 text-[#39E58C]" />
            <span className="text-[#98A69C]">Best:</span>
            <span className="font-mono font-bold text-[#F2F7F3]">{data?.longestStreak || 0}d</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B241E] border border-[#27352C]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#39E58C]" />
            <span className="text-[#98A69C]">Active Days:</span>
            <span className="font-mono font-bold text-[#F2F7F3]">{data?.activeDays || 0}</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[720px] select-none">
          {/* Month labels */}
          <div className="flex text-[10px] text-[#98A69C] mb-1.5 pl-7 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute font-medium"
                style={{ left: `${m.weekIndex * 14 + 28}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Weekday labels */}
            <div className="flex flex-col justify-between text-[9px] text-[#98A69C] pr-2 pt-0.5 w-6 h-[98px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => {
                    if (day.level === -1) {
                      return <div key={dIdx} className="w-[11px] h-[11px]" />;
                    }

                    const isToday = day.isToday || day.date === localTodayIso;
                    const colorClass = LEVEL_COLORS[day.level] || LEVEL_COLORS[0];

                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                          setHoveredDay(day);
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-[11px] h-[11px] rounded-[2.5px] border cursor-pointer transition-all hover:scale-125 hover:z-20 ${colorClass} ${isToday
                            ? 'ring-2 ring-[#39E58C] ring-offset-1 ring-offset-[#101713] z-10'
                            : ''
                          }`}
                        title={isToday ? `Today (${day.date}): ${day.totalActivity} completed` : undefined}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Legend & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#27352C]/60 text-xs text-[#98A69C]">
        <div className="flex items-center gap-3 text-[11px]">
          <div>
            Total items completed:{' '}
            <span className="font-mono font-bold text-[#F2F7F3]">
              {data?.totalCompletedTasks || 0}
            </span>
          </div>

          {/* Today Indicator Legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#F2F7F3] bg-[#1B241E] px-2 py-0.5 rounded border border-[#27352C]">
            <span className="w-[9px] h-[9px] rounded-[2px] bg-[#166534] border border-[#22C55E] ring-2 ring-[#39E58C] ring-offset-1 ring-offset-[#101713] inline-block"></span>
            <span>Green ring = Today ({format(todayDateObj, 'MMM d')})</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>Less</span>
          {LEVEL_COLORS.map((color, i) => (
            <span
              key={i}
              className={`w-[10px] h-[10px] rounded-[2px] border ${color}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-[#1B241E] border border-[#27352C] rounded-xl p-3 shadow-2xl text-xs text-[#F2F7F3] space-y-1 w-56 animate-fade-in"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 8}px` }}
        >
          <div className="font-bold text-[#39E58C] border-b border-[#27352C] pb-1 flex items-center justify-between">
            <span>{hoveredDay.date}</span>
            {(hoveredDay.isToday || hoveredDay.date === localTodayIso) && (
              <span className="text-[10px] bg-[#39E58C] text-[#0B0F0D] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                TODAY
              </span>
            )}
          </div>
          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#98A69C]">Tasks & Goals Done:</span>
              <span className="font-mono font-semibold text-[#F2F7F3]">{hoveredDay.tasksCompleted}</span>
            </div>
            {hoveredDay.tasksScheduled > 0 && (
              <div className="flex justify-between">
                <span className="text-[#98A69C]">Tasks Scheduled:</span>
                <span className="font-mono">{hoveredDay.tasksScheduled}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#98A69C]">Habits Completed:</span>
              <span className="font-mono font-semibold text-[#F2F7F3]">
                {hoveredDay.habitsCompleted} {hoveredDay.habitsExpected > 0 ? `/ ${hoveredDay.habitsExpected}` : ''}
              </span>
            </div>
            {hoveredDay.coinsEarned > 0 && (
              <div className="flex justify-between text-[#39E58C]">
                <span>Coins Earned:</span>
                <span className="font-mono font-bold">+{hoveredDay.coinsEarned} 🪙</span>
              </div>
            )}
            <div className="flex justify-between text-[#98A69C] pt-0.5 border-t border-[#27352C]/60 text-[10px]">
              <span>Total Activity Level:</span>
              <span className="font-mono font-bold text-[#39E58C]">
                {hoveredDay.totalActivity > 0 ? `${hoveredDay.totalActivity} items (Level ${hoveredDay.level})` : 'No activity'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
