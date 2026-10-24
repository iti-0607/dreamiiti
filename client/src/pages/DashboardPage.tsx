import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { Task, Habit } from '../types/index.js';
import { ContributionHeatmap } from '../components/heatmap/ContributionHeatmap.js';
import { QuickAddModal } from '../components/ui/QuickAddModal.js';
import { Modal } from '../components/ui/Modal.js';
import {
  Plus,
  Check,
  Clock,
  Coins,
  MoreVertical,
  Trash2,
  Copy,
  Calendar,
  Flame,
  AlertCircle,
  Tag,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { format } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { user, updateCoinBalance } = useAuth();
  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Fetch today's tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery<{ success: boolean; tasks: Task[] }>({
    queryKey: ['tasks', 'today'],
    queryFn: () => api.get('/tasks?view=today'),
  });

  // Fetch habits
  const { data: habitsData } = useQuery<{ success: boolean; habits: Habit[] }>({
    queryKey: ['habits'],
    queryFn: () => api.get('/habits'),
  });

  const tasks = tasksData?.tasks || [];
  const habits = habitsData?.habits || [];

  // Filter today's habits based on current day of week (1=Mon ... 7=Sun)
  const currentIsoDay = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const todaysHabits = habits.filter((h) => {
    if (h.status !== 'ACTIVE') return false;
    if (h.frequency === 'DAILY') return true;
    if (h.frequency === 'WEEKDAYS') return currentIsoDay >= 1 && currentIsoDay <= 5;
    if (h.selectedWeekdays) {
      const selected = h.selectedWeekdays.split(',').map((s) => parseInt(s.trim(), 10));
      return selected.includes(currentIsoDay);
    }
    return true;
  });

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: string) => api.patch(`/tasks/${taskId}/toggle`),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
      queryClient.invalidateQueries({ queryKey: ['coins-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      queryClient.invalidateQueries({ queryKey: ['goal-points-overview'] });

      // Refresh auth to sync coin balance
      api.get('/auth/me').then((meRes) => {
        if (meRes.success && meRes.user) {
          updateCoinBalance(meRes.user.coinBalance);
        }
      });

      const task = res?.task || res;
      if (task?.status === 'COMPLETED') {
        const reward = task.rewardCoins || 0;
        if (reward > 0 && !task.rewardAwarded) {
          success(`Task complete! +${reward} coins earned.`);
        } else {
          success('Task completed! Great progress.');
        }
      } else {
        success('Task marked active.');
      }
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update task');
    },
  });

  // Toggle habit log
  const toggleHabitMutation = useMutation({
    mutationFn: (habitId: string) => api.post(`/habits/${habitId}/toggle`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
      queryClient.invalidateQueries({ queryKey: ['coins-ledger'] });

      api.get('/auth/me').then((meRes) => {
        if (meRes.success && meRes.user) {
          updateCoinBalance(meRes.user.coinBalance);
        }
      });
      success('Habit updated!');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update habit');
    },
  });

  // Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
      success('Task deleted');
      setMenuTaskId(null);
    },
  });

  // Reschedule to tomorrow
  const rescheduleTask = async (task: Task) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await api.put(`/tasks/${task.id}`, {
        dueDate: `${tomorrowStr}T23:59:59.000Z`,
        scheduledStart: null,
        scheduledEnd: null,
      });

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
      success('Rescheduled to tomorrow');
      setMenuTaskId(null);
    } catch (err: any) {
      error(err.message || 'Failed to reschedule');
    }
  };

  // Duplicate task
  const duplicateTask = async (task: Task) => {
    try {
      await api.post('/tasks', {
        title: `${task.title} (Copy)`,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        rewardCoins: task.rewardCoins,
        goalPointId: task.goalPointId,
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Task duplicated');
      setMenuTaskId(null);
    } catch (err: any) {
      error(err.message || 'Failed to duplicate task');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'pending') return t.status !== 'COMPLETED';
    if (activeTab === 'completed') return t.status === 'COMPLETED';
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header: Clean Greeting */}
      <div className="border-b border-[#27352C] pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F2F7F3]">
          {greeting}, {user?.name?.split(' ')[0] || 'Aspirant'}
        </h1>
      </div>

      {/* TODAY'S HABITS STRIP (if any) */}
      {todaysHabits.length > 0 && (
        <div className="discipline-card rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Today's Recurring Habits
            </span>
            <span className="text-[11px] text-[#98A69C]">
              {todaysHabits.filter((h) => h.isCompletedToday).length} of {todaysHabits.length} complete
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {todaysHabits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => toggleHabitMutation.mutate(habit.id)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                  habit.isCompletedToday
                    ? 'bg-[#1B3024]/60 border-[#39E58C]/40 text-[#F2F7F3]'
                    : 'bg-[#1B241E] border-[#27352C] text-[#F2F7F3] hover:border-[#39E58C]/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      habit.isCompletedToday
                        ? 'bg-[#39E58C] border-[#39E58C] text-[#0B0F0D]'
                        : 'border-[#27352C] bg-[#101713] group-hover:border-[#39E58C]'
                    }`}
                  >
                    {habit.isCompletedToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="truncate">
                    <span
                      className={`text-xs font-medium block truncate ${
                        habit.isCompletedToday ? 'line-through text-[#98A69C]' : ''
                      }`}
                    >
                      {habit.name}
                    </span>
                    {habit.scheduledTime && (
                      <span className="text-[10px] text-[#98A69C] flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" /> {habit.scheduledTime}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-right shrink-0">
                  <span className="text-[11px] font-mono text-[#39E58C]">
                    +{habit.rewardCoins}🪙
                  </span>
                  {habit.currentStreak > 0 && (
                    <span className="text-[10px] text-[#98A69C] font-mono">
                      🔥{habit.currentStreak}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TODAY'S TASKS (CENTRAL SECTION) */}
      <div className="discipline-card rounded-2xl p-5 sm:p-6 space-y-4">
        {/* Task Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27352C] pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#F2F7F3]">Today's Tasks</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#1B241E] text-[#39E58C] border border-[#27352C]">
              {tasks.length}
            </span>
          </div>

          {/* Filter Tabs: Pending / Completed / All */}
          <div className="flex items-center gap-1 bg-[#101713] p-1 rounded-xl border border-[#27352C] self-start sm:self-auto text-xs">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-[#1B3024] text-[#39E58C]'
                  : 'text-[#98A69C] hover:text-[#F2F7F3]'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-[#1B3024] text-[#39E58C]'
                  : 'text-[#98A69C] hover:text-[#F2F7F3]'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#1B3024] text-[#39E58C]'
                  : 'text-[#98A69C] hover:text-[#F2F7F3]'
              }`}
            >
              All ({tasks.length})
            </button>
          </div>
        </div>

        {/* Task Rows List */}
        {tasksLoading ? (
          <div className="py-12 text-center text-xs text-[#98A69C]">Loading today's tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#98A69C] space-y-2">
            <p>
              {activeTab === 'pending'
                ? 'No pending tasks for today. You are completely caught up!'
                : activeTab === 'completed'
                ? 'No tasks completed yet today. Check off your first task to earn coins!'
                : 'No tasks scheduled for today.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-[#39E58C] hover:underline font-semibold"
            >
              + Add a task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const isDone = task.status === 'COMPLETED';
              const priorityClass =
                task.priority === 'MUST_DO'
                  ? 'text-red-400 bg-red-950/30 border-red-800/40'
                  : task.priority === 'SHOULD_DO'
                  ? 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40'
                  : 'text-[#98A69C] bg-[#1B241E] border-[#27352C]';

              // Time label
              let timeLabel = '';
              if (task.scheduledStart && task.scheduledEnd) {
                const s = format(new Date(task.scheduledStart), 'h:mm a');
                const e = format(new Date(task.scheduledEnd), 'h:mm a');
                timeLabel = `${s} - ${e}`;
              } else if (task.scheduledStart) {
                timeLabel = format(new Date(task.scheduledStart), 'h:mm a');
              }

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 relative group ${
                    isDone
                      ? 'bg-[#101713]/80 border-[#27352C]/60 text-[#98A69C]'
                      : 'bg-[#1B241E] border-[#27352C] text-[#F2F7F3] hover:border-[#39E58C]/40'
                  }`}
                >
                  {/* Left: Checkbox & Titles */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTaskMutation.mutate(task.id)}
                      className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                        isDone
                          ? 'bg-[#39E58C] border-[#39E58C] text-[#0B0F0D]'
                          : 'border-[#27352C] bg-[#101713] hover:border-[#39E58C]'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold tracking-tight transition-all ${
                            isDone ? 'line-through text-[#98A69C]' : 'text-[#F2F7F3]'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${priorityClass}`}
                        >
                          {task.priority === 'MUST_DO'
                            ? 'Must'
                            : task.priority === 'SHOULD_DO'
                            ? 'Should'
                            : 'Optional'}
                        </span>

                        {/* Coin Reward Badge */}
                        <span className="text-[11px] font-mono text-[#39E58C] font-semibold flex items-center gap-0.5">
                          +{task.rewardCoins} 🪙
                        </span>

                        {/* Optional Penalty Indicator */}
                        {task.penaltyEnabled && (
                          <span
                            className="text-[10px] text-red-400 flex items-center gap-0.5"
                            title={`-${task.penaltyCoins} coins if missed`}
                          >
                            <ShieldAlert className="w-3 h-3" /> -{task.penaltyCoins}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-[#98A69C] line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Metadata: Time and Goal Point */}
                      <div className="flex items-center gap-3 text-[11px] text-[#98A69C] pt-0.5">
                        {timeLabel && (
                          <span className="flex items-center gap-1 font-mono text-[#F2F7F3]">
                            <Clock className="w-3 h-3 text-[#39E58C]" />
                            {timeLabel}
                          </span>
                        )}

                        {task.goalPoint && (
                          <span className="flex items-center gap-1 text-[#98A69C] truncate max-w-[200px]">
                            <Target className="w-3 h-3 text-[#39E58C]" />
                            <span className="truncate">{task.goalPoint.title}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions Menu */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setMenuTaskId(menuTaskId === task.id ? null : task.id)}
                      className="p-1 rounded-lg text-[#98A69C] hover:text-[#F2F7F3] hover:bg-[#101713] transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuTaskId === task.id && (
                      <div className="absolute right-0 top-7 z-30 w-44 rounded-xl border border-[#27352C] bg-[#151C17] shadow-2xl py-1 text-xs text-[#F2F7F3] animate-scale-in">
                        <button
                          type="button"
                          onClick={() => rescheduleTask(task)}
                          className="w-full px-3 py-2 text-left hover:bg-[#1B241E] flex items-center gap-2"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#39E58C]" />
                          <span>Move to Tomorrow</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateTask(task)}
                          className="w-full px-3 py-2 text-left hover:bg-[#1B241E] flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#39E58C]" />
                          <span>Duplicate Task</span>
                        </button>
                        <div className="border-t border-[#27352C] my-1" />
                        <button
                          type="button"
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="w-full px-3 py-2 text-left hover:bg-[#1B241E] text-red-400 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Task</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LEETCODE-STYLE CONTRIBUTION HEATMAP */}
      <ContributionHeatmap />

      {/* Quick Add Modal */}
      <QuickAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
