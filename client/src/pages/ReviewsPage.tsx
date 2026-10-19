import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { WeeklyReview } from '../types/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'history'>('weekly');

  // Form State for Weekly Review
  const [wins, setWins] = useState('');
  const [struggles, setStruggles] = useState('');
  const [continuationNotes, setContinuationNotes] = useState('');
  const [nextWeekPriorities, setNextWeekPriorities] = useState('');

  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  // 1. Fetch Weekly Review Draft Stats
  const { data: draftData, isLoading: loadingDraft } = useQuery({
    queryKey: ['review-weekly-draft'],
    queryFn: () => api.get('/reviews/weekly/draft'),
  });

  // 2. Fetch Review History
  const { data: historyData } = useQuery({
    queryKey: ['reviews-history'],
    queryFn: () => api.get('/reviews/history'),
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => api.post('/reviews/weekly', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-weekly-draft'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-history'] });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      success('Weekly review submitted! You are set up for a calm, intentional week.');
      setActiveTab('history');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to submit review');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      weekStartDate: draftData?.weekStartDate || new Date().toISOString().split('T')[0],
      plannedTasksCount: draftData?.plannedTasksCount || 0,
      completedTasksCount: draftData?.completedTasksCount || 0,
      habitRate: draftData?.habitRate || 0,
      focusMinutes: draftData?.focusMinutes || 0,
      wins,
      struggles,
      continuationNotes,
      nextWeekPriorities,
    });
  };

  const historyReviews: WeeklyReview[] = historyData?.weekly || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-600" />
            <span>Weekly & Monthly Reflections</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Step back, celebrate showing up, and realign your direction without guilt.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-white border border-charcoal-200/80 p-1 rounded-2xl shadow-soft text-xs font-semibold">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-1.5 rounded-xl transition-all ${
              activeTab === 'weekly'
                ? 'bg-sage-600 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Weekly Review
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-sage-600 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Past Reviews ({historyReviews.length})
          </button>
        </div>
      </div>

      {activeTab === 'weekly' ? (
        <div className="space-y-6">
          {/* Past 7 Days Metric Summary Card */}
          <Card className="p-6">
            <h2 className="text-xs font-bold text-charcoal-600 uppercase tracking-wider mb-4">
              Week in Review Metrics (Past 7 Days)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-ivory-50 rounded-xl border border-charcoal-100">
                <div className="text-2xl font-extrabold text-sage-800">
                  {draftData?.completedTasksCount || 0} / {draftData?.plannedTasksCount || 0}
                </div>
                <div className="text-xs text-charcoal-500 font-medium mt-1">Tasks Completed</div>
              </div>
              <div className="p-4 bg-ivory-50 rounded-xl border border-charcoal-100">
                <div className="text-2xl font-extrabold text-emerald-700">
                  {draftData?.habitRate || 0}%
                </div>
                <div className="text-xs text-charcoal-500 font-medium mt-1">Habit Consistency</div>
              </div>
              <div className="p-4 bg-ivory-50 rounded-xl border border-charcoal-100">
                <div className="text-2xl font-extrabold text-lavender-700">
                  {draftData?.focusMinutes || 0}m
                </div>
                <div className="text-xs text-charcoal-500 font-medium mt-1">Focus Time</div>
              </div>
              <div className="p-4 bg-ivory-50 rounded-xl border border-charcoal-100">
                <div className="text-2xl font-extrabold text-amber-600">
                  {draftData?.review ? 'Submitted' : 'Pending'}
                </div>
                <div className="text-xs text-charcoal-500 font-medium mt-1">Status</div>
              </div>
            </div>
          </Card>

          {/* Guided Reflection Form */}
          <Card className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-charcoal-900 mb-1">
              Guided Weekly Reflection
            </h2>
            <p className="text-xs text-charcoal-500 mb-6">
              Honest answers create sustainable progress. There are no right or wrong responses.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>1. What went well this week? What small wins occurred?</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Consistently stretched in the mornings and finished my core backend tests without rushing."
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  className="w-full p-3 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>2. What felt overwhelming or created unnecessary friction?</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Overbooked Thursday afternoon with 4 tasks; next time I will schedule a buffer block."
                  value={struggles}
                  onChange={(e) => setStruggles(e.target.value)}
                  className="w-full p-3 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                  3. What should continue? What sustainable habits should be kept?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Keep the 25-minute focus intervals and 5-minute doorway steps."
                  value={continuationNotes}
                  onChange={(e) => setContinuationNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                  4. What matters most for next week? (Top 1-2 priorities)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Deploy frontend client to preview and complete Chapter 2 of CS syllabus."
                  value={nextWeekPriorities}
                  onChange={(e) => setNextWeekPriorities(e.target.value)}
                  className="w-full p-3 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-serif"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitMutation.isPending}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Complete Weekly Review
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        /* History Reviews List */
        <div className="space-y-4">
          {historyReviews.length === 0 ? (
            <Card className="text-center py-12 text-xs text-charcoal-400">
              No historical reviews saved yet. Complete your first weekly review above!
            </Card>
          ) : (
            historyReviews.map((rev) => (
              <Card key={rev.id} className="p-6 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-charcoal-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sage-600" />
                    <span className="font-bold text-sm text-charcoal-900">
                      Week of {rev.weekStartDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-charcoal-500">
                    <span>{rev.completedTasksCount} tasks done</span>
                    <span>• {rev.habitRate}% habits</span>
                    <span>• {rev.focusMinutes}m focus</span>
                  </div>
                </div>

                {rev.wins && (
                  <div>
                    <span className="font-bold text-xs text-sage-800">Wins:</span>
                    <p className="text-xs text-charcoal-700 font-serif italic mt-0.5">
                      "{rev.wins}"
                    </p>
                  </div>
                )}

                {rev.nextWeekPriorities && (
                  <div>
                    <span className="font-bold text-xs text-charcoal-800">Priorities:</span>
                    <p className="text-xs text-charcoal-700 font-serif mt-0.5">
                      {rev.nextWeekPriorities}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
