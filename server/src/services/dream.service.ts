import { prisma } from '../prisma.js';

export const DreamService = {
  async getDreams(userId: string, filters?: { lifeAreaId?: string; status?: string; search?: string }) {
    const where: any = { userId };

    if (filters?.lifeAreaId) {
      where.lifeAreaId = filters.lifeAreaId;
    }

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { motivation: { contains: filters.search } },
      ];
    }

    const dreams = await prisma.dream.findMany({
      where,
      include: {
        lifeArea: true,
        goals: {
          include: {
            milestones: true,
            tasks: {
              select: { id: true, status: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute live progress for each dream
    return dreams.map((dream) => {
      let progress = 0;
      if (dream.goals.length > 0) {
        const totalProgress = dream.goals.reduce((acc, g) => acc + g.progress, 0);
        progress = Math.round(totalProgress / dream.goals.length);
      } else if (dream.status === 'COMPLETED') {
        progress = 100;
      }

      return {
        ...dream,
        progress,
        goalsCount: dream.goals.length,
        milestonesCount: dream.goals.reduce((acc, g) => acc + g.milestones.length, 0),
        tasksCount: dream.goals.reduce((acc, g) => acc + g.tasks.length, 0),
        completedTasksCount: dream.goals.reduce(
          (acc, g) => acc + g.tasks.filter((t) => t.status === 'COMPLETED').length,
          0
        ),
      };
    });
  },

  async getDreamById(userId: string, dreamId: string) {
    const dream = await prisma.dream.findFirst({
      where: { id: dreamId, userId },
      include: {
        lifeArea: true,
        goals: {
          include: {
            milestones: {
              orderBy: { order: 'asc' },
            },
            tasks: {
              include: {
                subtaskItems: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!dream) {
      throw new Error('Dream not found or unauthorized.');
    }

    let progress = 0;
    if (dream.goals.length > 0) {
      const totalProgress = dream.goals.reduce((acc, g) => acc + g.progress, 0);
      progress = Math.round(totalProgress / dream.goals.length);
    } else if (dream.status === 'COMPLETED') {
      progress = 100;
    }

    return {
      ...dream,
      progress,
    };
  },

  async createDream(userId: string, data: {
    title: string;
    description?: string;
    motivation?: string;
    lifeAreaId?: string;
    timeframe?: string;
    targetDate?: string;
    coverColor?: string;
    priority?: string;
    successCriteria?: string;
  }) {
    return prisma.dream.create({
      data: {
        userId,
        title: data.title.trim(),
        description: data.description?.trim(),
        motivation: data.motivation?.trim(),
        lifeAreaId: data.lifeAreaId || null,
        timeframe: data.timeframe || '3_months',
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        coverColor: data.coverColor || '#2E6F52',
        priority: data.priority || 'MEDIUM',
        successCriteria: data.successCriteria?.trim(),
        status: 'ACTIVE',
        progress: 0,
      },
      include: { lifeArea: true },
    });
  },

  async updateDream(userId: string, dreamId: string, data: any) {
    const existing = await prisma.dream.findFirst({
      where: { id: dreamId, userId },
    });

    if (!existing) {
      throw new Error('Dream not found or unauthorized.');
    }

    const updatePayload: any = { ...data };
    if (data.targetDate) {
      updatePayload.targetDate = new Date(data.targetDate);
    }

    return prisma.dream.update({
      where: { id: dreamId },
      data: updatePayload,
      include: { lifeArea: true },
    });
  },

  async deleteDream(userId: string, dreamId: string) {
    const existing = await prisma.dream.findFirst({
      where: { id: dreamId, userId },
    });

    if (!existing) {
      throw new Error('Dream not found or unauthorized.');
    }

    return prisma.dream.delete({
      where: { id: dreamId },
    });
  },
};
