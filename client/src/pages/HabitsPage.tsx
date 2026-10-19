import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Habit } from '../types/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  Sprout,
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  Sparkles,
  Pause,
  Play,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HabitsPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('DAILY');
  const [targetDays, setTargetDays] = useState(7);
  const [category, setCategory] = useState('Routine');

  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => api.get('/habits'),
  });

  const toggleMutation = useMutation({
    mutationFn: (habitId: string) => api.post(`/habits/${habitId}/toggle`, {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      if (res.isCompletedToday) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#3B7A57', '#E5A93C', '#8E82B6'],
        });
        success('Habit logged! Roots growing deeper.');
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (newHabit: any) => api.post('/habits', newHabit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      success('Habit seed planted in your garden!');
      setIsCreateOpen(false);
      setName('');
      setDescription('');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to plant habit');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      targetDaysPerWeek: Number(targetDays),
      category,
    });
  };

  const habits: Habit[] = data?.habits || [];

  const getPlantVisual = (stage: string) => {
    switch (stage) {
      case 'FOREST':
        return { icon: '🌲', label: 'Resilient Forest (30+ days)', color: 'text-emerald-800' };
      case 'BLOOM':
        return { icon: '🌸', label: 'Blooming Plant (14+ days)', color: 'text-rose-600' };
      case 'BUD':
        return { icon: '🌿', label: 'Budding Stem (7+ days)', color: 'text-emerald-600' };
      case 'SPROUT':
        return { icon: '🌱', label: 'Sprouting Leaf (3+ days)', color: 'text-sage-600' };
      default:
        return { icon: '🪴', label: 'Planted Seed', color: 'text-amber-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            <span>Habit Garden</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Compassionate habit formation. Rest days are protected and never reset your streak.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Plant New Habit
        </Button>
      </div>

      {/* Compassionate Garden Philosophy Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>
            <strong>Gentle Streak Guarantee:</strong> If your habit is scheduled for weekdays,
            weekends are recognized as restorative rest. Your streak remains completely safe.
          </span>
        </div>
      </div>

      {/* Garden Visual Canvas */}
      <Card className="garden-card border-emerald-200/80 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
              Visual Garden Flora ({habits.length} plants)
            </h2>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
            Nurturing Consistency
          </span>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-10 text-charcoal-400 text-xs">
            Your garden plot is clear. Plant a daily or weekday habit to start watching it grow.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {habits.map((habit) => {
              const plant = getPlantVisual(habit.plantStage);
              return (
                <div
                  key={habit.id}
                  className="p-5 rounded-2xl bg-white/95 border border-charcoal-200/80 shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{plant.icon}</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        🔥 {habit.currentStreak}d streak
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-charcoal-900 mb-1">{habit.name}</h3>
                    <p className="text-xs text-charcoal-500 mb-3">{plant.label}</p>
                  </div>

                  <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between">
                    <span className="text-[11px] text-charcoal-400 font-medium capitalize">
                      {habit.frequency.toLowerCase()}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate(habit.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                        habit.isCompletedToday
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-sage-600 hover:bg-sage-700 text-white'
                      }`}
                    >
                      {habit.isCompletedToday ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Checked Today
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5" /> Check In
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Habits Table / List */}
      <Card className="p-6">
        <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-4">
          All Active Habits & History
        </h3>

        <div className="space-y-3">
          {habits.map((h) => (
            <div
              key={h.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-charcoal-200/80 bg-white hover:bg-ivory-50/40 gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleMutation.mutate(h.id)}
                  className="text-emerald-600 shrink-0"
                >
                  {h.isCompletedToday ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-charcoal-300 hover:text-emerald-600" />
                  )}
                </button>
                <div>
                  <div className="font-bold text-charcoal-900">{h.name}</div>
                  <div className="text-[11px] text-charcoal-500">
                    Category: {h.category} • Best Streak: {h.bestStreak} days
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <Badge variant="sage" size="sm">
                  {h.frequency}
                </Badge>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {h.currentStreak} Days
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Plant Habit Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Plant a New Habit"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 15-Minute Evening Reading or Morning Stretch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
            >
              <option value="Health">Health & Body</option>
              <option value="Focus">Focus & Learning</option>
              <option value="Creativity">Creativity & Music</option>
              <option value="Routine">Daily Routine & Peace</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              >
                <option value="DAILY">Every Day</option>
                <option value="WEEKDAYS">Weekdays (Mon-Fri)</option>
                <option value="WEEKLY">3-4 Times / Week</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Target Days/Week
              </label>
              <input
                type="number"
                min={1}
                max={7}
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={createMutation.isPending}>
              Plant Habit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
