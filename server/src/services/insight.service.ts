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

  async getContributionHeatmap(userId: string, clientToday?: string) {
    const now = new Date();
    const todayIso = (clientToday && /^\d{4}-\d{2}-\d{2}$/.test(clientToday))
      ? clientToday
      : now.toISOString().split('T')[0];

    // 52 weeks = 364 days
    const daysCount = 364;
    const targetEndDate = new Date(todayIso + 'T23:59:59.999Z');
    const startDate = new Date(targetEndDate);
    startDate.setDate(targetEndDate.getDate() - daysCount + 1);
    startDate.setHours(0, 0, 0, 0);

    const startDateIso = startDate.toISOString().split('T')[0];

    // 1. Fetch completed tasks (checking both completedAt and updatedAt)
    const completedTasks = await prisma.task.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        OR: [
          { completedAt: { gte: startDate } },
          { updatedAt: { gte: startDate } },
        ],
      },
      select: { id: true, completedAt: true, updatedAt: true },
    });

    // 2. Fetch completed goal points (goals ticked off by user)
    const completedGoalPoints = await prisma.goalPoint.findMany({
      where: {
        userId,
        isCompleted: true,
        OR: [
          { completedAt: { gte: startDate } },
          { updatedAt: { gte: startDate } },
        ],
      },
      select: { id: true, completedAt: true, updatedAt: true },
    });

    // 3. Fetch completed milestones
    const completedMilestones = await prisma.milestone.findMany({
      where: {
        userId,
        isCompleted: true,
        OR: [
          { completedAt: { gte: startDate } },
          { updatedAt: { gte: startDate } },
        ],
      },
      select: { id: true, completedAt: true, updatedAt: true },
    });

    // 4. Fetch completed goals
    const completedGoals = await prisma.goal.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        updatedAt: { gte: startDate },
      },
      select: { id: true, updatedAt: true },
    });

    // 5. Fetch scheduled tasks
    const scheduledTasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: startDate },
      },
      select: { id: true, dueDate: true },
    });

    // 6. Fetch completed habit logs
    const habitLogs = await prisma.habitLog.findMany({
      where: {
        userId,
        isCompleted: true,
        date: { gte: startDateIso },
      },
      select: { id: true, date: true, habitId: true },
    });

    // 7. Fetch active habits for expected calculation
    const activeHabits = await prisma.habit.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { id: true, frequency: true, selectedWeekdays: true },
    });

    // 8. Fetch coin transactions
    const coinTransactions = await prisma.coinTransaction.findMany({
      where: {
        userId,
        type: 'REWARD',
        amount: { gt: 0 },
        createdAt: { gte: startDate },
      },
      select: { amount: true, createdAt: true },
    });

    // Map by date
    const tasksCompletedMap: Record<string, number> = {};

    for (const t of completedTasks) {
      const dateObj = t.completedAt || t.updatedAt;
      if (dateObj) {
        const d = dateObj.toISOString().split('T')[0];
        tasksCompletedMap[d] = (tasksCompletedMap[d] || 0) + 1;
      }
    }

    for (const gp of completedGoalPoints) {
      const dateObj = gp.completedAt || gp.updatedAt;
      if (dateObj) {
        const d = dateObj.toISOString().split('T')[0];
        tasksCompletedMap[d] = (tasksCompletedMap[d] || 0) + 1;
      }
    }

    for (const m of completedMilestones) {
      const dateObj = m.completedAt || m.updatedAt;
      if (dateObj) {
        const d = dateObj.toISOString().split('T')[0];
        tasksCompletedMap[d] = (tasksCompletedMap[d] || 0) + 1;
      }
    }

    for (const g of completedGoals) {
      if (g.updatedAt) {
        const d = g.updatedAt.toISOString().split('T')[0];
        tasksCompletedMap[d] = (tasksCompletedMap[d] || 0) + 1;
      }
    }

    const tasksScheduledMap: Record<string, number> = {};
    for (const t of scheduledTasks) {
      if (t.dueDate) {
        const d = t.dueDate.toISOString().split('T')[0];
        tasksScheduledMap[d] = (tasksScheduledMap[d] || 0) + 1;
      }
    }

    const habitsCompletedMap: Record<string, number> = {};
    for (const h of habitLogs) {
      habitsCompletedMap[h.date] = (habitsCompletedMap[h.date] || 0) + 1;
    }

    const coinsEarnedMap: Record<string, number> = {};
    for (const c of coinTransactions) {
      const d = c.createdAt.toISOString().split('T')[0];
      coinsEarnedMap[d] = (coinsEarnedMap[d] || 0) + c.amount;
    }

    // Build day-by-day entries
    const days: Array<{
      date: string;
      dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
      tasksCompleted: number;
      tasksScheduled: number;
      habitsCompleted: number;
      habitsExpected: number;
      coinsEarned: number;
      totalActivity: number;
      level: number;
      isToday: boolean;
    }> = [];

    const cursor = new Date(startDate);
    while (cursor <= targetEndDate) {
      const dStr = cursor.toISOString().split('T')[0];
      const dow = cursor.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
      // Iso weekday 1=Mon..7=Sun
      const isoWeekday = dow === 0 ? 7 : dow;

      let habitsExpected = 0;
      for (const h of activeHabits) {
        if (h.frequency === 'DAILY') {
          habitsExpected++;
        } else if (h.frequency === 'WEEKDAYS') {
          if (isoWeekday >= 1 && isoWeekday <= 5) habitsExpected++;
        } else if (h.selectedWeekdays) {
          const selected = h.selectedWeekdays.split(',').map((s) => parseInt(s.trim(), 10));
          if (selected.includes(isoWeekday)) habitsExpected++;
        }
      }

      const tasksCompleted = tasksCompletedMap[dStr] || 0;
      const tasksScheduled = tasksScheduledMap[dStr] || 0;
      const habitsCompleted = habitsCompletedMap[dStr] || 0;
      const coinsEarned = coinsEarnedMap[dStr] || 0;
      const totalActivity = tasksCompleted + habitsCompleted;

      let level = 0;
      if (totalActivity === 1) level = 1;
      else if (totalActivity >= 2 && totalActivity <= 3) level = 2;
      else if (totalActivity >= 4 && totalActivity <= 5) level = 3;
      else if (totalActivity >= 6) level = 4;

      days.push({
        date: dStr,
        dayOfWeek: dow,
        tasksCompleted,
        tasksScheduled,
        habitsCompleted,
        habitsExpected,
        coinsEarned,
        totalActivity,
        level,
        isToday: dStr === todayIso,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let activeDays = 0;

    for (let i = 0; i < days.length; i++) {
      if (days[i].totalActivity > 0) {
        activeDays++;
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // Current streak calculation:
    // If today is active, count backwards from today.
    // If today is not active yet, check yesterday (day is in-progress).
    const todayIndex = days.findIndex((d) => d.date === todayIso);
    if (todayIndex >= 0) {
      if (days[todayIndex].totalActivity > 0) {
        for (let i = todayIndex; i >= 0; i--) {
          if (days[i].totalActivity > 0) currentStreak++;
          else break;
        }
      } else if (todayIndex > 0 && days[todayIndex - 1].totalActivity > 0) {
        for (let i = todayIndex - 1; i >= 0; i--) {
          if (days[i].totalActivity > 0) currentStreak++;
          else break;
        }
      }
    }

    const totalCompletedTasks =
      (await prisma.task.count({ where: { userId, status: 'COMPLETED' } })) +
      (await prisma.goalPoint.count({ where: { userId, isCompleted: true } })) +
      (await prisma.milestone.count({ where: { userId, isCompleted: true } })) +
      (await prisma.goal.count({ where: { userId, status: 'COMPLETED' } }));

    const todayDay = days.find((d) => d.date === todayIso);

    return {
      days,
      currentStreak,
      longestStreak,
      activeDays,
      totalCompletedTasks,
      today: todayIso,
      todayActive: (todayDay?.totalActivity || 0) > 0,
      todayCompletedCount: todayDay?.totalActivity || 0,
    };
  },
};
