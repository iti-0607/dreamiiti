import { prisma } from '../prisma.js';
import { GoalService } from './goal.service.js';

export const TaskService = {
  async getTasks(userId: string, filters?: {
    view?: 'today' | 'upcoming' | 'overdue' | 'all' | 'completed' | 'unscheduled';
    goalId?: string;
    priority?: string;
    search?: string;
  }) {
    const where: any = { userId };
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (filters?.goalId) {
      where.goalId = filters.goalId;
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      where.priority = filters.priority;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters?.view === 'today') {
      where.OR = [
        { dueDate: { gte: startOfToday, lte: endOfToday } },
        { scheduledStart: { gte: startOfToday, lte: endOfToday } },
        {
          AND: [
            { dueDate: null },
            { scheduledStart: null },
            { status: { not: 'COMPLETED' } },
            { priority: 'MUST_DO' },
          ],
        },
      ];
    } else if (filters?.view === 'upcoming') {
      where.dueDate = { gt: endOfToday };
      where.status = { not: 'COMPLETED' };
    } else if (filters?.view === 'overdue') {
      where.dueDate = { lt: startOfToday };
      where.status = { not: 'COMPLETED' };
    } else if (filters?.view === 'completed') {
      where.status = 'COMPLETED';
    } else if (filters?.view === 'unscheduled') {
      where.scheduledStart = null;
      where.status = { not: 'COMPLETED' };
    }

    return prisma.task.findMany({
      where,
      include: {
        goal: {
          select: { id: true, title: true, dream: { select: { id: true, title: true, coverColor: true } } },
        },
        milestone: { select: { id: true, title: true } },
        subtaskItems: { orderBy: { order: 'asc' } },
        scheduledBlocks: true,
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  },

  async createTask(userId: string, data: {
    title: string;
    description?: string;
    goalId?: string;
    milestoneId?: string;
    priority?: string;
    dueDate?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    estimatedMinutes?: number;
    tags?: string;
    subtasks?: string[];
  }) {
    if (data.goalId) {
      const goal = await prisma.goal.findFirst({ where: { id: data.goalId, userId } });
      if (!goal) throw new Error('Goal not found or unauthorized.');
    }

    const task = await prisma.task.create({
      data: {
        userId,
        title: data.title.trim(),
        description: data.description?.trim(),
        goalId: data.goalId || null,
        milestoneId: data.milestoneId || null,
        priority: data.priority || 'SHOULD_DO',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : null,
        scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : null,
        estimatedMinutes: data.estimatedMinutes || 30,
        tags: data.tags || null,
        status: 'TODO',
      },
    });

    if (data.subtasks && data.subtasks.length > 0) {
      for (let i = 0; i < data.subtasks.length; i++) {
        if (data.subtasks[i].trim()) {
          await prisma.subtask.create({
            data: {
              taskId: task.id,
              title: data.subtasks[i].trim(),
              order: i,
            },
          });
        }
      }
    }

    if (data.goalId) {
      await GoalService.recalculateGoalProgress(userId, data.goalId);
    }

    return this.getTaskById(userId, task.id);
  },

  async getTaskById(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        goal: {
          select: { id: true, title: true, dream: { select: { id: true, title: true, coverColor: true } } },
        },
        milestone: true,
        subtaskItems: { orderBy: { order: 'asc' } },
        scheduledBlocks: true,
      },
    });
    if (!task) throw new Error('Task not found or unauthorized.');
    return task;
  },

  async updateTask(userId: string, taskId: string, data: any) {
    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!existing) throw new Error('Task not found or unauthorized.');

    const updatePayload: any = { ...data };
    if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.scheduledStart !== undefined) updatePayload.scheduledStart = data.scheduledStart ? new Date(data.scheduledStart) : null;
    if (data.scheduledEnd !== undefined) updatePayload.scheduledEnd = data.scheduledEnd ? new Date(data.scheduledEnd) : null;

    if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updatePayload.completedAt = new Date();
    } else if (data.status && data.status !== 'COMPLETED') {
      updatePayload.completedAt = null;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updatePayload,
    });

    if (existing.goalId) {
      await GoalService.recalculateGoalProgress(userId, existing.goalId);
    }
    if (data.goalId && data.goalId !== existing.goalId) {
      await GoalService.recalculateGoalProgress(userId, data.goalId);
    }

    return this.getTaskById(userId, taskId);
  },

  async deleteTask(userId: string, taskId: string) {
    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!existing) throw new Error('Task not found or unauthorized.');

    await prisma.task.delete({ where: { id: taskId } });
    if (existing.goalId) {
      await GoalService.recalculateGoalProgress(userId, existing.goalId);
    }
    return { success: true };
  },

  async toggleTaskCompletion(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new Error('Task not found or unauthorized.');

    const isCompleting = task.status !== 'COMPLETED';
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: isCompleting ? 'COMPLETED' : 'TODO',
        completedAt: isCompleting ? new Date() : null,
      },
    });

    if (task.goalId) {
      await GoalService.recalculateGoalProgress(userId, task.goalId);
    }

    return this.getTaskById(userId, taskId);
  },

  async addSubtask(userId: string, taskId: string, title: string) {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new Error('Task not found or unauthorized.');

    const count = await prisma.subtask.count({ where: { taskId } });
    return prisma.subtask.create({
      data: {
        taskId,
        title: title.trim(),
        order: count,
      },
    });
  },

  async toggleSubtask(userId: string, subtaskId: string) {
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: true },
    });
    if (!subtask || subtask.task.userId !== userId) {
      throw new Error('Subtask not found or unauthorized.');
    }

    return prisma.subtask.update({
      where: { id: subtaskId },
      data: { isCompleted: !subtask.isCompleted },
    });
  },

  async deleteSubtask(userId: string, subtaskId: string) {
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: true },
    });
    if (!subtask || subtask.task.userId !== userId) {
      throw new Error('Subtask not found or unauthorized.');
    }

    await prisma.subtask.delete({ where: { id: subtaskId } });
    return { success: true };
  },

  // Anti-procrastination: Help Me Start engine
  async helpMeStart(userId: string, taskId: string, reason: string) {
    const task = await this.getTaskById(userId, taskId);

    const guidanceMap: Record<string, { advice: string; microStep: string; recommendedAction: string }> = {
      too_big: {
        advice: 'Large tasks trigger avoidance because the brain craves clear finishes. We will shrink it to a 5-minute doorway step.',
        microStep: `Open the workspace or notes and write just the first sentence or outline for: "${task.title}".`,
        recommendedAction: 'break_down',
      },
      dont_know_start: {
        advice: 'Uncertainty is normal before clarity arrives. The best first move is gathering the 1 link or 1 file you need.',
        microStep: 'Spend 3 minutes locating the required document, tool, or reference link.',
        recommendedAction: 'prep_work',
      },
      distracted: {
        advice: 'Distraction is usually just friction. Close extraneous browser tabs and silence notifications for 15 minutes.',
        microStep: 'Put phone in another room or turn on do-not-disturb, then set a 15-minute timer.',
        recommendedAction: 'focus_mode',
      },
      low_energy: {
        advice: 'Honor your low energy without guilt. Doing 5% is infinitely better than 0%.',
        microStep: 'Do a minimal 5-minute pass with zero expectation of perfection.',
        recommendedAction: 'minimum_viable_day',
      },
      fear_badly: {
        advice: 'Lower the bar deliberately. Give yourself permission to make a messy first draft.',
        microStep: 'Create a "garbage draft" document where mistakes are completely welcomed.',
        recommendedAction: 'draft_mode',
      },
      default: {
        advice: 'Starting is the hardest moment. Once momentum begins, resistance dissolves.',
        microStep: `Commit to just 5 minutes on "${task.title}". If you want to stop after 5 minutes, you may.`,
        recommendedAction: '5_min_rule',
      },
    };

    const guidance = guidanceMap[reason] || guidanceMap.default;

    return {
      task,
      reason,
      guidance: guidance.advice,
      microStep: guidance.microStep,
      recommendedAction: guidance.recommendedAction,
    };
  },

  // Anti-procrastination: Make Today Lighter
  async makeTodayLighter(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);

    // Find today's uncompleted tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        status: { not: 'COMPLETED' },
        OR: [
          { dueDate: { gte: startOfToday, lte: endOfToday } },
          { scheduledStart: { gte: startOfToday, lte: endOfToday } },
        ],
      },
      orderBy: { priority: 'asc' }, // OPTIONAL, SHOULD_DO, MUST_DO
    });

    const keptTasks: any[] = [];
    const postponedTasks: any[] = [];

    // Keep up to 1 MUST_DO priority, postpone the rest to tomorrow gently
    let keptCount = 0;
    for (const task of tasks) {
      if (task.priority === 'MUST_DO' && keptCount < 1) {
        keptTasks.push(task);
        keptCount++;
      } else {
        await prisma.task.update({
          where: { id: task.id },
          data: {
            dueDate: tomorrow,
            scheduledStart: null,
            scheduledEnd: null,
          },
        });
        postponedTasks.push(task);
      }
    }

    return {
      message: 'Your day has been gently lightened. Focus only on what matters most today without guilt.',
      keptTasks,
      postponedCount: postponedTasks.length,
    };
  },

  // Anti-procrastination: Guilt-Free Restart
  async guiltFreeRestart(userId: string) {
    const activeDreams = await prisma.dream.count({ where: { userId, status: 'ACTIVE' } });
    const pendingTasks = await prisma.task.count({
      where: { userId, status: { not: 'COMPLETED' } },
    });

    return {
      welcomeBackMessage: "Welcome back! Life has natural pauses, and every day is a fresh place to start.",
      activeDreamsCount: activeDreams,
      pendingTasksCount: pendingTasks,
      gentleSuggestion: "Pick one gentle win for today, or take a quick 15-minute review to reset your focus.",
    };
  },
};
