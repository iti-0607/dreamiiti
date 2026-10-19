import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { ScheduledBlock } from '../types/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
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
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [view, setView] = useState<'day' | 'week' | 'month' | 'agenda'>('week');
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

  const { data: blocksData, isLoading } = useQuery({
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
      success('Time block removed.');
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
      warning('No overdue scheduled tasks found.');
      return;
    }

    try {
      await api.post('/calendar/resolve-unfinished', {
        action,
        taskIds: uncompletedTaskIds,
      });
      success(`Rescheduled ${uncompletedTaskIds.length} tasks without guilt.`);
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err: any) {
      error(err.message || 'Failed to resolve unfinished work');
    }
  };

  const blocks: ScheduledBlock[] = blocksData?.blocks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
            <CalIcon className="w-6 h-6 text-amber-600" />
            <span>Flexible Timetable & Calendar</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Time-blocking with conflict detection and guilt-free rescheduling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleResolveUnfinished('tomorrow')}
            title="Move unfinished scheduled work to tomorrow"
          >
            Reschedule Unfinished
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddBlockOpen(true)}
          >
            Schedule Block
          </Button>
        </div>
      </div>

      {/* View Selectors & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-charcoal-200/80 shadow-soft">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-ivory-100 p-1 rounded-xl text-xs font-semibold">
            {['agenda', 'day', 'week', 'month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                  view === v
                    ? 'bg-white text-sage-800 shadow-sm'
                    : 'text-charcoal-500 hover:text-charcoal-800'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-charcoal-700">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 7);
              setSelectedDate(d);
            }}
            className="p-1 rounded-lg hover:bg-ivory-100 text-charcoal-400 hover:text-charcoal-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            {selectedDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 7);
              setSelectedDate(d);
            }}
            className="p-1 rounded-lg hover:bg-ivory-100 text-charcoal-400 hover:text-charcoal-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conflict Warning Banner if active */}
      {conflictWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 animate-slide-up">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">Schedule Overlap Alert</div>
            <p>{conflictWarning}</p>
          </div>
        </div>
      )}

      {/* Calendar View Area */}
      {view === 'agenda' || view === 'day' || view === 'week' ? (
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-charcoal-400 text-xs">
              Loading calendar schedule...
            </div>
          ) : blocks.length === 0 ? (
            <Card className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                <CalIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">
                No scheduled blocks on your timetable
              </h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-4">
                Time-blocking creates clarity without rigid stress. Schedule your first block!
              </p>
              <Button variant="primary" size="sm" onClick={() => setIsAddBlockOpen(true)}>
                Schedule Block
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {blocks.map((block) => {
                const start = new Date(block.startTime);
                const end = new Date(block.endTime);
                const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

                return (
                  <Card
                    key={block.id}
                    className={`p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      block.isBreak
                        ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                        : 'bg-white border-charcoal-200/90 shadow-soft text-charcoal-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          block.isBreak
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-sage-100 text-sage-700'
                        }`}
                      >
                        {block.isBreak ? <Coffee className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="text-sm font-bold flex items-center gap-2">
                          <span>{block.title}</span>
                          {block.isBreak && (
                            <Badge variant="amber" size="sm">
                              Break
                            </Badge>
                          )}
                          {block.isOverride && (
                            <Badge variant="charcoal" size="sm">
                              Overlap Allowed
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-0.5">
                          {start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                          • {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({durationMinutes}m)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => deleteBlockMutation.mutate(block.id)}
                        className="p-1.5 rounded-lg text-charcoal-300 hover:text-rose-600 transition-colors"
                        title="Delete block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Month View Minimal Matrix */
        <Card className="p-6">
          <div className="text-xs font-bold text-charcoal-600 uppercase tracking-wider mb-4">
            Month Overview ({blocks.length} scheduled blocks)
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="font-bold text-charcoal-400 py-1">
                {day}
              </div>
            ))}
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="h-16 p-1.5 rounded-xl border border-charcoal-100 bg-ivory-50/40 text-left text-[11px] flex flex-col justify-between"
              >
                <span className="text-charcoal-400 font-semibold">{i + 1}</span>
                {i === 12 || i === 14 ? (
                  <span className="text-[9px] bg-sage-100 text-sage-800 p-0.5 rounded truncate font-medium">
                    Focus Block
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Schedule Block Modal */}
      <Modal
        isOpen={isAddBlockOpen}
        onClose={() => setIsAddBlockOpen(false)}
        title="Schedule Calendar Block"
        maxWidth="md"
      >
        <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Block Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Work: System Design or Restorative Walk"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Start Time *
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                End Time *
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBreak}
                onChange={(e) => setIsBreak(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-medium text-charcoal-700">This is a break/rest buffer</span>
            </label>

            {conflictWarning && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOverride}
                  onChange={(e) => setIsOverride(e.target.checked)}
                  className="rounded text-sage-600 focus:ring-sage-500"
                />
                <span className="text-xs font-bold text-amber-800">Allow overlap (Override)</span>
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsAddBlockOpen(false)}>
              Cancel
            </Button>
            <Button variant="amber" type="submit">
              Save Block
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
