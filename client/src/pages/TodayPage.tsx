import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { Task } from '../types/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import {
  Sun,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Feather,
  Plus,
  Flame,
  Sprout,
  ArrowRight,
  HelpCircle,
  Check,
  ChevronRight,
  Smile,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TodayPage: React.FC = () => {
  const { user } = useAuth();
  const { success, info, error } = useNotification();
  const queryClient = useQueryClient();

  // State for Help Me Start modal
  const [selectedTaskForHelp, setSelectedTaskForHelp] = useState<Task | null>(null);
  const [helpReason, setHelpReason] = useState('too_big');
  const [helpGuidance, setHelpGuidance] = useState<any>(null);
  const [loadingHelp, setLoadingHelp] = useState(false);

  // Quick Task Input in Today view
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<'MUST_DO' | 'SHOULD_DO' | 'OPTIONAL'>('MUST_DO');

  // End of day reflection modal
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [reflectionText, setReflectionText] = useState('');

  // 1. Fetch Today's Tasks
  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => api.get('/tasks?view=today'),
  });

  // 2. Fetch Scheduled Blocks
  const { data: blocksData } = useQuery({
    queryKey: ['calendar-blocks', 'today'],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0];
      return api.get(`/calendar/blocks?startDate=${today}T00:00:00&endDate=${today}T23:59:59`);
    },
  });

  // 3. Fetch Habits for Today
  const { data: habitsData } = useQuery({
    queryKey: ['habits'],
    queryFn: () => api.get('/habits'),
  });

  // 4. Fetch Today's Wellness Check-in
  const { data: checkInData } = useQuery({
    queryKey: ['wellness-checkin-today'],
    queryFn: () => api.get('/wellness/check-in/today'),
  });

  // 5. Fetch Today's Focus Stats
  const { data: focusData } = useQuery({
    queryKey: ['focus-today'],
    queryFn: () => api.get('/focus/today'),
  });

  // Task Mutations
  const toggleTaskMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/tasks/${id}/toggle`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      if (data?.task?.status === 'COMPLETED') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#2E6F52', '#8E82B6', '#E5A93C'],
        });
        success('Task completed! Great progress.');
      }
    },
  });

  const makeLighterMutation = useMutation({
    mutationFn: () => api.post('/tasks/action/make-today-lighter'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      info(data.message || 'Today has been lightened to your Minimum Viable Day.');
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (data: { mood: string; energy: string }) =>
      api.post('/wellness/check-in', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-checkin-today'] });
      success('Daily check-in recorded.');
    },
  });

  // Time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const tasks: Task[] = tasksData?.tasks || [];
  const mustDoTasks = tasks.filter((t) => t.priority === 'MUST_DO' && t.status !== 'COMPLETED');
  const shouldDoTasks = tasks.filter((t) => t.priority === 'SHOULD_DO' && t.status !== 'COMPLETED');
  const optionalTasks = tasks.filter((t) => t.priority === 'OPTIONAL' && t.status !== 'COMPLETED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  // Top 3 Priorities: first 3 uncompleted or must-do tasks
  const topPriorities = tasks.slice(0, 3);

  // Quick Task Submission
  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    try {
      await api.post('/tasks', {
        title: quickTitle.trim(),
        priority: quickPriority,
        dueDate: new Date().toISOString(),
      });
      setQuickTitle('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Task added to today.');
    } catch (err: any) {
      error(err.message || 'Failed to add task');
    }
  };

  // Trigger Help Me Start
  const openHelpMeStart = async (task: Task) => {
    setSelectedTaskForHelp(task);
    setLoadingHelp(true);
    setHelpGuidance(null);
    try {
      const res = await api.post(`/tasks/${task.id}/help-me-start`, { reason: helpReason });
      setHelpGuidance(res);
    } catch {
      // Fallback
    } finally {
      setLoadingHelp(false);
    }
  };

  const handleReasonChange = async (reason: string) => {
    if (!selectedTaskForHelp) return;
    setHelpReason(reason);
    setLoadingHelp(true);
    try {
      const res = await api.post(`/tasks/${selectedTaskForHelp.id}/help-me-start`, { reason });
      setHelpGuidance(res);
    } finally {
      setLoadingHelp(false);
    }
  };

  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) return;
    try {
      await api.post('/wellness/journal', {
        content: reflectionText.trim(),
        prompt: 'Daily Evening Reflection: What felt manageable today?',
        tags: 'EveningReflection, DailyGrowth',
      });
      success('Reflection saved to your private journal.');
      setIsReflectionOpen(false);
      setReflectionText('');
    } catch (err: any) {
      error(err.message || 'Failed to save reflection');
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-charcoal-200/80 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sage-700 mb-1">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>{getGreeting()}, {user?.name || 'Dreamer'}</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight">
            "Progress over perfection. Show up today at your own pace."
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Focus on your top priorities. If today feels heavy, simplify without guilt.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<Feather className="w-3.5 h-3.5 text-sage-600" />}
            onClick={() => makeLighterMutation.mutate()}
            loading={makeLighterMutation.isPending}
            title="Postpone non-essential tasks to tomorrow and keep only the minimum viable day"
          >
            Make Today Lighter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReflectionOpen(true)}
          >
            Reflect
          </Button>
        </div>
      </div>

      {/* Optional Quick Daily Check-in */}
      {!checkInData?.checkIn && (
        <div className="bg-sage-50/60 border border-sage-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-sage-900 font-semibold">
            <Smile className="w-4 h-4 text-sage-700" />
            <span>How is your energy feeling today?</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { mood: 'great', energy: 'high', label: 'Energized ⚡' },
              { mood: 'good', energy: 'medium', label: 'Steady & Calm 🌿' },
              { mood: 'neutral', energy: 'medium', label: 'Okay / Neutral ☁️' },
              { mood: 'low', energy: 'low', label: 'Tired / Gentle Day 🕊️' },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => checkInMutation.mutate({ mood: opt.mood, energy: opt.energy })}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-sage-100 text-charcoal-800 border border-sage-200/60 font-medium transition-all shadow-sm"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Priority Action Center + Sidebar Timetable & Garden */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priorities & Task List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 3 Priorities Card */}
          <Card className="border-sage-200/80 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sage-600" />
                <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                  Top Daily Priorities
                </h2>
              </div>
              <span className="text-xs text-charcoal-500">
                {completedTasks.length} of {tasks.length} tasks completed
              </span>
            </div>

            {topPriorities.length === 0 ? (
              <div className="text-center py-6 text-charcoal-400 text-xs">
                No priorities scheduled for today. Add a task below to begin!
              </div>
            ) : (
              <div className="space-y-2.5">
                {topPriorities.map((task) => {
                  const isDone = task.status === 'COMPLETED';
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-50/40 border-emerald-200 text-charcoal-400'
                          : 'bg-ivory-50/40 border-charcoal-200/80 hover:bg-white text-charcoal-800 shadow-soft'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTaskMutation.mutate(task.id)}
                          className="text-sage-600 hover:scale-110 transition-transform shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-charcoal-300 hover:text-sage-600" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-semibold truncate ${
                              isDone ? 'line-through text-charcoal-400' : 'text-charcoal-900'
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-charcoal-500 mt-0.5">
                            {task.goal?.title && (
                              <span className="truncate max-w-[200px]">
                                {task.goal.title}
                              </span>
                            )}
                            <span>• {task.estimatedMinutes}m</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isDone && (
                          <button
                            onClick={() => openHelpMeStart(task)}
                            className="text-xs text-sage-700 hover:text-sage-900 bg-sage-50 hover:bg-sage-100 px-2.5 py-1 rounded-lg border border-sage-200 flex items-center gap-1 font-medium"
                            title="Help me start: get a 5-minute doorway action"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                            <span>Help me start</span>
                          </button>
                        )}
                        <Badge
                          variant={
                            task.priority === 'MUST_DO'
                              ? 'sage'
                              : task.priority === 'SHOULD_DO'
                              ? 'amber'
                              : 'charcoal'
                          }
                          size="sm"
                        >
                          {task.priority === 'MUST_DO'
                            ? 'Must-Do'
                            : task.priority === 'SHOULD_DO'
                            ? 'Should-Do'
                            : 'Optional'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Add Task Row */}
          <form
            onSubmit={handleQuickAddTask}
            className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-charcoal-200/80 shadow-soft"
          >
            <input
              type="text"
              placeholder="+ Add a task to today's schedule..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm focus:outline-none placeholder:text-charcoal-400"
            />
            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as any)}
              className="text-xs bg-ivory-100 border border-charcoal-200 rounded-lg px-2.5 py-1.5 text-charcoal-700 focus:outline-none"
            >
              <option value="MUST_DO">Must-Do</option>
              <option value="SHOULD_DO">Should-Do</option>
              <option value="OPTIONAL">Optional</option>
            </select>
            <Button size="sm" variant="primary" type="submit" disabled={!quickTitle.trim()}>
              Add
            </Button>
          </form>

          {/* Full Task Breakdown by Sections */}
          <div className="space-y-4">
            {/* Must-Do Section */}
            {mustDoTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">
                  <span>Must-Do Essentials ({mustDoTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {mustDoTasks.map((t) => (
                    <TaskItemRow
                      key={t.id}
                      task={t}
                      onToggle={() => toggleTaskMutation.mutate(t.id)}
                      onHelp={() => openHelpMeStart(t)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Should-Do Section */}
            {shouldDoTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                  <span>Should-Do Actions ({shouldDoTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {shouldDoTasks.map((t) => (
                    <TaskItemRow
                      key={t.id}
                      task={t}
                      onToggle={() => toggleTaskMutation.mutate(t.id)}
                      onHelp={() => openHelpMeStart(t)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Optional Section */}
            {optionalTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-2">
                  <span>Optional / If Energy Allows ({optionalTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {optionalTasks.map((t) => (
                    <TaskItemRow
                      key={t.id}
                      task={t}
                      onToggle={() => toggleTaskMutation.mutate(t.id)}
                      onHelp={() => openHelpMeStart(t)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Section */}
            {completedTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  <span>Completed Today ({completedTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {completedTasks.map((t) => (
                    <TaskItemRow
                      key={t.id}
                      task={t}
                      onToggle={() => toggleTaskMutation.mutate(t.id)}
                      onHelp={() => openHelpMeStart(t)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Timetable Preview & Habits */}
        <div className="space-y-6">
          {/* Progress Summary Ring & Stats */}
          <Card>
            <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-3">
              Daily Momentum
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-ivory-100 rounded-xl">
                <div className="text-xl font-extrabold text-sage-800">
                  {completedTasks.length}
                </div>
                <div className="text-[10px] text-charcoal-500 font-medium">Tasks Done</div>
              </div>
              <div className="p-3 bg-ivory-100 rounded-xl">
                <div className="text-xl font-extrabold text-lavender-700">
                  {focusData?.stats?.totalMinutes || 0}m
                </div>
                <div className="text-[10px] text-charcoal-500 font-medium">Focus Time</div>
              </div>
              <div className="p-3 bg-ivory-100 rounded-xl">
                <div className="text-xl font-extrabold text-amber-600">
                  {habitsData?.habits?.filter((h: any) => h.isCompletedToday).length || 0}
                </div>
                <div className="text-[10px] text-charcoal-500 font-medium">Habits Checked</div>
              </div>
            </div>
          </Card>

          {/* Today's Timetable Preview */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-sage-600" />
                <span>Today's Schedule</span>
              </div>
              <span className="text-[11px] text-charcoal-400">
                {blocksData?.blocks?.length || 0} blocks
              </span>
            </div>

            {blocksData?.blocks?.length === 0 ? (
              <div className="py-6 text-center text-xs text-charcoal-400">
                No blocks scheduled for today. Use "+ Add Action" to time-block your focus.
              </div>
            ) : (
              <div className="space-y-2">
                {blocksData?.blocks?.map((block: any) => {
                  const startStr = new Date(block.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const endStr = new Date(block.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={block.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        block.isBreak
                          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                          : 'bg-sage-50/60 border-sage-200 text-sage-900'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="font-semibold truncate">{block.title}</div>
                        <div className="text-[10px] opacity-75">
                          {startStr} – {endStr}
                        </div>
                      </div>
                      {block.isBreak && (
                        <span className="text-[10px] bg-amber-200/60 text-amber-800 px-1.5 py-0.5 rounded font-medium shrink-0">
                          Break
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Habit Garden Today Checklist */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>Habit Garden Today</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                Rest days protected
              </span>
            </div>

            <div className="space-y-2">
              {habitsData?.habits?.map((habit: any) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-charcoal-200/80 bg-ivory-50/40 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      type="button"
                      onClick={async () => {
                        await api.post(`/habits/${habit.id}/toggle`, {});
                        queryClient.invalidateQueries({ queryKey: ['habits'] });
                        success(`Habit logged!`);
                      }}
                      className="text-emerald-600 shrink-0"
                    >
                      {habit.isCompletedToday ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-charcoal-300 hover:text-emerald-600" />
                      )}
                    </button>
                    <span
                      className={`truncate font-medium ${
                        habit.isCompletedToday ? 'line-through text-charcoal-400' : 'text-charcoal-800'
                      }`}
                    >
                      {habit.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                    🔥 {habit.currentStreak}d
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* "Help Me Start" Anti-Procrastination Modal */}
      <Modal
        isOpen={!!selectedTaskForHelp}
        onClose={() => setSelectedTaskForHelp(null)}
        title="Anti-Procrastination Doorway"
        maxWidth="md"
      >
        {selectedTaskForHelp && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-ivory-100 rounded-xl text-charcoal-800 font-medium">
              Task: <span className="font-bold">{selectedTaskForHelp.title}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-2">
                What is making this difficult to start right now?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'too_big', label: 'Feels too big / overwhelming' },
                  { id: 'dont_know_start', label: 'Do not know where to start' },
                  { id: 'distracted', label: 'Scattered or distracted' },
                  { id: 'low_energy', label: 'Very low energy right now' },
                  { id: 'fear_badly', label: 'Worried about doing it badly' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleReasonChange(opt.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      helpReason === opt.id
                        ? 'bg-sage-100 border-sage-500 font-bold text-sage-900'
                        : 'bg-white border-charcoal-200 text-charcoal-700 hover:bg-ivory-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingHelp ? (
              <div className="py-6 text-center text-charcoal-400">
                Finding the smallest doorway step...
              </div>
            ) : helpGuidance ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200 text-sage-900 leading-relaxed">
                  <div className="font-bold mb-1">Perspective Shift:</div>
                  <p>{helpGuidance.guidance}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Your 5-Minute Doorway Action:</span>
                  </div>
                  <p className="font-semibold text-sm">{helpGuidance.microStep}</p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-3">
              <Button
                variant="primary"
                onClick={() => setSelectedTaskForHelp(null)}
              >
                I'll Take This First Step
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* End of Day Reflection Modal */}
      <Modal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        title="Gentle End-of-Day Reflection"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-charcoal-600 leading-relaxed">
            Take two quiet minutes before disconnecting. What felt manageable today? What friction
            can you let go of?
          </p>

          <textarea
            rows={4}
            placeholder="Today, I noticed that... Tomorrow, I will keep things simple by..."
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="w-full p-3 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsReflectionOpen(false)}>
              Skip
            </Button>
            <Button variant="primary" onClick={handleSaveReflection}>
              Save to Journal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Sub-component for individual Task Row
const TaskItemRow: React.FC<{ task: Task; onToggle: () => void; onHelp: () => void }> = ({
  task,
  onToggle,
  onHelp,
}) => {
  const isDone = task.status === 'COMPLETED';

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        isDone
          ? 'bg-emerald-50/30 border-emerald-200 text-charcoal-400'
          : 'bg-white border-charcoal-200 hover:shadow-soft text-charcoal-800'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggle}
          className="text-sage-600 hover:scale-110 transition-transform shrink-0"
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <Circle className="w-4 h-4 text-charcoal-300 hover:text-sage-600" />
          )}
        </button>
        <div className="min-w-0">
          <span
            className={`text-sm font-medium truncate ${
              isDone ? 'line-through text-charcoal-400' : 'text-charcoal-900'
            }`}
          >
            {task.title}
          </span>
          {task.goal?.title && (
            <div className="text-[11px] text-charcoal-400 truncate">
              {task.goal.title}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isDone && (
          <button
            onClick={onHelp}
            className="p-1 rounded text-charcoal-400 hover:text-sage-700 hover:bg-sage-50 transition-colors"
            title="Help me start"
          >
            <Sparkles className="w-4 h-4 text-sage-600" />
          </button>
        )}
        <span className="text-[11px] text-charcoal-500 font-medium">
          {task.estimatedMinutes}m
        </span>
      </div>
    </div>
  );
};
