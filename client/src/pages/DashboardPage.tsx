import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import {
  Sparkles,
  Target,
  Sprout,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data: dreamsData } = useQuery({
    queryKey: ['dreams'],
    queryFn: () => api.get('/dreams'),
  });

  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals'),
  });

  const { data: habitsData } = useQuery({
    queryKey: ['habits'],
    queryFn: () => api.get('/habits'),
  });

  const { data: insightsData } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.get('/insights'),
  });

  const dreams = dreamsData?.dreams || [];
  const goals = goalsData?.goals || [];
  const habits = habitsData?.habits || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight">
            Executive Growth Dashboard
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Holistic view of your dreams, goal roadmap, and consistency rhythms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/dreams/new">
            <Button variant="primary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
              Plant New Dream
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 mb-1">
            <span>Active Dreams</span>
            <Sparkles className="w-4 h-4 text-lavender-600" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900">{dreams.length}</div>
          <div className="text-[11px] text-sage-700 font-medium mt-1">Across life areas</div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 mb-1">
            <span>Active Goals</span>
            <Target className="w-4 h-4 text-sage-600" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900">{goals.length}</div>
          <div className="text-[11px] text-charcoal-500 mt-1">Monthly & weekly</div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 mb-1">
            <span>Habits Growing</span>
            <Sprout className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900">{habits.length}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Gentle consistency</div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 mb-1">
            <span>Est. Accuracy</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900">
            {insightsData?.insights?.estimationComparison?.accuracyRatio || 95}%
          </div>
          <div className="text-[11px] text-charcoal-500 mt-1">Realistic pacing</div>
        </Card>
      </div>

      {/* Dreams & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dreams Vault Preview */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lavender-600" />
              <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                Dream Vault
              </h2>
            </div>
            <Link to="/app/dreams" className="text-xs text-sage-700 hover:underline font-semibold flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {dreams.slice(0, 3).map((dream: any) => (
              <Link
                key={dream.id}
                to={`/app/dreams/${dream.id}`}
                className="block p-3.5 rounded-xl border border-charcoal-200/80 hover:border-sage-300 hover:shadow-soft transition-all bg-ivory-50/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 line-clamp-1">
                      {dream.title}
                    </span>
                    <span className="text-[11px] text-charcoal-500">
                      {dream.lifeArea?.name || 'Personal Growth'} • {dream.goalsCount || 0} goals
                    </span>
                  </div>
                  <Badge variant="sage" size="sm">
                    {dream.progress}%
                  </Badge>
                </div>

                <div className="w-full bg-ivory-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage-600 rounded-full transition-all"
                    style={{ width: `${dream.progress}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Goals Roadmap */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-sage-600" />
              <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                Active Goals Roadmap
              </h2>
            </div>
            <Link to="/app/goals" className="text-xs text-sage-700 hover:underline font-semibold flex items-center gap-1">
              Explore tree <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 3).map((goal: any) => (
              <div
                key={goal.id}
                className="p-3.5 rounded-xl border border-charcoal-200/80 bg-white shadow-soft"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-xs font-bold text-charcoal-900 truncate mr-2">
                    {goal.title}
                  </div>
                  <Badge variant="amber" size="sm">
                    {goal.horizon}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-charcoal-500 mb-2">
                  <span>{goal.milestones?.length || 0} milestones</span>
                  <span>{goal.tasks?.length || 0} tasks</span>
                </div>
                <div className="w-full bg-ivory-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Habit Garden Preview Card */}
      <Card className="garden-card border-emerald-200/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                Habit Garden Status
              </h2>
              <div className="text-xs text-charcoal-500">
                Plants evolve with consistency. Rest days nurture roots.
              </div>
            </div>
          </div>
          <Link to="/app/habits">
            <Button variant="secondary" size="sm">
              Visit Garden
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {habits.slice(0, 3).map((habit: any) => (
            <div
              key={habit.id}
              className="p-4 rounded-xl bg-white/90 border border-charcoal-200/60 shadow-soft text-center"
            >
              <div className="text-3xl mb-1">
                {habit.plantStage === 'FOREST'
                  ? '🌲'
                  : habit.plantStage === 'BLOOM'
                  ? '🌸'
                  : habit.plantStage === 'BUD'
                  ? '🌿'
                  : '🌱'}
              </div>
              <div className="text-xs font-bold text-charcoal-800 truncate mb-1">
                {habit.name}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                Streak: {habit.currentStreak} days
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
