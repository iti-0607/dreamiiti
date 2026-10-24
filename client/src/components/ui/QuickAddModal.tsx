import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { api } from '../../api/client.js';
import { useNotification } from '../../context/NotificationContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Clock, Calendar, Coins, ShieldAlert, Target } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultGoalPointId?: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  defaultGoalPointId,
}) => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate || todayStr);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setTaskPriority] = useState('SHOULD_DO');
  const [goalPointId, setGoalPointId] = useState(defaultGoalPointId || '');
  const [rewardCoins, setRewardCoins] = useState(user?.defaultTaskReward ?? 10);
  const [penaltyEnabled, setPenaltyEnabled] = useState(user?.defaultPenaltyEnabled ?? false);
  const [penaltyCoins, setPenaltyCoins] = useState(user?.defaultPenalty ?? 5);
  const [loading, setLoading] = useState(false);

  // Fetch goal points
  const { data: goalPointsData } = useQuery({
    queryKey: ['goal-points-overview'],
    queryFn: () => api.get('/goals/points/overview'),
    enabled: isOpen,
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(todayStr);
    setStartTime('');
    setEndTime('');
    setTaskPriority('SHOULD_DO');
    setGoalPointId('');
    setRewardCoins(user?.defaultTaskReward ?? 10);
    setPenaltyEnabled(user?.defaultPenaltyEnabled ?? false);
    setPenaltyCoins(user?.defaultPenalty ?? 5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate times if both provided
    if (startTime && endTime && endTime <= startTime) {
      error('End time must be later than start time.');
      return;
    }

    setLoading(true);
    try {
      // Build ISO timestamps if start/end times provided with date
      let scheduledStart: string | undefined = undefined;
      let scheduledEnd: string | undefined = undefined;

      if (startTime && date) {
        scheduledStart = new Date(`${date}T${startTime}:00`).toISOString();
      }
      if (endTime && date) {
        scheduledEnd = new Date(`${date}T${endTime}:00`).toISOString();
      }

      await api.post('/tasks', {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: date ? new Date(`${date}T23:59:59`).toISOString() : undefined,
        scheduledStart,
        scheduledEnd,
        priority,
        goalPointId: goalPointId || undefined,
        rewardCoins: Number(rewardCoins) || 0,
        penaltyEnabled: Boolean(penaltyEnabled),
        penaltyCoins: penaltyEnabled ? Number(penaltyCoins) || 0 : 0,
      });

      success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
      queryClient.invalidateQueries({ queryKey: ['goal-points-overview'] });

      resetForm();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Task" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-[#F2F7F3]">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#98A69C] mb-1">
            Task Title <span className="text-[#39E58C]">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-sm text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C] focus:ring-1 focus:ring-[#39E58C]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#98A69C] mb-1">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add context or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] placeholder-[#98A69C]/50 focus:outline-none focus:border-[#39E58C] focus:ring-1 focus:ring-[#39E58C] resize-y"
          />
        </div>

        {/* Date & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setTaskPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            >
              <option value="MUST_DO">Must Do (Critical)</option>
              <option value="SHOULD_DO">Should Do (Standard)</option>
              <option value="OPTIONAL">Optional (Low)</option>
            </select>
          </div>
        </div>

        {/* Optional Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              Start Time (Optional)
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#98A69C] mb-1">
              End Time (Optional)
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
            />
          </div>
        </div>

        {/* Link to Six-Month Goal Point */}
        <div>
          <label className="block text-xs font-semibold text-[#98A69C] mb-1">
            Related Six-Month Goal Point (Optional)
          </label>
          <select
            value={goalPointId}
            onChange={(e) => setGoalPointId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#27352C] bg-[#1B241E] text-xs text-[#F2F7F3] focus:outline-none focus:border-[#39E58C]"
          >
            <option value="">None (Independent task)</option>
            {goalPointsData?.points?.map((pt: any) => (
              <option key={pt.id} value={pt.id}>
                {pt.title}
              </option>
            ))}
          </select>
        </div>

        {/* Reward Coins & Missed Penalty */}
        <div className="p-3.5 rounded-xl border border-[#27352C] bg-[#101713] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#39E58C]" />
              <span className="text-xs font-medium text-[#F2F7F3]">Reward Coins</span>
            </div>
            <input
              type="number"
              min={0}
              value={rewardCoins}
              onChange={(e) => setRewardCoins(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-20 px-2 py-1 rounded-lg border border-[#27352C] bg-[#1B241E] text-xs text-right font-mono text-[#39E58C] focus:outline-none focus:border-[#39E58C]"
            />
          </div>

          <div className="pt-2 border-t border-[#27352C]/60 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={penaltyEnabled}
                onChange={(e) => setPenaltyEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-[#27352C] text-[#39E58C] bg-[#1B241E] focus:ring-0"
              />
              <span className="text-xs text-[#98A69C]">
                Enable penalty if missed at end of day
              </span>
            </label>

            {penaltyEnabled && (
              <div className="flex items-center justify-between pl-6 animate-fade-in">
                <span className="text-xs text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Penalty Deduction
                </span>
                <input
                  type="number"
                  min={1}
                  value={penaltyCoins}
                  onChange={(e) => setPenaltyCoins(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-20 px-2 py-1 rounded-lg border border-red-500/40 bg-[#1B241E] text-xs text-right font-mono text-red-400 focus:outline-none focus:border-red-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[#27352C]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-[#27352C] text-[#98A69C] hover:text-[#F2F7F3] hover:border-[#98A69C] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
