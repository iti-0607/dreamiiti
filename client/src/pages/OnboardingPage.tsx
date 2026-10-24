import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, Sparkles, Clock, Calendar, Coins, ShieldAlert } from 'lucide-react';

interface GoalPointItem {
  title: string;
  description?: string;
  targetDate?: string;
}

interface HabitItem {
  name: string;
  description?: string;
  scheduledTime?: string;
  frequency: string;
  selectedWeekdays?: string;
  rewardCoins: number;
  penaltyCoins: number;
  penaltyEnabled: boolean;
}

const WEEKDAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 7, label: 'Sun' },
];

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Life purpose
  const [lifePurpose, setLifePurpose] = useState('');

  // Step 2: Six-month goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  // Step 3: Goal Points
  const [points, setPoints] = useState<GoalPointItem[]>([
    { title: '' },
  ]);

  // Step 4: Daily Habits
  const [habits, setHabits] = useState<HabitItem[]>([
    {
      name: '',
      description: '',
      scheduledTime: '',
      frequency: 'DAILY',
      selectedWeekdays: '1,2,3,4,5,6,7',
      rewardCoins: 5,
      penaltyCoins: 0,
      penaltyEnabled: false,
    },
  ]);

  const { completeOnboarding } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  // Point management
  const addPoint = () => setPoints([...points, { title: '' }]);
  const removePoint = (idx: number) => setPoints(points.filter((_, i) => i !== idx));
  const updatePoint = (idx: number, field: keyof GoalPointItem, val: string) => {
    const updated = [...points];
    updated[idx] = { ...updated[idx], [field]: val };
    setPoints(updated);
  };

  // Habit management
  const addHabit = () =>
    setHabits([
      ...habits,
      {
        name: '',
        description: '',
        scheduledTime: '',
        frequency: 'DAILY',
        selectedWeekdays: '1,2,3,4,5,6,7',
        rewardCoins: 5,
        penaltyCoins: 0,
        penaltyEnabled: false,
      },
    ]);
  const removeHabit = (idx: number) => setHabits(habits.filter((_, i) => i !== idx));
  const updateHabit = (idx: number, field: keyof HabitItem, val: any) => {
    const updated = [...habits];
    updated[idx] = { ...updated[idx], [field]: val };
    setHabits(updated);
  };

  const setHabitShortcut = (idx: number, type: 'daily' | 'weekdays' | 'weekends') => {
    if (type === 'daily') {
      updateHabit(idx, 'frequency', 'DAILY');
      updateHabit(idx, 'selectedWeekdays', '1,2,3,4,5,6,7');
    } else if (type === 'weekdays') {
      updateHabit(idx, 'frequency', 'WEEKDAYS');
      updateHabit(idx, 'selectedWeekdays', '1,2,3,4,5');
    } else if (type === 'weekends') {
      updateHabit(idx, 'frequency', 'CUSTOM');
      updateHabit(idx, 'selectedWeekdays', '6,7');
    }
  };

  const toggleHabitDay = (idx: number, dayId: number) => {
    const currentDays = (habits[idx].selectedWeekdays || '')
      .split(',')
      .filter(Boolean)
      .map(Number);
    let newDays: number[];
    if (currentDays.includes(dayId)) {
      newDays = currentDays.filter((d) => d !== dayId);
    } else {
      newDays = [...currentDays, dayId].sort();
    }
    updateHabit(idx, 'frequency', 'CUSTOM');
    updateHabit(idx, 'selectedWeekdays', newDays.join(','));
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const validPoints = points.filter((p) => p.title.trim().length > 0);
      const validHabits = habits.filter((h) => h.name.trim().length > 0);

      await completeOnboarding({
        lifePurpose,
        sixMonthGoal: {
          title: goalTitle,
          description: goalDesc,
          targetDate: goalTargetDate || undefined,
        },
        goalPoints: validPoints,
        habits: validHabits,
      });

      success('Welcome to your discipline dashboard!');
      navigate('/app/dashboard');
    } catch (err: any) {
      error(err.message || 'Failed to complete setup');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-[#F2F7F3] flex flex-col selection:bg-[#1B3024] selection:text-[#39E58C]">
      {/* Top Header */}
      <header className="border-b border-[#27352C] bg-[#101713] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-extrabold text-xl tracking-tight text-[#F2F7F3]">
            Dream<span className="text-[#39E58C]">IITi</span>
          </span>
          <div className="text-xs font-semibold text-[#98A69C]">
            Step <span className="text-[#39E58C]">{step}</span> of 5
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-[#1B241E] h-1.5">
        <div
          className="bg-[#39E58C] h-1.5 transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[#151C17] rounded-2xl border border-[#27352C] p-8 sm:p-10 shadow-2xl">
          {/* STEP 1: ULTIMATE LIFE PURPOSE */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C]">
                  Step 1 · The Long View
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F2F7F3] mt-1">
                  What do you ultimately want from this one life?
                </h2>
                <p className="text-sm text-[#98A69C] mt-2 leading-relaxed">
                  Describe your dreams, ambitions, motivations, and the kind of person you want to become. Write freely. This is your personal space.
                </p>
              </div>

              <textarea
                rows={8}
                value={lifePurpose}
                onChange={(e) => setLifePurpose(e.target.value)}
                placeholder="Write honestly about what drives you, the standard you hold yourself to, your financial ambitions, mastery, and who you intend to become..."
                className="w-full px-4 py-3 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C] focus:ring-1 focus:ring-[#39E58C] leading-relaxed resize-y"
              />

              <div className="flex justify-end pt-4 border-t border-[#27352C]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#39E58C] text-[#0B0F0D] hover:bg-[#26C978] transition-colors flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SIX-MONTH GOAL */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C]">
                  Step 2 · Near Horizon
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F2F7F3] mt-1">
                  Where do you want to be six months from now?
                </h2>
                <p className="text-sm text-[#98A69C] mt-2 leading-relaxed">
                  Define your single highest-leverage outcome for the next 180 days.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#98A69C] mb-1.5">
                    Goal Title (Required)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Distributed Systems & Build a World-Class Portfolio Project"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C] focus:ring-1 focus:ring-[#39E58C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#98A69C] mb-1.5">
                    Description & Success Criteria (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe how your life will look when this is done, and what concrete criteria mark completion..."
                    value={goalDesc}
                    onChange={(e) => setGoalDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C] focus:ring-1 focus:ring-[#39E58C] resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#98A69C] mb-1.5">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] focus:outline-none focus:border-[#39E58C] focus:ring-1 focus:ring-[#39E58C]"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#27352C]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#27352C] text-[#98A69C] hover:text-[#F2F7F3] hover:border-[#39E58C] transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!goalTitle.trim()}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#39E58C] text-[#0B0F0D] hover:bg-[#26C978] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: USER-OWNED POINTS */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C]">
                  Step 3 · Breakdown
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F2F7F3] mt-1">
                  What do you want to accomplish to reach this goal?
                </h2>
                <p className="text-sm text-[#98A69C] mt-2 leading-relaxed">
                  Break your goal into concrete milestones that you control. Add as many as you need.
                </p>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#27352C] bg-[#1B241E] space-y-2 relative group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-[#101713] text-[#39E58C] text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Build core streaming engine with Redis"
                        value={pt.title}
                        onChange={(e) => updatePoint(idx, 'title', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#27352C] bg-[#101713] text-sm text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C]"
                      />
                      {points.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePoint(idx)}
                          className="text-[#98A69C] hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Optional notes or target date..."
                      value={pt.description || ''}
                      onChange={(e) => updatePoint(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1 rounded-lg border border-[#27352C] bg-[#101713] text-xs text-[#98A69C] placeholder-[#98A69C]/40 focus:outline-none focus:border-[#39E58C]"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addPoint}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#27352C] hover:border-[#39E58C] text-[#39E58C] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Another Point
              </button>

              <div className="flex justify-between items-center pt-4 border-t border-[#27352C]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#27352C] text-[#98A69C] hover:text-[#F2F7F3] hover:border-[#39E58C] transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#39E58C] text-[#0B0F0D] hover:bg-[#26C978] transition-colors flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DAILY HABITS */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C]">
                  Step 4 · Daily Rhythms
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F2F7F3] mt-1">
                  Which habits do you want to build into your everyday life?
                </h2>
                <p className="text-sm text-[#98A69C] mt-2 leading-relaxed">
                  Configure recurring habits, preferred days, and optional reward coins. You can also skip this and add them later.
                </p>
              </div>

              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {habits.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#27352C] bg-[#1B241E] space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="e.g. 45 min deep technical reading"
                        value={h.name}
                        onChange={(e) => updateHabit(idx, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#27352C] bg-[#101713] text-sm text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C]"
                      />
                      {habits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHabit(idx)}
                          className="text-[#98A69C] hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Shortcuts */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[#98A69C] mr-1">Repeat:</span>
                      <button
                        type="button"
                        onClick={() => setHabitShortcut(idx, 'daily')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          h.frequency === 'DAILY'
                            ? 'bg-[#1B3024] text-[#39E58C] border-[#39E58C]'
                            : 'border-[#27352C] text-[#98A69C] hover:border-[#98A69C]'
                        }`}
                      >
                        Every day
                      </button>
                      <button
                        type="button"
                        onClick={() => setHabitShortcut(idx, 'weekdays')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          h.frequency === 'WEEKDAYS'
                            ? 'bg-[#1B3024] text-[#39E58C] border-[#39E58C]'
                            : 'border-[#27352C] text-[#98A69C] hover:border-[#98A69C]'
                        }`}
                      >
                        Weekdays
                      </button>
                      <button
                        type="button"
                        onClick={() => setHabitShortcut(idx, 'weekends')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          h.selectedWeekdays === '6,7'
                            ? 'bg-[#1B3024] text-[#39E58C] border-[#39E58C]'
                            : 'border-[#27352C] text-[#98A69C] hover:border-[#98A69C]'
                        }`}
                      >
                        Weekends
                      </button>
                    </div>

                    {/* Day selection chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {WEEKDAYS.map((d) => {
                        const isSelected = (h.selectedWeekdays || '')
                          .split(',')
                          .map(Number)
                          .includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleHabitDay(idx, d.id)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[#39E58C] text-[#0B0F0D]'
                                : 'bg-[#101713] text-[#98A69C] border border-[#27352C] hover:border-[#98A69C]'
                            }`}
                          >
                            {d.label[0]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Time & Coins */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] text-[#98A69C] mb-1">Time (Optional)</label>
                        <input
                          type="time"
                          value={h.scheduledTime || ''}
                          onChange={(e) => updateHabit(idx, 'scheduledTime', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#27352C] bg-[#101713] text-xs text-[#F2F7F3]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#98A69C] mb-1">Reward Coins</label>
                        <input
                          type="number"
                          min={0}
                          value={h.rewardCoins}
                          onChange={(e) => updateHabit(idx, 'rewardCoins', parseInt(e.target.value, 10) || 0)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#27352C] bg-[#101713] text-xs text-[#F2F7F3]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addHabit}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#27352C] hover:border-[#39E58C] text-[#39E58C] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Another Habit
              </button>

              <div className="flex justify-between items-center pt-4 border-t border-[#27352C]">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#27352C] text-[#98A69C] hover:text-[#F2F7F3] hover:border-[#39E58C] transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#39E58C] text-[#0B0F0D] hover:bg-[#26C978] transition-colors flex items-center gap-2"
                >
                  Review & Confirm <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: FINISH SETUP (SUMMARY) */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C]">
                  Step 5 · Final Confirmation
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F2F7F3] mt-1">
                  Ready to show up for your future?
                </h2>
                <p className="text-sm text-[#98A69C] mt-2 leading-relaxed">
                  Review the vision and commitments you personally entered. Everything can be updated anytime under Settings.
                </p>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {/* Life Purpose Summary */}
                <div className="p-4 rounded-xl border border-[#27352C] bg-[#1B241E]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C]">
                      Ultimate Life Purpose
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-[#39E58C] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-[#F2F7F3] leading-relaxed italic whitespace-pre-wrap">
                    "{lifePurpose || 'No life purpose entered.'}"
                  </p>
                </div>

                {/* Six-Month Goal Summary */}
                <div className="p-4 rounded-xl border border-[#27352C] bg-[#1B241E]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C]">
                      Six-Month Goal
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-[#39E58C] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-[#F2F7F3]">{goalTitle}</h4>
                  {goalDesc && <p className="text-xs text-[#98A69C] mt-1">{goalDesc}</p>}
                </div>

                {/* Goal Points Summary */}
                <div className="p-4 rounded-xl border border-[#27352C] bg-[#1B241E]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C]">
                      Goal Points ({points.filter((p) => p.title.trim()).length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-xs text-[#39E58C] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#F2F7F3]">
                    {points
                      .filter((p) => p.title.trim())
                      .map((p, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#39E58C]" />
                          <span>{p.title}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Habits Summary */}
                <div className="p-4 rounded-xl border border-[#27352C] bg-[#1B241E]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C]">
                      Daily Habits ({habits.filter((h) => h.name.trim()).length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="text-xs text-[#39E58C] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#F2F7F3]">
                    {habits
                      .filter((h) => h.name.trim())
                      .map((h, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#39E58C]"></span>
                            <span>{h.name}</span>
                          </span>
                          <span className="text-[11px] text-[#39E58C] font-mono">
                            +{h.rewardCoins} 🪙
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#27352C]">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#27352C] text-[#98A69C] hover:text-[#F2F7F3] hover:border-[#39E58C] transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleFinish}
                  className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-[#39E58C] text-[#0B0F0D] hover:bg-[#26C978] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Enter Dashboard'} <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
