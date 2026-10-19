import { prisma } from '../prisma.js';

export const InsightService = {
  async getInsights(userId: string) {
    const now = new Date();
    const past14Days = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // 1. Daily task completion trend for last 14 days
    const completedTasks = await prisma.task.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: past14Days },
      },
      select: { completedAt: true, estimatedMinutes: true, actualMinutes: true },
    });

    const completionTrendMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      completionTrendMap[iso] = 0;
    }

    for (const t of completedTasks) {
      if (t.completedAt) {
        const iso = t.completedAt.toISOString().split('T')[0];
        if (completionTrendMap[iso] !== undefined) {
          completionTrendMap[iso]++;
        }
      }
    }

    const taskTrends = Object.entries(completionTrendMap).map(([date, count]) => ({
      date: date.substring(5), // MM-DD
      fullDate: date,
      completed: count,
    }));

    // 2. Habit consistency
    const habits = await prisma.habit.findMany({
      where: { userId },
      select: { id: true, name: true, currentStreak: true, bestStreak: true, plantStage: true },
    });

    // 3. Focus time for past 7 days
    const past7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: past7Days },
        status: { in: ['COMPLETED', 'STOPPED_EARLY'] },
      },
      select: { startedAt: true, actualMinutes: true },
    });

    const focusTrendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      focusTrendMap[iso] = 0;
    }

    for (const s of focusSessions) {
      const iso = s.startedAt.toISOString().split('T')[0];
      if (focusTrendMap[iso] !== undefined) {
        focusTrendMap[iso] += s.actualMinutes;
      }
    }

    const focusTrends = Object.entries(focusTrendMap).map(([date, minutes]) => ({
      date: date.substring(5),
      hours: +(minutes / 60).toFixed(1),
      minutes,
    }));

    // 4. Workload distribution by Life Area
    const dreams = await prisma.dream.findMany({
      where: { userId },
      include: {
        lifeArea: true,
        goals: {
          include: {
            tasks: { select: { id: true, status: true } },
          },
        },
      },
    });

    const lifeAreaMap: Record<string, { name: string; color: string; tasksCount: number }> = {};
    for (const dream of dreams) {
      const areaName = dream.lifeArea?.name || 'General';
      const areaColor = dream.lifeArea?.color || '#2E6F52';
      const tasksInDream = dream.goals.reduce((acc, g) => acc + g.tasks.length, 0);

      if (!lifeAreaMap[areaName]) {
        lifeAreaMap[areaName] = { name: areaName, color: areaColor, tasksCount: 0 };
      }
      lifeAreaMap[areaName].tasksCount += tasksInDream;
    }

    const workloadByCategory = Object.values(lifeAreaMap);

    // 5. Estimated vs Actual accuracy
    let totalEstimated = 0;
    let totalActual = 0;
    for (const t of completedTasks) {
      if (t.actualMinutes > 0) {
        totalEstimated += t.estimatedMinutes;
        totalActual += t.actualMinutes;
      }
    }

    return {
      taskTrends,
      habitsSummary: habits,
      focusTrends,
      workloadByCategory,
      estimationComparison: {
        totalEstimatedHours: +(totalEstimated / 60).toFixed(1),
        totalActualHours: +(totalActual / 60).toFixed(1),
        accuracyRatio: totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 100,
      },
      compassionateNote:
        "Consistency is a rhythm, not a prison. Notice where energy flowed naturally and adjust where friction arose.",
    };
  },
};
