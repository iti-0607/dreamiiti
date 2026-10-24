import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Task } from '../types/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronRight,
  ListPlus,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TasksPage: React.FC = () => {
  const [view, setView] = useState<'today' | 'upcoming' | 'overdue' | 'all' | 'completed' | 'unscheduled'>('all');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Subtask accordion expansion
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});

  // Help Me Start
  const [selectedTaskForHelp, setSelectedTaskForHelp] = useState<Task | null>(null);
  const [helpReason, setHelpReason] = useState('too_big');
  const [helpGuidance, setHelpGuidance] = useState<any>(null);
  const [loadingHelp, setLoadingHelp] = useState(false);

  // Quick Add Task Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('SHOULD_DO');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMinutes, setNewMinutes] = useState(30);

  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', { view, priority: priorityFilter, search }],
    queryFn: () => api.get(`/tasks?view=${view}&priority=${priorityFilter}&search=${search}`),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/tasks/${id}/toggle`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
      if (res?.task?.status === 'COMPLETED') {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
        success('Task completed!');
      }
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Task deleted.');
    },
  });

  const addSubtaskMutation = useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      api.post(`/tasks/${taskId}/subtasks`, { title }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewSubtaskInputs((prev) => ({ ...prev, [vars.taskId]: '' }));
    },
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: (subtaskId: string) => api.patch(`/tasks/subtasks/${subtaskId}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.post('/tasks', {
        title: newTitle.trim(),
        priority: newPriority,
        dueDate: newDueDate || null,
        estimatedMinutes: Number(newMinutes),
      });
      success('Task added.');
      setIsAddOpen(false);
      setNewTitle('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err: any) {
      error(err.message || 'Failed to create task');
    }
  };

  const openHelp = async (task: Task) => {
    setSelectedTaskForHelp(task);
    setLoadingHelp(true);
    setHelpGuidance(null);
    try {
      const res = await api.post(`/tasks/${task.id}/help-me-start`, { reason: helpReason });
      setHelpGuidance(res);
    } finally {
      setLoadingHelp(false);
    }
  };

  const handleHelpReasonChange = async (reason: string) => {
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

  const tasks: Task[] = data?.tasks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-sage-600" />
            <span>Task Management</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Organize actions, nested subtask checklists, and doorway steps.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddOpen(true)}
        >
          Add Task
        </Button>
      </div>

      {/* View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-charcoal-200/80 shadow-soft">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'today', label: 'Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
            { id: 'unscheduled', label: 'Unscheduled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                view === tab.id
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-ivory-100 border border-charcoal-200 rounded-xl px-2.5 py-1.5 text-charcoal-700 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="MUST_DO">Must-Do</option>
            <option value="SHOULD_DO">Should-Do</option>
            <option value="OPTIONAL">Optional</option>
          </select>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-charcoal-200 focus:outline-none w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="text-center py-12 text-charcoal-400 text-xs">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center mx-auto mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-charcoal-900 mb-1">Your plan, your pace</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-4">
            Your plan, your pace. Add the tasks you want to work on.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
            Add Task
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isDone = task.status === 'COMPLETED';
            const isExpanded = !!expandedTasks[task.id];
            const subtasks = task.subtaskItems || [];

            return (
              <Card
                key={task.id}
                className={`p-4 transition-all ${
                  isDone ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-charcoal-200/80 shadow-soft'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTaskMutation.mutate(task.id)}
                      className="mt-0.5 text-sage-600 hover:scale-110 transition-transform shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-charcoal-300 hover:text-sage-600" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-bold truncate ${
                            isDone ? 'line-through text-charcoal-400' : 'text-charcoal-900'
                          }`}
                        >
                          {task.title}
                        </span>
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

                      <div className="flex items-center gap-3 text-[11px] text-charcoal-500 mt-1 flex-wrap">
                        {task.goal?.title && (
                          <span className="text-sage-700 font-medium truncate max-w-[200px]">
                            Goal: {task.goal.title}
                          </span>
                        )}
                        {task.dueDate && (
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                        <span>Est: {task.estimatedMinutes}m</span>
                        {task.actualMinutes > 0 && <span>Actual: {task.actualMinutes}m</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isDone && (
                      <button
                        onClick={() => openHelp(task)}
                        className="text-xs text-sage-700 hover:text-sage-900 bg-sage-50 hover:bg-sage-100 px-2.5 py-1 rounded-lg border border-sage-200 flex items-center gap-1 font-medium"
                        title="Help me start: get a 5-minute doorway action"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                        <span className="hidden sm:inline">Help me start</span>
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 transition-colors"
                      title="Subtasks checklist"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                      className="p-1 rounded-lg text-charcoal-300 hover:text-rose-600 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks Accordion */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-charcoal-100 space-y-2 text-xs pl-8">
                    <div className="font-semibold text-charcoal-600">
                      Subtask Checklist ({subtasks.filter((s) => s.isCompleted).length}/{subtasks.length})
                    </div>

                    <div className="space-y-1.5">
                      {subtasks.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-2 text-charcoal-700">
                          <button
                            type="button"
                            onClick={() => toggleSubtaskMutation.mutate(sub.id)}
                            className="text-sage-600"
                          >
                            {sub.isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-charcoal-300" />
                            )}
                          </button>
                          <span className={sub.isCompleted ? 'line-through text-charcoal-400' : ''}>
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add subtask inline input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="+ Add subtask..."
                        value={newSubtaskInputs[task.id] || ''}
                        onChange={(e) =>
                          setNewSubtaskInputs((prev) => ({
                            ...prev,
                            [task.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newSubtaskInputs[task.id]?.trim()) {
                            addSubtaskMutation.mutate({
                              taskId: task.id,
                              title: newSubtaskInputs[task.id].trim(),
                            });
                          }
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg border border-charcoal-200 focus:outline-none w-full max-w-xs"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (newSubtaskInputs[task.id]?.trim()) {
                            addSubtaskMutation.mutate({
                              taskId: task.id,
                              title: newSubtaskInputs[task.id].trim(),
                            });
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Task"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Write integration test suite"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              >
                <option value="MUST_DO">Must-Do</option>
                <option value="SHOULD_DO">Should-Do</option>
                <option value="OPTIONAL">Optional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Est. Duration
              </label>
              <input
                type="number"
                min={5}
                max={240}
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Help Me Start Modal */}
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
                    onClick={() => handleHelpReasonChange(opt.id)}
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
    </div>
  );
};
