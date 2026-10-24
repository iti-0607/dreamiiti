import { prisma } from '../prisma.js';

export const GoalPointService = {
  async getSixMonthOverview(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lifePurpose: true,
        sixMonthGoalTitle: true,
        sixMonthGoalDesc: true,
        sixMonthGoalTarget: true,
        coinBalance: true,
      },
    });
    if (!user) throw new Error('User not found.');

    const points = await prisma.goalPoint.findMany({
      where: { userId },
      include: {
        tasks: {
          select: { id: true, title: true, status: true, priority: true, dueDate: true, rewardCoins: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    const totalPoints = points.length;
    const completedPoints = points.filter((p) => p.isCompleted).length;
    const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    return {
      lifePurpose: user.lifePurpose,
      sixMonthGoalTitle: user.sixMonthGoalTitle,
      sixMonthGoalDesc: user.sixMonthGoalDesc,
      sixMonthGoalTarget: user.sixMonthGoalTarget,
      progress,
      points,
    };
  },

  async updateSixMonthGoal(
    userId: string,
    data: {
      lifePurpose?: string;
      sixMonthGoalTitle?: string;
      sixMonthGoalDesc?: string;
      sixMonthGoalTarget?: string;
    }
  ) {
    const updateData: any = {};
    if (data.lifePurpose !== undefined) updateData.lifePurpose = data.lifePurpose?.trim() || null;
    if (data.sixMonthGoalTitle !== undefined) updateData.sixMonthGoalTitle = data.sixMonthGoalTitle?.trim() || null;
    if (data.sixMonthGoalDesc !== undefined) updateData.sixMonthGoalDesc = data.sixMonthGoalDesc?.trim() || null;
    if (data.sixMonthGoalTarget !== undefined) {
      updateData.sixMonthGoalTarget = data.sixMonthGoalTarget ? new Date(data.sixMonthGoalTarget) : null;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.getSixMonthOverview(userId);
  },

  async createPoint(
    userId: string,
    data: {
      title: string;
      description?: string;
      targetDate?: string;
    }
  ) {
    const count = await prisma.goalPoint.count({ where: { userId } });

    return prisma.goalPoint.create({
      data: {
        userId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        order: count,
      },
      include: { tasks: true },
    });
  },

  async updatePoint(
    userId: string,
    pointId: string,
    data: {
      title?: string;
      description?: string;
      targetDate?: string;
      order?: number;
      isCompleted?: boolean;
    }
  ) {
    const existing = await prisma.goalPoint.findFirst({ where: { id: pointId, userId } });
    if (!existing) throw new Error('Goal point not found or unauthorized.');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.targetDate !== undefined) {
      updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    }
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isCompleted !== undefined) {
      updateData.isCompleted = data.isCompleted;
      updateData.completedAt = data.isCompleted ? new Date() : null;
    }

    return prisma.goalPoint.update({
      where: { id: pointId },
      data: updateData,
      include: { tasks: true },
    });
  },

  async togglePoint(userId: string, pointId: string) {
    const existing = await prisma.goalPoint.findFirst({ where: { id: pointId, userId } });
    if (!existing) throw new Error('Goal point not found or unauthorized.');

    const isCompleted = !existing.isCompleted;
    return prisma.goalPoint.update({
      where: { id: pointId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: { tasks: true },
    });
  },

  async deletePoint(userId: string, pointId: string) {
    const existing = await prisma.goalPoint.findFirst({ where: { id: pointId, userId } });
    if (!existing) throw new Error('Goal point not found or unauthorized.');

    await prisma.goalPoint.delete({ where: { id: pointId } });
    return { success: true };
  },

  async reorderPoints(userId: string, pointIds: string[]) {
    for (let i = 0; i < pointIds.length; i++) {
      await prisma.goalPoint.updateMany({
        where: { id: pointIds[i], userId },
        data: { order: i },
      });
    }

    return prisma.goalPoint.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: { tasks: true },
    });
  },
};
