import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { Button } from './Button.js';
import { api } from '../../api/client.js';
import { useNotification } from '../../context/NotificationContext.js';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { CheckSquare, Sparkles, Sprout, Calendar } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'task' | 'dream' | 'habit' | 'block'>('task');
  const [loading, setLoading] = useState(false);
  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  // Load user dreams and goals for dropdown options
  const { data: dreamsData } = useQuery({
    queryKey: ['dreams'],
    queryFn: () => api.get('/dreams'),
    enabled: isOpen,
  });

  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals'),
    enabled: isOpen,
  });

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('SHOULD_DO');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskMinutes, setTaskMinutes] = useState(30);
  const [taskGoalId, setTaskGoalId] = useState('');

  // Dream Form State
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamMotivation, setDreamMotivation] = useState('');
  const [dreamTimeframe, setDreamTimeframe] = useState('3_months');

  // Habit Form State
  const [habitName, setHabitName] = useState('');
  const [habitFrequency, setHabitFrequency] = useState('DAILY');

  // Calendar Block Form State
  const [blockTitle, setBlockTitle] = useState('');
  const [blockStartTime, setBlockStartTime] = useState(
    new Date(Date.now() + 1000 * 60 * 30).toISOString().slice(0, 16)
  );
  const [blockEndTime, setBlockEndTime] = useState(
    new Date(Date.now() + 1000 * 60 * 90).toISOString().slice(0, 16)
  );

  const resetForms = () => {
    setTaskTitle('');
    setDreamTitle('');
    setDreamMotivation('');
    setHabitName('');
    setBlockTitle('');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setLoading(true);
    try {
      await api.post('/tasks', {
        title: taskTitle.trim(),
        priority: taskPriority,
        dueDate: taskDueDate || null,
        estimatedMinutes: Number(taskMinutes),
        goalId: taskGoalId || null,
      });
      success('Task added to your plan!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      resetForms();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamTitle.trim()) return;
    setLoading(true);
    try {
      await api.post('/dreams', {
        title: dreamTitle.trim(),
        motivation: dreamMotivation.trim(),
        timeframe: dreamTimeframe,
      });
      success('New dream planted in your vault!');
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      resetForms();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to create dream');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    setLoading(true);
    try {
      await api.post('/habits', {
        name: habitName.trim(),
        frequency: habitFrequency,
      });
      success('Habit added to your garden!');
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      resetForms();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/calendar/blocks', {
        title: blockTitle.trim(),
        startTime: blockStartTime,
        endTime: blockEndTime,
      });
      if (res.hasConflict) {
        error(res.warning || 'Time slot overlaps with an existing block');
      } else {
        success('Time block scheduled on calendar!');
        queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
        resetForms();
        onClose();
      }
    } catch (err: any) {
      error(err.message || 'Failed to schedule block');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Action" maxWidth="lg">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-ivory-100 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => setTab('task')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'task'
              ? 'bg-white text-sage-800 shadow-sm'
              : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-sage-600" />
          Task
        </button>
        <button
          type="button"
          onClick={() => setTab('dream')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'dream'
              ? 'bg-white text-lavender-800 shadow-sm'
              : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-lavender-600" />
          Dream
        </button>
        <button
          type="button"
          onClick={() => setTab('habit')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'habit'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          Habit
        </button>
        <button
          type="button"
          onClick={() => setTab('block')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'block'
              ? 'bg-white text-amber-800 shadow-sm'
              : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          Time Block
        </button>
      </div>

      {/* Task Form */}
      {tab === 'task' && (
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Outline chapter 1 notes"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              >
                <option value="MUST_DO">Must-Do (Core Priority)</option>
                <option value="SHOULD_DO">Should-Do (Important)</option>
                <option value="OPTIONAL">Optional (If Time Allows)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Est. Duration
              </label>
              <select
                value={taskMinutes}
                onChange={(e) => setTaskMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Attach to Goal
              </label>
              <select
                value={taskGoalId}
                onChange={(e) => setTaskGoalId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white truncate"
              >
                <option value="">No parent goal (General task)</option>
                {goalsData?.goals?.map((g: any) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Create Task
            </Button>
          </div>
        </form>
      )}

      {/* Dream Form */}
      {tab === 'dream' && (
        <form onSubmit={handleCreateDream} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Dream Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master distributed systems or Run a marathon"
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Why this matters to me (Motivation)
            </label>
            <textarea
              rows={2}
              placeholder="What makes this meaningful? How will achieving this feel?"
              value={dreamMotivation}
              onChange={(e) => setDreamMotivation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Target Horizon
            </label>
            <select
              value={dreamTimeframe}
              onChange={(e) => setDreamTimeframe(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
            >
              <option value="1_month">1 Month</option>
              <option value="3_months">3 Months</option>
              <option value="6_months">6 Months</option>
              <option value="1_year">1 Year</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="lavender" type="submit" loading={loading}>
              Plant Dream
            </Button>
          </div>
        </form>
      )}

      {/* Habit Form */}
      {tab === 'habit' && (
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Morning hydration & stretch (10m)"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Frequency
            </label>
            <select
              value={habitFrequency}
              onChange={(e) => setHabitFrequency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
            >
              <option value="DAILY">Every Day</option>
              <option value="WEEKDAYS">Weekdays (Mon - Fri)</option>
              <option value="WEEKLY">3-4 Times a Week</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Cultivate Habit
            </Button>
          </div>
        </form>
      )}

      {/* Calendar Block Form */}
      {tab === 'block' && (
        <form onSubmit={handleCreateBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Block Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Focus: Algorithm problem solving"
              value={blockTitle}
              onChange={(e) => setBlockTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={blockStartTime}
                onChange={(e) => setBlockStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                End Time
              </label>
              <input
                type="datetime-local"
                required
                value={blockEndTime}
                onChange={(e) => setBlockEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="amber" type="submit" loading={loading}>
              Schedule Block
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
