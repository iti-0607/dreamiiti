import { prisma } from '../prisma.js';

export const GoalService = {
  async getGoals(userId: string, filters?: { dreamId?: string; horizon?: string; status?: string }) {
    const where: any = { userId };

    if (filters?.dreamId) {
      where.dreamId = filters.dreamId;
    }

    if (filters?.horizon && filters.horizon !== 'ALL') {
      where.horizon = filters.horizon;
    }

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    return prisma.goal.findMany({
      where,
      include: {
        dream: {
          select: { id: true, title: true, coverColor: true },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
        tasks: {
          select: { id: true, title: true, status: true, priority: true, dueDate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getGoalById(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: {
        dream: true,
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              include: { subtaskItems: true },
            },
          },
        },
        tasks: {
          include: { subtaskItems: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!goal) {
      throw new Error('Goal not found or unauthorized.');
    }

    return goal;
  },

  async createGoal(userId: string, data: {
    dreamId?: string;
    title: string;
    description?: string;
    horizon?: string;
    startDate?: string;
    targetDate?: string;
    importance?: string;
    estimatedHours?: number;
    successCriteria?: string;
    milestones?: { title: string; targetDate?: string }[];
  }) {
    // If dreamId is specified, ensure it belongs to the authenticated user
    if (data.dreamId) {
      const dream = await prisma.dream.findFirst({
        where: { id: data.dreamId, userId },
      });
      if (!dream) {
        throw new Error('Associated dream not found or unauthorized.');
      }
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        dreamId: data.dreamId || null,
        title: data.title.trim(),
        description: data.description?.trim(),
        horizon: data.horizon || 'MONTHLY',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        importance: data.importance || 'MEDIUM',
        estimatedHours: data.estimatedHours || 0,
        successCriteria: data.successCriteria?.trim(),
        status: 'IN_PROGRESS',
        progress: 0,
      },
    });

    // Create initial milestones if supplied
    if (data.milestones && data.milestones.length > 0) {
      for (let i = 0; i < data.milestones.length; i++) {
        const m = data.milestones[i];
        await prisma.milestone.create({
          data: {
            userId,
            goalId: goal.id,
            title: m.title.trim(),
            order: i,
            targetDate: m.targetDate ? new Date(m.targetDate) : null,
          },
        });
      }
    }

    return this.getGoalById(userId, goal.id);
  },

  async updateGoal(userId: string, goalId: string, data: any) {
    const existing = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existing) {
      throw new Error('Goal not found or unauthorized.');
    }

    const updatePayload: any = { ...data };
    if (data.startDate) updatePayload.startDate = new Date(data.startDate);
    if (data.targetDate) updatePayload.targetDate = new Date(data.targetDate);

    await prisma.goal.update({
      where: { id: goalId },
      data: updatePayload,
    });

    await this.recalculateGoalProgress(userId, goalId);

    return this.getGoalById(userId, goalId);
  },

  async deleteGoal(userId: string, goalId: string) {
    const existing = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existing) {
      throw new Error('Goal not found or unauthorized.');
    }

    return prisma.goal.delete({
      where: { id: goalId },
    });
  },

  async recalculateGoalProgress(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: {
        milestones: true,
        tasks: true,
      },
    });

    if (!goal) return;

    let progress = 0;
    const totalMilestones = goal.milestones.length;
    const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;

    const totalTasks = goal.tasks.length;
    const completedTasks = goal.tasks.filter((t) => t.status === 'COMPLETED').length;

    if (totalMilestones > 0 && totalTasks > 0) {
      const milestonePart = (completedMilestones / totalMilestones) * 50;
      const taskPart = (completedTasks / totalTasks) * 50;
      progress = Math.round(milestonePart + taskPart);
    } else if (totalMilestones > 0) {
      progress = Math.round((completedMilestones / totalMilestones) * 100);
    } else if (totalTasks > 0) {
      progress = Math.round((completedTasks / totalTasks) * 100);
    }

    await prisma.goal.update({
      where: { id: goalId },
      data: {
        progress,
        status: progress === 100 ? 'COMPLETED' : goal.status === 'COMPLETED' ? 'IN_PROGRESS' : goal.status,
      },
    });
  },

  async toggleGoal(userId: string, goalId: string) {
    const existing = await prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: { milestones: true },
    });

    if (!existing) {
      throw new Error('Goal not found or unauthorized.');
    }

    const isCompleting = existing.status !== 'COMPLETED';
    const newStatus = isCompleting ? 'COMPLETED' : 'IN_PROGRESS';
    const newProgress = isCompleting ? 100 : 0;

    await prisma.goal.update({
      where: { id: goalId },
      data: {
        status: newStatus,
        progress: newProgress,
      },
    });

    // Also update associated milestones to match completion state
    if (existing.milestones.length > 0) {
      await prisma.milestone.updateMany({
        where: { goalId },
        data: {
          isCompleted: isCompleting,
          completedAt: isCompleting ? new Date() : null,
        },
      });
    }

    return this.getGoalById(userId, goalId);
  },
};

