import { prisma } from '../prisma.js';

export const ReviewService = {
  async getWeeklyReviewDraft(userId: string) {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(now.setDate(diff));
    const weekStartDate = monday.toISOString().split('T')[0];

    // Compute planned vs completed tasks over past 7 days
    const past7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: past7Days },
      },
    });

    const plannedTasksCount = tasks.length;
    const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

    // Focus session minutes over past 7 days
    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: past7Days },
        status: { in: ['COMPLETED', 'STOPPED_EARLY'] },
      },
    });
    const focusMinutes = focusSessions.reduce((acc, s) => acc + s.actualMinutes, 0);

    // Habit completion rate
    const habits = await prisma.habit.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        logs: {
          where: { isCompleted: true, createdAt: { gte: past7Days } },
        },
      },
    });

    let totalPossibleHabits = habits.length * 7;
    let loggedHabits = habits.reduce((acc, h) => acc + h.logs.length, 0);
    const habitRate = totalPossibleHabits > 0 ? Math.round((loggedHabits / totalPossibleHabits) * 100) : 0;

    // Existing review record if already submitted
    const existingReview = await prisma.weeklyReview.findFirst({
      where: { userId, weekStartDate },
      orderBy: { createdAt: 'desc' },
    });

    return {
      weekStartDate,
      plannedTasksCount,
      completedTasksCount,
      habitRate,
      focusMinutes,
      review: existingReview || null,
    };
  },

  async submitWeeklyReview(userId: string, data: {
    weekStartDate: string;
    plannedTasksCount?: number;
    completedTasksCount?: number;
    habitRate?: number;
    focusMinutes?: number;
    wins?: string;
    struggles?: string;
    continuationNotes?: string;
    nextWeekPriorities?: string;
  }) {
    return prisma.weeklyReview.create({
      data: {
        userId,
        weekStartDate: data.weekStartDate,
        plannedTasksCount: data.plannedTasksCount || 0,
        completedTasksCount: data.completedTasksCount || 0,
        habitRate: data.habitRate || 0,
        focusMinutes: data.focusMinutes || 0,
        wins: data.wins?.trim() || null,
        struggles: data.struggles?.trim() || null,
        continuationNotes: data.continuationNotes?.trim() || null,
        nextWeekPriorities: data.nextWeekPriorities?.trim() || null,
      },
    });
  },

  async getReviewsHistory(userId: string) {
    const weekly = await prisma.weeklyReview.findMany({
      where: { userId },
      orderBy: { weekStartDate: 'desc' },
      take: 20,
    });
    const monthly = await prisma.monthlyReview.findMany({
      where: { userId },
      orderBy: { yearMonth: 'desc' },
      take: 12,
    });
    return { weekly, monthly };
  },

  async submitMonthlyReview(userId: string, data: {
    yearMonth: string;
    wins?: string;
    milestonesCompleted?: number;
    goalsEvaluated?: number;
    reflections?: string;
  }) {
    return prisma.monthlyReview.create({
      data: {
        userId,
        yearMonth: data.yearMonth,
        wins: data.wins?.trim() || null,
        milestonesCompleted: data.milestonesCompleted || 0,
        goalsEvaluated: data.goalsEvaluated || 0,
        reflections: data.reflections?.trim() || null,
      },
    });
  },
};
