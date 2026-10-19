import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Goal, Milestone, Task } from '../types/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  Target,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  Clock,
  ArrowRight,
  Check,
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const [horizonFilter, setHorizonFilter] = useState('ALL');
  const [isDecomposeOpen, setIsDecomposeOpen] = useState(false);
  const [isManualGoalOpen, setIsManualGoalOpen] = useState(false);

  // Decompose assistant state
  const [promptInput, setPromptInput] = useState('');
  const [availableHours, setAvailableHours] = useState(10);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [loadingDecompose, setLoadingDecompose] = useState(false);

  // Manual goal state
  const [manualTitle, setManualTitle] = useState('');
  const [manualHorizon, setManualHorizon] = useState('MONTHLY');
  const [manualHours, setManualHours] = useState(25);
  const [manualDreamId, setManualDreamId] = useState('');

  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['goals', { horizon: horizonFilter }],
    queryFn: () => api.get(`/goals?horizon=${horizonFilter}`),
  });

  const { data: dreamsData } = useQuery({
    queryKey: ['dreams'],
    queryFn: () => api.get('/dreams'),
  });

  // Toggle milestone completion
  const toggleMilestoneMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/milestones/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      success('Milestone progress updated.');
    },
  });

  // Run Goal Decomposition
  const handleRunDecompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setLoadingDecompose(true);
    try {
      const res = await api.post('/goals/decompose', {
        title: promptInput.trim(),
        horizon: 'MONTHLY',
        availableHoursPerWeek: Number(availableHours),
      });
      setGeneratedPlan(res.plan);
    } catch (err: any) {
      error(err.message || 'Failed to decompose goal');
    } finally {
      setLoadingDecompose(false);
    }
  };

  // Import Generated Plan into user database
  const handleImportPlan = async () => {
    if (!generatedPlan) return;
    try {
      const res = await api.post('/goals', {
        title: promptInput.trim(),
        horizon: 'MONTHLY',
        estimatedHours: 40,
        milestones: generatedPlan.milestones.map((m: any) => ({
          title: m.title,
        })),
      });

      // Also create the first batch of tasks for the first milestone
      const firstGoalId = res.goal.id;
      const firstMilestoneId = res.goal.milestones?.[0]?.id;

      if (generatedPlan.milestones[0]?.tasks) {
        for (const t of generatedPlan.milestones[0].tasks) {
          await api.post('/tasks', {
            title: t.title,
            estimatedMinutes: t.estimatedMinutes,
            priority: t.priority,
            goalId: firstGoalId,
            milestoneId: firstMilestoneId,
          });
        }
      }

      success('Goal & breakdown imported successfully into your plan!');
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsDecomposeOpen(false);
      setGeneratedPlan(null);
      setPromptInput('');
    } catch (err: any) {
      error(err.message || 'Failed to import plan');
    }
  };

  // Create Manual Goal
  const handleCreateManualGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    try {
      await api.post('/goals', {
        title: manualTitle.trim(),
        horizon: manualHorizon,
        estimatedHours: Number(manualHours),
        dreamId: manualDreamId || null,
      });
      success('Goal created.');
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsManualGoalOpen(false);
      setManualTitle('');
    } catch (err: any) {
      error(err.message || 'Failed to create goal');
    }
  };

  const goals: Goal[] = goalsData?.goals || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-sage-600" />
            <span>Goal Decomposition Engine</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Hierarchy: Dream → Goal → Milestone → Task → Subtask.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="amber"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => setIsDecomposeOpen(true)}
          >
            AI Goal Decomposer
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsManualGoalOpen(true)}
          >
            Add Goal
          </Button>
        </div>
      </div>

      {/* Horizon Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-charcoal-200/80 rounded-2xl shadow-soft max-w-fit text-xs font-semibold">
        {['ALL', 'YEARLY', 'MONTHLY', 'WEEKLY'].map((h) => (
          <button
            key={h}
            onClick={() => setHorizonFilter(h)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              horizonFilter === h
                ? 'bg-sage-600 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            {h === 'ALL' ? 'All Horizons' : h.charAt(0) + h.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Goal Tree List */}
      {isLoading ? (
        <div className="text-center py-12 text-charcoal-400">Loading goal decomposition...</div>
      ) : goals.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-charcoal-900 mb-1">No goals created yet</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-4">
            Use the AI Goal Decomposer to turn natural language ambitions into concrete weekly milestones.
          </p>
          <Button variant="amber" size="sm" onClick={() => setIsDecomposeOpen(true)}>
            Try Goal Decomposer
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-5 border-charcoal-200/90 shadow-soft">
              {/* Goal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-charcoal-900">{goal.title}</h3>
                    <Badge
                      variant={
                        goal.horizon === 'MONTHLY'
                          ? 'sage'
                          : goal.horizon === 'WEEKLY'
                          ? 'amber'
                          : 'lavender'
                      }
                      size="sm"
                    >
                      {goal.horizon}
                    </Badge>
                  </div>
                  {goal.dream?.title && (
                    <div className="text-xs text-charcoal-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-lavender-600" />
                      <span>Belongs to Dream: {goal.dream.title}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-sage-800">
                      Progress: {goal.progress}%
                    </span>
                    <div className="w-24 bg-ivory-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-sage-600 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones in this goal */}
              <div className="mt-4 pt-4 border-t border-charcoal-100/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-600 mb-1">
                  <span>Progressive Milestones ({goal.milestones?.length || 0})</span>
                  <span className="text-[11px] text-charcoal-400 font-normal">
                    Click check to advance progress
                  </span>
                </div>

                {goal.milestones?.length === 0 ? (
                  <div className="text-xs text-charcoal-400 py-2">
                    No milestones added to this goal yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {goal.milestones?.map((m: any) => (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                          m.isCompleted
                            ? 'bg-emerald-50/40 border-emerald-200 text-charcoal-400'
                            : 'bg-ivory-50/50 border-charcoal-200 text-charcoal-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleMilestoneMutation.mutate(m.id)}
                            className="text-sage-600 hover:scale-110 transition-transform"
                          >
                            {m.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-charcoal-300" />
                            )}
                          </button>
                          <span
                            className={`font-semibold ${
                              m.isCompleted ? 'line-through text-charcoal-400' : 'text-charcoal-900'
                            }`}
                          >
                            {m.title}
                          </span>
                        </div>

                        {m.targetDate && (
                          <span className="text-[11px] text-charcoal-400">
                            Target: {new Date(m.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* AI Goal Decomposer Modal */}
      <Modal
        isOpen={isDecomposeOpen}
        onClose={() => setIsDecomposeOpen(false)}
        title="AI & Deterministic Goal Decomposer"
        description="Type any ambition in natural language. We will propose 4 progressive milestones, 5-minute doorway steps, and realistic buffer times."
        maxWidth="xl"
      >
        {!generatedPlan ? (
          <form onSubmit={handleRunDecompose} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Describe your goal in plain words *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. I want to build a strong backend project in two months while keeping up with my college classes"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Available Focus Hours Per Week
              </label>
              <input
                type="number"
                min={3}
                max={40}
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
              />
              <span className="text-[11px] text-charcoal-400 mt-1 block">
                Calculates daily capacity to prevent unachievable scheduling.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="secondary" type="button" onClick={() => setIsDecomposeOpen(false)}>
                Cancel
              </Button>
              <Button variant="amber" type="submit" loading={loadingDecompose}>
                Decompose into Actionable Steps
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200 text-sage-900">
              <div className="font-bold mb-1">Pacing & Rest Recommendations:</div>
              <div>• Weekly focus target: {generatedPlan.recommendedWeeklyHours} hours</div>
              <div>• Rest & delay buffer: {generatedPlan.bufferRatio * 100}% of schedule</div>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {generatedPlan.milestones?.map((m: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl border border-charcoal-200 bg-white">
                  <div className="font-bold text-sm text-charcoal-900 mb-1">{m.title}</div>
                  <p className="text-charcoal-500 text-xs mb-2.5">{m.description}</p>

                  <div className="space-y-2 pt-2 border-t border-charcoal-100">
                    <div className="text-[11px] font-bold text-charcoal-600 uppercase tracking-wider">
                      Doorway Tasks:
                    </div>
                    {m.tasks?.map((t: any, tIdx: number) => (
                      <div
                        key={tIdx}
                        className="p-2 rounded-lg bg-ivory-50 border border-charcoal-200/60"
                      >
                        <div className="flex items-center justify-between font-semibold text-charcoal-800">
                          <span>{t.title}</span>
                          <span className="text-[10px] text-charcoal-500">{t.estimatedMinutes}m</span>
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium mt-1">
                          ⚡ 5-Minute Start: {t.firstStep5Min}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-charcoal-200">
              <Button variant="ghost" onClick={() => setGeneratedPlan(null)}>
                Modify Prompt
              </Button>
              <Button variant="primary" onClick={handleImportPlan}>
                Approve & Import to My Plan
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Goal Modal */}
      <Modal
        isOpen={isManualGoalOpen}
        onClose={() => setIsManualGoalOpen(false)}
        title="Add Goal Manually"
        maxWidth="md"
      >
        <form onSubmit={handleCreateManualGoal} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Goal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master React Performance & Concurrency"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Planning Horizon
              </label>
              <select
                value={manualHorizon}
                onChange={(e) => setManualHorizon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              >
                <option value="MONTHLY">Monthly Target</option>
                <option value="WEEKLY">Weekly Objective</option>
                <option value="YEARLY">Yearly Milestone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Est. Hours
              </label>
              <input
                type="number"
                min={1}
                max={150}
                value={manualHours}
                onChange={(e) => setManualHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Attach to Dream (Optional)
            </label>
            <select
              value={manualDreamId}
              onChange={(e) => setManualDreamId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
            >
              <option value="">No parent dream (Standalone Goal)</option>
              {dreamsData?.dreams?.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsManualGoalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
