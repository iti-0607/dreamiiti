import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Dream } from '../types/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  Sparkles,
  Plus,
  Search,
  LayoutGrid,
  List,
  Target,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export const DreamsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New dream form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [motivation, setMotivation] = useState('');
  const [timeframe, setTimeframe] = useState('3_months');
  const [priority, setPriority] = useState('MEDIUM');
  const [coverColor, setCoverColor] = useState('#2E6F52');
  const [successCriteria, setSuccessCriteria] = useState('');

  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dreams', { status: statusFilter, search }],
    queryFn: () => api.get(`/dreams?status=${statusFilter}&search=${search}`),
  });

  const createMutation = useMutation({
    mutationFn: (dreamData: any) => api.post('/dreams', dreamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      success('Dream planted successfully in your vault!');
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setMotivation('');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to plant dream');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      motivation: motivation.trim() || undefined,
      timeframe,
      priority,
      coverColor,
      successCriteria: successCriteria.trim() || undefined,
    });
  };

  const dreams: Dream[] = data?.dreams || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-lavender-600" />
            <span>Dream Vault</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Where life ambitions are nurtured, organized, and broken into achievable goals.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Plant New Dream
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-charcoal-200/80 shadow-soft">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search dreams by title, motivation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center bg-ivory-100 p-1 rounded-xl text-xs font-semibold">
            {['ACTIVE', 'COMPLETED', 'PAUSED', 'ALL'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === status
                    ? 'bg-white text-sage-800 shadow-sm'
                    : 'text-charcoal-500 hover:text-charcoal-800'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Grid vs List toggle */}
          <div className="flex items-center border border-charcoal-200 rounded-xl overflow-hidden p-0.5 bg-ivory-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-sage-800 shadow-sm' : 'text-charcoal-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-sage-800 shadow-sm' : 'text-charcoal-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dreams Grid / List */}
      {isLoading ? (
        <div className="text-center py-12 text-charcoal-400 text-sm">
          Loading your Dream Vault...
        </div>
      ) : dreams.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-lavender-100 text-lavender-700 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-charcoal-900 mb-1">Your vault is ready</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-4">
            Plant your first ambition. Dreams become achievable once you connect them to milestones.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            Plant a Dream
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dreams.map((dream) => (
            <Link key={dream.id} to={`/app/dreams/${dream.id}`} className="block group">
              <Card hoverable className="h-full flex flex-col justify-between border-charcoal-200/90">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="sage" size="sm">
                      {dream.lifeArea?.name || 'Personal Growth'}
                    </Badge>
                    <span className="text-[11px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-200">
                      {dream.progress}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-charcoal-900 group-hover:text-sage-700 transition-colors mb-2 line-clamp-2">
                    {dream.title}
                  </h3>

                  {dream.motivation && (
                    <p className="text-xs text-charcoal-500 line-clamp-2 mb-4 leading-relaxed font-serif italic">
                      "{dream.motivation}"
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-charcoal-100/80 space-y-2">
                  <div className="w-full bg-ivory-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage-600 rounded-full transition-all"
                      style={{ width: `${dream.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-charcoal-400">
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" />
                      {dream.goalsCount || 0} goals
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {dream.completedTasksCount || 0}/{dream.tasksCount || 0} tasks
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {dreams.map((dream) => (
            <Link key={dream.id} to={`/app/dreams/${dream.id}`} className="block group">
              <Card
                hoverable
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-charcoal-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: dream.coverColor }} />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-charcoal-900 group-hover:text-sage-700 transition-colors truncate">
                      {dream.title}
                    </div>
                    <div className="text-xs text-charcoal-500 truncate">
                      {dream.lifeArea?.name || 'General'} • {dream.goalsCount || 0} goals
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-32 bg-ivory-200 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-sage-600 rounded-full"
                      style={{ width: `${dream.progress}%` }}
                    />
                  </div>
                  <Badge variant="sage">{dream.progress}%</Badge>
                  <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-sage-700 transition-colors" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Dream Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Plant a New Dream"
        description="Articulate your ambition. Connecting it to a deeper motivation helps overcome procrastination."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Dream Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Distributed Systems & Build a World-Class Portfolio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Why does this matter to you? (Motivation)
            </label>
            <textarea
              rows={3}
              placeholder="How will this change your confidence, peace of mind, or daily life?"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-serif"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Planning Horizon
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              >
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
                <option value="6_months">6 Months</option>
                <option value="1_year">1 Year</option>
                <option value="custom">Ongoing / Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Success Criteria (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Published project with 90%+ test coverage"
              value={successCriteria}
              onChange={(e) => setSuccessCriteria(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={createMutation.isPending}>
              Plant Dream
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
