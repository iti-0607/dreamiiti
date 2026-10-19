import { prisma } from '../prisma.js';

export const HabitService = {
  async getHabits(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        lifeArea: true,
        logs: {
          orderBy: { date: 'desc' },
          take: 30, // Last 30 days of records
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return habits.map((h) => {
      const todayLog = h.logs.find((l) => l.date === today);
      const isCompletedToday = todayLog ? todayLog.isCompleted : false;

      return {
        ...h,
        isCompletedToday,
        logsCount: h.logs.filter((l) => l.isCompleted).length,
      };
    });
  },

  async createHabit(userId: string, data: {
    name: string;
    description?: string;
    lifeAreaId?: string;
    category?: string;
    frequency?: string;
    targetDaysPerWeek?: number;
    selectedWeekdays?: string;
    reminderTime?: string;
  }) {
    return prisma.habit.create({
      data: {
        userId,
        name: data.name.trim(),
        description: data.description?.trim(),
        lifeAreaId: data.lifeAreaId || null,
        category: data.category || 'Routine',
        frequency: data.frequency || 'DAILY',
        targetDaysPerWeek: data.targetDaysPerWeek || 7,
        selectedWeekdays: data.selectedWeekdays || '1,2,3,4,5,6,7',
        reminderTime: data.reminderTime || null,
        status: 'ACTIVE',
        currentStreak: 0,
        bestStreak: 0,
        plantStage: 'SEED',
      },
      include: { lifeArea: true },
    });
  },

  async updateHabit(userId: string, habitId: string, data: any) {
    const existing = await prisma.habit.findFirst({ where: { id: habitId, userId } });
    if (!existing) throw new Error('Habit not found or unauthorized.');

    return prisma.habit.update({
      where: { id: habitId },
      data,
      include: { lifeArea: true },
    });
  },

  async toggleHabitLog(userId: string, habitId: string, dateStr?: string) {
    const today = dateStr || new Date().toISOString().split('T')[0];

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
      include: { logs: { orderBy: { date: 'desc' } } },
    });
    if (!habit) throw new Error('Habit not found or unauthorized.');

    const existingLog = await prisma.habitLog.findUnique({
      where: {
        userId_habitId_date: {
          userId,
          habitId,
          date: today,
        },
      },
    });

    let isCompletedNow = true;
    if (existingLog) {
      isCompletedNow = !existingLog.isCompleted;
      await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { isCompleted: isCompletedNow },
      });
    } else {
      await prisma.habitLog.create({
        data: {
          userId,
          habitId,
          date: today,
          isCompleted: true,
        },
      });
    }

    // Recalculate streak compassionately
    const { currentStreak, bestStreak, plantStage } = await this.calculateCompassionateStreak(
      userId,
      habitId
    );

    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        currentStreak,
        bestStreak,
        plantStage,
      },
      include: { logs: { orderBy: { date: 'desc' }, take: 14 } },
    });

    return {
      habit: updatedHabit,
      isCompletedToday: isCompletedNow,
    };
  },

  // Compassionate streak algorithm:
  // Respects scheduled weekdays and does not treat non-scheduled days as a broken streak.
  async calculateCompassionateStreak(userId: string, habitId: string) {
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
      include: { logs: { where: { isCompleted: true }, orderBy: { date: 'desc' } } },
    });

    if (!habit || habit.logs.length === 0) {
      return { currentStreak: 0, bestStreak: habit?.bestStreak || 0, plantStage: 'SEED' };
    }

    const logDates = new Set(habit.logs.map((l) => l.date));
    const allowedDays = habit.selectedWeekdays
      ? habit.selectedWeekdays.split(',').map(Number)
      : [1, 2, 3, 4, 5, 6, 7];

    let streak = 0;
    const now = new Date();
    // Check backwards day by day
    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() - i);
      const isoDate = checkDate.toISOString().split('T')[0];
      const dayOfWeek = checkDate.getDay() === 0 ? 7 : checkDate.getDay();

      const isScheduledDay = allowedDays.includes(dayOfWeek);

      if (logDates.has(isoDate)) {
        streak++;
      } else if (i === 0 && !logDates.has(isoDate)) {
        // If today isn't completed yet, streak is still alive from yesterday
        continue;
      } else if (isScheduledDay) {
        // Missed a scheduled day; streak ends
        break;
      }
      // If it wasn't a scheduled day, it's a rest day! Keep streak alive and continue checking backwards.
    }

    const bestStreak = Math.max(habit.bestStreak, streak);

    let plantStage = 'SEED';
    if (streak >= 30) plantStage = 'FOREST';
    else if (streak >= 14) plantStage = 'BLOOM';
    else if (streak >= 7) plantStage = 'BUD';
    else if (streak >= 3) plantStage = 'SPROUT';

    return { currentStreak: streak, bestStreak, plantStage };
  },

  async deleteHabit(userId: string, habitId: string) {
    const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
    if (!habit) throw new Error('Habit not found or unauthorized.');

    await prisma.habit.delete({ where: { id: habitId } });
    return { success: true };
  },
};
