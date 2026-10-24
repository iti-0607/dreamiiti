import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Habit } from '../types/index.js';
import { Modal } from '../components/ui/Modal.js';
import { useNotification } from '../context/NotificationContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Flame,
  Plus,
  Check,
  Clock,
  Coins,
  Trash2,
  Calendar,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';

const WEEKDAYS = [
  { id: 1, short: 'Mon', label: 'Monday' },
  { id: 2, short: 'Tue', label: 'Tuesday' },
  { id: 3, short: 'Wed', label: 'Wednesday' },
  { id: 4, short: 'Thu', label: 'Thursday' },
  { id: 5, short: 'Fri', label: 'Friday' },
  { id: 6, short: 'Sat', label: 'Saturday' },
  { id: 7, short: 'Sun', label: 'Sunday' },
];

export const HabitsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('07:00');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'CUSTOM'>('DAILY');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [rewardCoins, setRewardCoins] = useState(10);
  const [penaltyEnabled, setPenaltyEnabled] = useState(false);
  const [penaltyCoins, setPenaltyCoins] = useState(5);

  const { success, error } = useNotification();
  const { updateCoinBalance } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ habits: Habit[] }>({
    queryKey: ['habits'],
    queryFn: () => api.get('/habits'),
  });

  const habits = data?.habits || [];

  const toggleMutation = useMutation({
    mutationFn: (habitId: string) => api.post(`/habits/${habitId}/toggle`, {}),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      if (res.coinsAwarded) {
        updateCoinBalance(res.coinsAwarded);
        success(`+${res.coinsAwarded} coins earned! Discipline locked in.`);
      } else if (res.isCompletedToday) {
        success('Habit completed for today!');
      } else {
        success('Habit marked incomplete');
      }
    },
    onError: (err: any) => {
      error(err.message || 'Failed to toggle habit');
    },
  });

  const createMutation = useMutation({
    mutationFn: (newHabit: any) => api.post('/habits', newHabit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      success('Habit added to your daily standards');
      closeModal();
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create habit');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (habitId: string) => api.delete(`/habits/${habitId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      success('Habit removed');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete habit');
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setScheduledTime('07:00');
    setFrequency('DAILY');
    setSelectedDays([1, 2, 3, 4, 5, 6, 7]);
    setRewardCoins(10);
    setPenaltyEnabled(false);
    setPenaltyCoins(5);
  };

  const handleFrequencyPreset = (type: 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'CUSTOM') => {
    if (type === 'DAILY') {
      setFrequency('DAILY');
      setSelectedDays([1, 2, 3, 4, 5, 6, 7]);
    } else if (type === 'WEEKDAYS') {
      setFrequency('WEEKDAYS');
      setSelectedDays([1, 2, 3, 4, 5]);
    } else if (type === 'WEEKENDS') {
      setFrequency('CUSTOM');
      setSelectedDays([6, 7]);
    } else {
      setFrequency('CUSTOM');
    }
  };

  const toggleDay = (dayId: number) => {
    setFrequency('CUSTOM');
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length === 1) return; // at least 1 day
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId].sort((a, b) => a - b));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      targetDaysPerWeek: selectedDays.length,
      selectedWeekdays: selectedDays.join(','),
      scheduledTime: scheduledTime || undefined,
      rewardCoins: Number(rewardCoins) || 10,
      penaltyCoins: penaltyEnabled ? Number(penaltyCoins) : 0,
      penaltyEnabled,
    });
  };

  // Stats
  const completedCount = habits.filter((h) => h.isCompletedToday).length;
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);
  const totalPotentialCoins = habits.reduce((sum, h) => sum + (h.rewardCoins || 10), 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#F2F7F3] tracking-tight">
              Daily Habits
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1B3024] text-[#39E58C] border border-[#27352C]">
              {habits.length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#98A69C] mt-1">
            Non-negotiable things
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] font-bold text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Habit</span>
        </button>
      </div>

      {/* Stats Quick Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-[#98A69C] uppercase tracking-wider mb-1">
            Today's Progress
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#F2F7F3]">{completedCount}</span>
            <span className="text-xs text-[#98A69C]">/ {habits.length} done</span>
          </div>
          <div className="w-full bg-[#1B241E] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#39E58C] h-full rounded-full transition-all duration-300"
              style={{
                width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-[#98A69C] uppercase tracking-wider mb-1">
            Top Active Streak
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-black text-[#F2F7F3]">{longestStreak}</span>
            <span className="text-xs text-[#98A69C]">days</span>
          </div>
          <div className="text-[11px] text-[#98A69C] mt-2">Zero excuses. Day by day.</div>
        </div>

        <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-[#98A69C] uppercase tracking-wider mb-1">
            Daily Coin Fuel
          </div>
          <div className="flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-[#39E58C]" />
            <span className="text-2xl font-black text-[#39E58C]">+{totalPotentialCoins}</span>
          </div>
          <div className="text-[11px] text-[#98A69C] mt-2">on 100% completion</div>
        </div>

        <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-[#98A69C] uppercase tracking-wider mb-1">
            Discipline Level
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-5 h-5 text-[#39E58C]" />
            <span className="text-lg font-black text-[#F2F7F3]">
              {habits.length >= 5 ? 'Elite Force' : habits.length >= 3 ? 'Warrior' : 'Initiate'}
            </span>
          </div>
          <div className="text-[11px] text-[#98A69C] mt-2">Mee</div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-12 text-center text-sm text-[#98A69C]">
            Loading your habit standards...
          </div>
        ) : habits.length === 0 ? (
          <div className="bg-[#151C17] border border-[#27352C] rounded-2xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1B3024] text-[#39E58C] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F2F7F3]">No habits set yet</h3>
              <p className="text-xs text-[#98A69C] max-w-sm mx-auto mt-1">
                True freedom is built on structure. Set your first daily standard now.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] font-bold text-xs transition"
            >
              + Create First Habit
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const isCompleted = habit.isCompletedToday;
            const activeDaysList = habit.selectedWeekdays
              ? habit.selectedWeekdays.split(',').map(Number)
              : [1, 2, 3, 4, 5, 6, 7];

            return (
              <div
                key={habit.id}
                className={`group bg-[#151C17] border rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCompleted
                  ? 'border-[#27352C] bg-[#101713]/80 opacity-90'
                  : 'border-[#27352C] hover:border-[#39E58C]/50'
                  }`}
              >
                {/* Left: Checkbox + Title Details */}
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleMutation.mutate(habit.id)}
                    className={`mt-0.5 w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-all ${isCompleted
                      ? 'bg-[#39E58C] border-[#39E58C] text-[#0B0F0D] shadow-[0_0_12px_rgba(57,229,140,0.4)]'
                      : 'border-[#27352C] bg-[#101713] text-transparent hover:border-[#39E58C]/60 hover:text-[#39E58C]/40'
                      }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm sm:text-base font-bold transition-all ${isCompleted ? 'text-[#98A69C] line-through' : 'text-[#F2F7F3]'
                          }`}
                      >
                        {habit.name}
                      </span>

                      {habit.scheduledTime && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1B241E] text-[#98A69C] border border-[#27352C]">
                          <Clock className="w-3 h-3 text-[#39E58C]" />
                          {habit.scheduledTime}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#1B3024] text-[#39E58C] border border-[#27352C]">
                        +{habit.rewardCoins || 10} coins
                      </span>

                      {habit.penaltyEnabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-950/40 text-rose-300 border border-rose-900/40">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          -{habit.penaltyCoins} penalty
                        </span>
                      )}
                    </div>

                    {habit.description && (
                      <p className="text-xs text-[#98A69C] leading-relaxed">{habit.description}</p>
                    )}

                    {/* Weekday Chips */}
                    <div className="flex items-center gap-1 pt-1">
                      {WEEKDAYS.map((day) => {
                        const isActive = activeDaysList.includes(day.id);
                        return (
                          <span
                            key={day.id}
                            className={`w-6 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-all ${isActive
                              ? 'bg-[#1B3024] text-[#39E58C] border border-[#39E58C]/30'
                              : 'bg-[#101713] text-[#4E6155] border border-transparent'
                              }`}
                          >
                            {day.short[0]}
                          </span>
                        );
                      })}
                      <span className="text-[11px] text-[#98A69C] ml-2">
                        {habit.frequency === 'DAILY'
                          ? 'Daily'
                          : habit.frequency === 'WEEKDAYS'
                            ? 'Mon-Fri'
                            : `${activeDaysList.length} days/wk`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Streak & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center pl-11 sm:pl-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101713] border border-[#27352C]">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-[#F2F7F3]">
                      {habit.currentStreak || 0}
                    </span>
                    <span className="text-[11px] text-[#98A69C]">streak</span>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${habit.name}"?`)) {
                        deleteMutation.mutate(habit.id);
                      }
                    }}
                    className="p-2 rounded-xl text-[#98A69C] hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/30 transition"
                    title="Delete habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Set a Daily Standard" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5 AM Workout, 30 Min Code, Cold Shower"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] placeholder-[#4E6155] text-sm focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
              Trigger / Anchor (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Immediately upon waking up, or before dinner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] placeholder-[#4E6155] text-sm focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
                Scheduled Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#101713] border border-[#27352C] text-[#F2F7F3] text-sm focus:outline-none focus:border-[#39E58C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
                Reward Coins
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={rewardCoins}
                  onChange={(e) => setRewardCoins(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#101713] border border-[#27352C] text-[#39E58C] font-bold text-sm focus:outline-none focus:border-[#39E58C]"
                />
                <Coins className="w-4 h-4 text-[#39E58C] absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Frequency Presets */}
          <div>
            <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
              Frequency Preset
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'DAILY', label: 'Every Day' },
                { id: 'WEEKDAYS', label: 'Weekdays' },
                { id: 'WEEKENDS', label: 'Weekends' },
                { id: 'CUSTOM', label: 'Custom' },
              ].map((preset) => {
                const isSelected =
                  preset.id === 'WEEKENDS'
                    ? selectedDays.length === 2 &&
                    selectedDays.includes(6) &&
                    selectedDays.includes(7)
                    : frequency === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleFrequencyPreset(preset.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${isSelected
                      ? 'bg-[#1B3024] text-[#39E58C] border-[#39E58C]'
                      : 'bg-[#101713] text-[#98A69C] border-[#27352C] hover:border-[#39E58C]/40'
                      }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekday Chips */}
          <div>
            <label className="block text-xs font-bold text-[#F2F7F3] uppercase tracking-wider mb-1.5">
              Active Days
            </label>
            <div className="flex items-center gap-1.5">
              {WEEKDAYS.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${isSelected
                      ? 'bg-[#1B3024] text-[#39E58C] border-[#39E58C]'
                      : 'bg-[#101713] text-[#4E6155] border-[#27352C]'
                      }`}
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Missed Penalty Toggle */}
          <div className="p-3.5 rounded-xl bg-[#101713] border border-[#27352C] space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-[#F2F7F3]">Missed Habit Penalty</span>
              <input
                type="checkbox"
                checked={penaltyEnabled}
                onChange={(e) => setPenaltyEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-[#27352C] text-[#39E58C] focus:ring-0 bg-[#0B0F0D] accent-[#39E58C]"
              />
            </label>
            {penaltyEnabled && (
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-[#98A69C]">Deduct</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={penaltyCoins}
                  onChange={(e) => setPenaltyCoins(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded-lg bg-[#0B0F0D] border border-[#27352C] text-rose-400 font-bold text-xs"
                />
                <span className="text-[#98A69C]">coins if skipped or missed</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#98A69C] hover:text-[#F2F7F3] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2 rounded-xl bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Lock In Habit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
