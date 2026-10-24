import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useNotification } from '../context/NotificationContext.js';
import { GoalPoint, SixMonthOverview } from '../types/index.js';
import { Modal } from '../components/ui/Modal.js';
import { QuickAddModal } from '../components/ui/QuickAddModal.js';
import {
  Target,
  Plus,
  Check,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Compass,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

export const GoalsPage: React.FC = () => {
  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  // Modals
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [isAddPointOpen, setIsAddPointOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<GoalPoint | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedPointIdForTask, setSelectedPointIdForTask] = useState<string>('');

  // Edit Goal Form State
  const [editLifePurpose, setEditLifePurpose] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');

  // Point Form State
  const [pointTitle, setPointTitle] = useState('');
  const [pointDesc, setPointDesc] = useState('');
  const [pointTargetDate, setPointTargetDate] = useState('');

  // Query overview
  const { data, isLoading } = useQuery<SixMonthOverview>({
    queryKey: ['goal-points-overview'],
    queryFn: () => api.get('/goals/points/overview'),
  });

  const points = data?.points || [];

  // Toggle point completion
  const togglePointMutation = useMutation({
    mutationFn: (pointId: string) => api.put(`/goals/points/${pointId}/toggle`, {}),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['goal-points-overview'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
      const pt = res?.point || res;
      if (pt?.isCompleted) {
        success('Point completed! Great progress.');
      } else {
        success('Point marked active.');
      }
    },
    onError: (err: any) => error(err.message || 'Failed to toggle point'),
  });

  // Delete point
  const deletePointMutation = useMutation({
    mutationFn: (pointId: string) => api.delete(`/goals/points/${pointId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-points-overview'] });
      success('Point deleted');
    },
    onError: (err: any) => error(err.message || 'Failed to delete point'),
  });

  // Reorder points (move up or down)
  const movePoint = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === points.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...points];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const pointIds = reordered.map((p) => p.id);
    try {
      await api.put('/goals/points/action/reorder', { pointIds });
      queryClient.invalidateQueries({ queryKey: ['goal-points-overview'] });
    } catch (err: any) {
      error(err.message || 'Failed to reorder');
    }
  };

  // Open Edit Goal Modal
  const openEditGoalModal = () => {
    setEditLifePurpose(data?.lifePurpose || '');
    setEditTitle(data?.sixMonthGoalTitle || '');
    setEditDesc(data?.sixMonthGoalDesc || '');
    setEditTargetDate(
      data?.sixMonthGoalTarget ? data.sixMonthGoalTarget.split('T')[0] : ''
    );
    setIsEditGoalOpen(true);
  };

  // Save Six-Month Goal
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    try {
      await api.put('/goals/points/six-month', {
        lifePurpose: editLifePurpose,
        sixMonthGoalTitle: editTitle.trim(),
        sixMonthGoalDesc: editDesc.trim(),
        sixMonthGoalTarget: editTargetDate || null,
      });
      queryClient.invalidateQueries({ queryKey: ['goal-points-overview'] });
      success('Goal updated successfully');
      setIsEditGoalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to update goal');
    }
  };

  // Save Add/Edit Point
  const handleSavePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointTitle.trim()) return;

    try {
      if (editingPoint) {
        await api.put(`/goals/points/${editingPoint.id}`, {
          title: pointTitle.trim(),
          description: pointDesc.trim() || null,
          targetDate: pointTargetDate || null,
        });
        success('Point updated');
      } else {
        await api.post('/goals/points', {
          title: pointTitle.trim(),
          description: pointDesc.trim() || null,
          targetDate: pointTargetDate || null,
        });
        success('Point added');
      }
      queryClient.invalidateQueries({ queryKey: ['goal-points-overview'] });
      setPointTitle('');
      setPointDesc('');
      setPointTargetDate('');
      setEditingPoint(null);
      setIsAddPointOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to save point');
    }
  };

  const openEditPointModal = (pt: GoalPoint) => {
    setEditingPoint(pt);
    setPointTitle(pt.title);
    setPointDesc(pt.description || '');
    setPointTargetDate(pt.targetDate ? pt.targetDate.split('T')[0] : '');
    setIsAddPointOpen(true);
  };

  const handleOpenAddTaskForPoint = (pointId: string) => {
    setSelectedPointIdForTask(pointId);
    setIsAddTaskModalOpen(true);
  };

  if (isLoading) {
    return <div className="py-12 text-center text-xs text-[#98A69C]">Loading goal roadmap...</div>;
  }

  const completedPoints = points.filter((p) => p.isCompleted).length;
  const progressPercent = data?.progress ?? (points.length > 0 ? Math.round((completedPoints / points.length) * 100) : 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27352C] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F2F7F3]">
            My Goals & Vision
          </h1>
          <p className="text-xs text-[#98A69C] mt-1">
            from now onwards 6 months are tough.
          </p>
        </div>

        <button
          onClick={openEditGoalModal}
          className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#27352C] hover:border-[#39E58C] text-[#F2F7F3] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5 text-[#39E58C]" />
          <span>Edit Goal</span>
        </button>
      </div>

      {/* LIFE PURPOSE CARD */}
      {data?.lifePurpose && (
        <div className="discipline-card rounded-2xl p-5 sm:p-6 space-y-2 border-l-4 border-l-[#39E58C]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#39E58C] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Ultimate Life Purpose
            </span>
            <button
              onClick={openEditGoalModal}
              className="text-xs text-[#98A69C] hover:text-[#39E58C]"
            >
              Edit
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#F2F7F3] leading-relaxed italic whitespace-pre-wrap">
            "{data.lifePurpose}"
          </p>
        </div>
      )}

      {/* SIX-MONTH GOAL CARD */}
      <div className="discipline-card rounded-2xl p-6 space-y-5 bg-gradient-to-br from-[#151C17] to-[#1B241E]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#39E58C] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Six-Month Hardwork(Next 180 Days)
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F2F7F3]">
              {data?.sixMonthGoalTitle || 'Define your six-month goal'}
            </h2>
            {data?.sixMonthGoalDesc && (
              <p className="text-xs sm:text-sm text-[#98A69C] leading-relaxed max-w-3xl">
                {data.sixMonthGoalDesc}
              </p>
            )}
          </div>

          {data?.sixMonthGoalTarget && (
            <div className="px-3 py-2 rounded-xl bg-[#101713] border border-[#27352C] text-xs font-mono text-[#F2F7F3] flex items-center gap-1.5 shrink-0 self-start">
              <Calendar className="w-3.5 h-3.5 text-[#39E58C]" />
              <span>Target: {format(new Date(data.sixMonthGoalTarget), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-[#27352C]/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#98A69C]">Milestone Progress</span>
            <span className="font-mono font-bold text-[#39E58C]">
              {completedPoints} / {points.length} points completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-[#101713] h-2 rounded-full overflow-hidden border border-[#27352C]">
            <div
              className="bg-[#39E58C] h-2 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* GOAL POINTS LIST */}
      <div className="discipline-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#27352C] pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#F2F7F3]">Milestone Points</h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#1B241E] text-[#39E58C] border border-[#27352C]">
              {points.length}
            </span>
          </div>

          <button
            onClick={() => {
              setEditingPoint(null);
              setPointTitle('');
              setPointDesc('');
              setPointTargetDate('');
              setIsAddPointOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Point
          </button>
        </div>

        {points.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#98A69C] space-y-2">
            <p>No milestone points added yet. Break your goal into actionable points you control.</p>
            <button
              onClick={() => setIsAddPointOpen(true)}
              className="text-[#39E58C] hover:underline font-semibold"
            >
              + Add your first milestone point
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {points.map((pt, idx) => {
              const isDone = pt.isCompleted;

              return (
                <div
                  key={pt.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDone
                    ? 'bg-[#101713]/80 border-[#27352C]/60 text-[#98A69C]'
                    : 'bg-[#1B241E] border-[#27352C] text-[#F2F7F3] hover:border-[#39E58C]/40'
                    }`}
                >
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => togglePointMutation.mutate(pt.id)}
                      className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-all ${isDone
                        ? 'bg-[#39E58C] border-[#39E58C] text-[#0B0F0D]'
                        : 'border-[#27352C] bg-[#101713] hover:border-[#39E58C]'
                        }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-[#39E58C]">
                          #{idx + 1}
                        </span>
                        <h4
                          className={`text-sm font-semibold tracking-tight ${isDone ? 'line-through text-[#98A69C]' : 'text-[#F2F7F3]'
                            }`}
                        >
                          {pt.title}
                        </h4>
                        {pt.targetDate && (
                          <span className="text-[10px] text-[#98A69C] px-2 py-0.5 rounded bg-[#101713] border border-[#27352C] flex items-center gap-1 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            {format(new Date(pt.targetDate), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>

                      {pt.description && (
                        <p className="text-xs text-[#98A69C] leading-relaxed">
                          {pt.description}
                        </p>
                      )}

                      {/* Linked tasks count */}
                      {pt.tasks && pt.tasks.length > 0 && (
                        <div className="text-[11px] text-[#98A69C] pt-1 flex items-center gap-1.5">
                          <span>
                            {pt.tasks.filter((t) => t.status === 'COMPLETED').length} / {pt.tasks.length} tasks completed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenAddTaskForPoint(pt.id)}
                      className="px-2.5 py-1 rounded-lg border border-[#27352C] hover:border-[#39E58C] text-[#39E58C] hover:bg-[#101713] text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Add a task linked to this point"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Task</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => movePoint(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-[#98A69C] hover:text-[#F2F7F3] hover:bg-[#101713] disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePoint(idx, 'down')}
                      disabled={idx === points.length - 1}
                      className="p-1.5 rounded-lg text-[#98A69C] hover:text-[#F2F7F3] hover:bg-[#101713] disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditPointModal(pt)}
                      className="p-1.5 rounded-lg text-[#98A69C] hover:text-[#39E58C] hover:bg-[#101713]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePointMutation.mutate(pt.id)}
                      className="p-1.5 rounded-lg text-[#98A69C] hover:text-red-400 hover:bg-[#101713]"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT GOAL MODAL */}
      <Modal isOpen={isEditGoalOpen} onClose={() => setIsEditGoalOpen(false)} title="Edit Six-Month Goal" maxWidth="md">
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              Ultimate Life Purpose
            </label>
            <textarea
              rows={4}
              value={editLifePurpose}
              onChange={(e) => setEditLifePurpose(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              Goal Title <span className="text-[#39E58C]">*</span>
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              Description & Success Criteria
            </label>
            <textarea
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={editTargetDate}
              onChange={(e) => setEditTargetDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#27352C]">
            <button
              type="button"
              onClick={() => setIsEditGoalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#27352C] text-[#98A69C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#39E58C] text-[#0B0F0D] hover:bg-[#26C978]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD / EDIT POINT MODAL */}
      <Modal
        isOpen={isAddPointOpen}
        onClose={() => setIsAddPointOpen(false)}
        title={editingPoint ? 'Edit Goal Point' : 'Add Goal Point'}
        maxWidth="md"
      >
        <form onSubmit={handleSavePoint} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              Point Title <span className="text-[#39E58C]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Architect distributed caching layer"
              value={pointTitle}
              onChange={(e) => setPointTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Details or deliverables..."
              value={pointDesc}
              onChange={(e) => setPointDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={pointTargetDate}
              onChange={(e) => setPointTargetDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#27352C]">
            <button
              type="button"
              onClick={() => setIsAddPointOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#27352C] text-[#98A69C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#39E58C] text-[#0B0F0D] hover:bg-[#26C978]"
            >
              {editingPoint ? 'Update Point' : 'Add Point'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Task linked to point */}
      <QuickAddModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        defaultGoalPointId={selectedPointIdForTask}
      />
    </div>
  );
};
