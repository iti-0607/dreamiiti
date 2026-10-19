import { prisma } from '../prisma.js';
import { GoalService } from './goal.service.js';

export const MilestoneService = {
  async createMilestone(userId: string, data: { goalId: string; title: string; description?: string; targetDate?: string }) {
    const goal = await prisma.goal.findFirst({
      where: { id: data.goalId, userId },
    });
    if (!goal) throw new Error('Goal not found or unauthorized.');

    const count = await prisma.milestone.count({ where: { goalId: data.goalId } });

    const milestone = await prisma.milestone.create({
      data: {
        userId,
        goalId: data.goalId,
        title: data.title.trim(),
        description: data.description?.trim(),
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        order: count,
      },
    });

    await GoalService.recalculateGoalProgress(userId, data.goalId);
    return milestone;
  },

  async toggleMilestone(userId: string, milestoneId: string) {
    const milestone = await prisma.milestone.findFirst({
      where: { id: milestoneId, userId },
    });
    if (!milestone) throw new Error('Milestone not found or unauthorized.');

    const isCompleted = !milestone.isCompleted;
    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    await GoalService.recalculateGoalProgress(userId, milestone.goalId);
    return updated;
  },

  async deleteMilestone(userId: string, milestoneId: string) {
    const milestone = await prisma.milestone.findFirst({
      where: { id: milestoneId, userId },
    });
    if (!milestone) throw new Error('Milestone not found or unauthorized.');

    await prisma.milestone.delete({ where: { id: milestoneId } });
    await GoalService.recalculateGoalProgress(userId, milestone.goalId);
    return { success: true };
  },
};
