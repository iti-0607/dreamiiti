import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { ScheduledBlock } from '../types/index.js';
import { Modal } from '../components/ui/Modal.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  Calendar as CalIcon,
  Plus,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Trash2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [view, setView] = useState<'agenda' | 'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(
    new Date(Date.now() + 1000 * 60 * 30).toISOString().slice(0, 16)
  );
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 1000 * 60 * 90).toISOString().slice(0, 16)
  );
  const [isBreak, setIsBreak] = useState(false);
  const [isOverride, setIsOverride] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const { success, warning, error } = useNotification();
  const queryClient = useQueryClient();

  const { data: blocksData, isLoading } = useQuery<{ blocks: ScheduledBlock[] }>({
    queryKey: ['calendar-blocks'],
    queryFn: () => api.get('/calendar/blocks'),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => api.get('/tasks?view=all'),
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/calendar/blocks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
      success('Schedule block removed');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to remove block');
    },
  });

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await api.post('/calendar/blocks', {
        title: title.trim(),
        startTime,
        endTime,
        isBreak,
        isOverride,
      });

      if (res.hasConflict) {
        setConflictWarning(res.warning);
        warning(res.warning, 'Schedule Conflict Detected');
        return;
      }

      success('Time block scheduled!');
      setIsAddBlockOpen(false);
      setTitle('');
      setConflictWarning(null);
      setIsOverride(false);
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
    } catch (err: any) {
      error(err.message || 'Failed to create block');
    }
  };

  const handleResolveUnfinished = async (action: 'tomorrow' | 'backlog') => {
    const uncompletedTaskIds = (tasksData?.tasks || [])
      .filter((t: any) => t.status !== 'COMPLETED' && t.dueDate)
      .map((t: any) => t.id);

    if (uncompletedTaskIds.length === 0) {
      warning('No overdue scheduled tasks found');
      return;
    }

    try {
      await api.post('/calendar/resolve-unfinished', {
        action,
        taskIds: uncompletedTaskIds,
      });
      success(`Rescheduled ${uncompletedTaskIds.length} tasks to tomorrow cleanly.`);
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err: any) {
      error(err.message || 'Failed to resolve unfinished work');
    }
  };

  const blocks: ScheduledBlock[] = blocksData?.blocks || [];

  const navigateDate = (deltaDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + deltaDays);
    setSelectedDate(d);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#F2F7F3] tracking-tight">
              Calendar & Timetable
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1B3024] text-[#39E58C] border border-[#27352C]">
              Now u will remember
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#98A69C] mt-1">
            For your imp task coming between your plans
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleResolveUnfinished('tomorrow')}
            title="Move unfinished scheduled work to tomorrow"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#151C17] border border-[#27352C] hover:border-[#39E58C]/40 text-xs font-semibold text-[#98A69C] hover:text-[#F2F7F3] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Shift Unfinished</span>
          </button>

          <button
            onClick={() => setIsAddBlockOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Block</span>
          </button>
        </div>
      </div>

      {/* View Switcher & Navigator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151C17] border border-[#27352C] p-3 rounded-2xl">
        {/* View tabs */}
        <div className="flex items-center bg-[#101713] p-1 rounded-xl border border-[#27352C]">
          {(['agenda', 'day', 'week', 'month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${view === v
                ? 'bg-[#1B3024] text-[#39E58C] border border-[#39E58C]/40 shadow-sm'
                : 'text-[#98A69C] hover:text-[#F2F7F3]'
                }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#F2F7F3]">
          <button
            onClick={() => navigateDate(view === 'month' ? -30 : view === 'week' ? -7 : -1)}
            className="p-1.5 rounded-lg bg-[#101713] border border-[#27352C] text-[#98A69C] hover:text-[#39E58C] transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="min-w-[130px] text-center">
            {selectedDate.toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={() => navigateDate(view === 'month' ? 30 : view === 'week' ? 7 : 1)}
            className="p-1.5 rounded-lg bg-[#101713] border border-[#27352C] text-[#98A69C] hover:text-[#39E58C] transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-2 py-1 rounded-lg bg-[#1B241E] border border-[#27352C] text-[11px] text-[#98A69C] hover:text-[#39E58C] transition ml-1"
          >
            Today
          </button>
        </div>
      </div>

      {/* Conflict Warning Banner */}
      {conflictWarning && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-900/60 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-amber-300">Schedule Overlap Detected</div>
            <p className="mt-0.5 text-amber-200/90">{conflictWarning}</p>
          </div>
        </div>
      )}

      {/* Content View */}
      {view === 'month' ? (
        /* Month Grid */
        <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-4 sm:p-6 overflow-x-auto scrollbar-thin">
          <div className="min-w-[540px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#F2F7F3] uppercase tracking-wider">
                {selectedDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </h3>
              <span className="text-xs text-[#98A69C]">{blocks.length} scheduled blocks</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="font-bold text-[#4E6155] py-1 text-[11px] uppercase">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = (i % 31) + 1;
                const hasEvents = blocks.some((b) => {
                  const bDate = new Date(b.startTime);
                  return bDate.getDate() === dayNum;
                });

                return (
                  <div
                    key={i}
                    className="h-20 p-2 rounded-xl border border-[#27352C]/60 bg-[#101713] text-left flex flex-col justify-between hover:border-[#39E58C]/40 transition"
                  >
                    <span className="text-[11px] font-bold text-[#98A69C]">{dayNum}</span>
                    {hasEvents && (
                      <div className="w-full truncate text-[10px] font-semibold bg-[#1B3024] text-[#39E58C] border border-[#39E58C]/30 px-1 py-0.5 rounded">
                        Focus Block
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Agenda / Day / Week List */
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-12 text-center text-sm text-[#98A69C]">
              Loading schedule...
            </div>
          ) : blocks.length === 0 ? (
            <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1B3024] text-[#39E58C] flex items-center justify-center mx-auto">
                <CalIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F2F7F3]">No time blocks scheduled</h3>
                <p className="text-xs text-[#98A69C] max-w-sm mx-auto mt-1">
                  Structure creates discipline. Schedule your key deep work windows and rest intervals.
                </p>
              </div>
              <button
                onClick={() => setIsAddBlockOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] font-bold text-xs transition"
              >
                + Schedule Time Block
              </button>
            </div>
          ) : (
            blocks.map((block) => {
              const start = new Date(block.startTime);
              const end = new Date(block.endTime);
              const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

              return (
                <div
                  key={block.id}
                  className="bg-[#151C17] border border-[#27352C] hover:border-[#39E58C]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${block.isBreak
                        ? 'bg-[#1B241E] text-amber-400 border-amber-900/40'
                        : 'bg-[#1B3024] text-[#39E58C] border-[#39E58C]/30'
                        }`}
                    >
                      {block.isBreak ? <Coffee className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#F2F7F3]">{block.title}</span>
                        {block.isBreak && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-900/40">
                            Break
                          </span>
                        )}
                        {block.isOverride && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B241E] text-[#98A69C] border border-[#27352C]">
                            Override
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#98A69C] mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>
                          {start.toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#101713] border border-[#27352C] text-[10px]">
                          {durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Remove block "${block.title}"?`)) {
                        deleteBlockMutation.mutate(block.id);
                      }
                    }}
                    className="p-2 rounded-xl text-[#98A69C] hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/30 transition shrink-0 self-end sm:self-center"
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Schedule Block Modal */}
      <Modal
        isOpen={isAddBlockOpen}
        onClose={() => setIsAddBlockOpen(false)}
        title="Schedule Calendar Block"
        maxWidth="md"
      >
        <form onSubmit={handleCreateBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
              Block Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Work: System Architecture or Workout Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] placeholder-[#4E6155] text-sm focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
                Start Time *
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] text-sm focus:outline-none focus:border-[#39E58C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
                End Time *
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] text-sm focus:outline-none focus:border-[#39E58C]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBreak}
                onChange={(e) => setIsBreak(e.target.checked)}
                className="w-4 h-4 rounded border-[#27352C] text-[#39E58C] focus:ring-0 bg-[#0B0F0D] accent-[#39E58C]"
              />
              <span className="text-xs font-medium text-[#98A69C]">
                Rest / Buffer block (not deep work)
              </span>
            </label>

            {conflictWarning && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOverride}
                  onChange={(e) => setIsOverride(e.target.checked)}
                  className="w-4 h-4 rounded border-amber-600 text-amber-500 focus:ring-0 bg-[#0B0F0D] accent-amber-500"
                />
                <span className="text-xs font-bold text-amber-400">Allow Overlap (Override)</span>
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddBlockOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#98A69C] hover:text-[#F2F7F3] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] text-xs font-bold shadow-md transition"
            >
              Save Schedule Block
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
