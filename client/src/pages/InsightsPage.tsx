import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import {
  BarChart3,
  TrendingUp,
  Clock,
  PieChart as PieIcon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const InsightsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.get('/insights'),
  });

  const insights = data?.insights;
  const taskTrends = insights?.taskTrends || [];
  const focusTrends = insights?.focusTrends || [];
  const workload = insights?.workloadByCategory || [];
  const estimation = insights?.estimationComparison || {
    totalEstimatedHours: 0,
    totalActualHours: 0,
    accuracyRatio: 100,
  };

  const COLORS = ['#2E6F52', '#3B7A57', '#E5A93C', '#8E82B6', '#7B6FA1', '#D97706'];

  if (isLoading) {
    return <div className="text-center py-12 text-charcoal-400 text-xs">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sage-600" />
          <span>Progress & Rhythm Analytics</span>
        </h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Practical trends answering real questions. No toxic productivity scores.
        </p>
      </div>

      {/* Compassionate Insight Banner */}
      <div className="p-4 rounded-2xl bg-sage-50/70 border border-sage-200 flex items-start gap-3 text-xs text-sage-950">
        <Sparkles className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold mb-0.5">Gentle Perspective:</div>
          <p>{insights?.compassionateNote || 'Consistency is a rhythm, not a prison.'}</p>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Daily Task Completions (Past 14 Days)
              </h2>
            </div>
            <span className="text-[11px] text-charcoal-500">Steady pace</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#8A92A0" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#8A92A0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #EBE7DE',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="completed" fill="#2E6F52" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Focus Hours Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-lavender-600" />
              <h2 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Focus Time (Past 7 Days, Hours)
              </h2>
            </div>
            <span className="text-[11px] text-charcoal-500">Deep flow</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#8A92A0" />
                <YAxis tick={{ fontSize: 10 }} stroke="#8A92A0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #EBE7DE',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="hours" fill="#8E82B6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Life Area Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Workload Distribution by Life Area
              </h2>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {workload.length === 0 ? (
              <div className="text-xs text-charcoal-400">No tasks created yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workload}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="tasksCount"
                    nameKey="name"
                  >
                    {workload.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #EBE7DE',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
            {workload.map((item: any, idx: number) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-charcoal-600">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pacing & Estimation Accuracy Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sage-600" />
                <h2 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                  Planning Pacing & Estimation Accuracy
                </h2>
              </div>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed mb-6">
              Are you overestimating or underestimating how long tasks take? Pacing accuracy helps
              you protect realistic rest buffers.
            </p>

            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div className="p-4 bg-ivory-100 rounded-xl">
                <div className="text-2xl font-extrabold text-charcoal-900">
                  {estimation.totalEstimatedHours}h
                </div>
                <div className="text-xs text-charcoal-500 font-medium mt-1">Total Estimated</div>
              </div>

              <div className="p-4 bg-ivory-100 rounded-xl">
                <div className="text-2xl font-extrabold text-sage-700">
                  {estimation.totalActualHours}h
                </div>
                <div className="text-xs text-charcoal-500 font-medium mt-1">Total Actual Spent</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-between text-xs text-sage-900">
            <span>Estimation Accuracy Ratio:</span>
            <span className="font-bold text-sm">{estimation.accuracyRatio}%</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
