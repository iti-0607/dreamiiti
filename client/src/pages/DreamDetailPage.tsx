import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  Sparkles,
  Target,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Pause,
  Play,
  Calendar,
} from 'lucide-react';

export const DreamDetailPage: React.FC = () => {
  const { dreamId } = useParams<{ dreamId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalHorizon, setGoalHorizon] = useState('MONTHLY');
  const [goalEstimatedHours, setGoalEstimatedHours] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['dream', dreamId],
    queryFn: () => api.get(`/dreams/${dreamId}`),
    enabled: !!dreamId,
  });

  const dream = data?.dream;

  // Toggle Dream Status Mutation
  const updateDreamMutation = useMutation({
    mutationFn: (updateData: any) => api.put(`/dreams/${dreamId}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dream', dreamId] });
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      success('Dream updated.');
    },
  });

  // Delete Dream Mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/dreams/${dreamId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      success('Dream removed.');
      navigate('/app/dreams');
    },
  });

  // Create Goal under Dream Mutation
  const createGoalMutation = useMutation({
    mutationFn: (newGoalData: any) => api.post('/goals', newGoalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dream', dreamId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      success('Goal created and linked to dream!');
      setIsGoalModalOpen(false);
      setGoalTitle('');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create goal');
    },
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    createGoalMutation.mutate({
      dreamId,
      title: goalTitle.trim(),
      horizon: goalHorizon,
      estimatedHours: Number(goalEstimatedHours),
    });
  };

  if (isLoading) {
    return <div className="text-center py-12 text-charcoal-400">Loading dream details...</div>;
  }

  if (!dream) {
    return (
      <div className="text-center py-12">
        <p className="text-charcoal-500 mb-4">Dream not found.</p>
        <Link to="/app/dreams">
          <Button variant="secondary">Back to Dream Vault</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/app/dreams"
          className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-charcoal-800 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dream Vault
        </Link>
      </div>

      {/* Dream Header Card */}
      <Card className="border-sage-200/90 relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="sage">{dream.lifeArea?.name || 'Personal Growth'}</Badge>
              <Badge
                variant={dream.status === 'ACTIVE' ? 'emerald' : 'charcoal'}
              >
                {dream.status}
              </Badge>
              <span className="text-xs text-charcoal-500">
                Horizon: {dream.timeframe?.replace('_', ' ') || 'Quarterly'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              {dream.title}
            </h1>

            {dream.motivation && (
              <div className="p-4 rounded-xl bg-ivory-50/80 border border-charcoal-200/60 max-w-2xl font-serif italic text-charcoal-700 text-sm leading-relaxed">
                "{dream.motivation}"
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {dream.status === 'ACTIVE' ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pause className="w-3.5 h-3.5" />}
                onClick={() => updateDreamMutation.mutate({ status: 'PAUSED' })}
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={<Play className="w-3.5 h-3.5" />}
                onClick={() => updateDreamMutation.mutate({ status: 'ACTIVE' })}
              >
                Resume
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this dream?')) {
                  deleteMutation.mutate();
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-charcoal-100">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-700">
            <span>Overall Roadmap Progress</span>
            <span className="text-sage-700 font-bold">{dream.progress}%</span>
          </div>
          <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-600 rounded-full transition-all"
              style={{ width: `${dream.progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Linked Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-sage-600" />
            <h2 className="text-base font-bold text-charcoal-900">
              Linked Goals ({dream.goals?.length || 0})
            </h2>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsGoalModalOpen(true)}
          >
            Add Goal
          </Button>
        </div>

        {dream.goals?.length === 0 ? (
          <Card className="text-center py-8 text-xs text-charcoal-400">
            No goals linked to this dream yet. Add a monthly or weekly goal to build your roadmap!
          </Card>
        ) : (
          <div className="space-y-4">
            {dream.goals?.map((goal: any) => (
              <Card key={goal.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-charcoal-900">{goal.title}</span>
                      <Badge variant="amber" size="sm">
                        {goal.horizon}
                      </Badge>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-charcoal-500">{goal.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-sage-800 bg-sage-50 px-2.5 py-1 rounded-lg border border-sage-200">
                    {goal.progress}%
                  </span>
                </div>

                {/* Milestones in this goal */}
                {goal.milestones?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-charcoal-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                      Milestones
                    </span>
                    {goal.milestones.map((m: any) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 text-xs text-charcoal-700 p-1.5 rounded-lg hover:bg-ivory-50"
                      >
                        {m.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-charcoal-300 shrink-0" />
                        )}
                        <span className={m.isCompleted ? 'line-through text-charcoal-400' : ''}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Add Goal to Dream"
        maxWidth="md"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Goal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Backend Data Layer & ORM"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Planning Horizon
              </label>
              <select
                value={goalHorizon}
                onChange={(e) => setGoalHorizon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              >
                <option value="MONTHLY">Monthly Target</option>
                <option value="WEEKLY">Weekly Objective</option>
                <option value="YEARLY">Yearly Milestone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Estimated Hours
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={goalEstimatedHours}
                onChange={(e) => setGoalEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={createGoalMutation.isPending}>
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
