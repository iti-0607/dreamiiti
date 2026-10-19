import { prisma } from '../prisma.js';

export const FocusService = {
  async startSession(userId: string, data: { taskId?: string; targetMinutes?: number }) {
    if (data.taskId) {
      const task = await prisma.task.findFirst({ where: { id: data.taskId, userId } });
      if (!task) throw new Error('Task not found or unauthorized.');
    }

    return prisma.focusSession.create({
      data: {
        userId,
        taskId: data.taskId || null,
        targetMinutes: data.targetMinutes || 25,
        startedAt: new Date(),
        status: 'IN_PROGRESS',
      },
      include: { task: true },
    });
  },

  async endSession(userId: string, sessionId: string, data: { status?: 'COMPLETED' | 'STOPPED_EARLY' | 'CANCELLED'; notes?: string }) {
    const session = await prisma.focusSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new Error('Focus session not found or unauthorized.');

    const endedAt = new Date();
    const elapsedMs = endedAt.getTime() - new Date(session.startedAt).getTime();
    const actualMinutes = Math.max(1, Math.round(elapsedMs / (1000 * 60)));

    const updated = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        actualMinutes,
        status: data.status || 'COMPLETED',
        notes: data.notes || null,
      },
      include: { task: true },
    });

    // If attached to a task, increment task actualMinutes
    if (session.taskId && (data.status === 'COMPLETED' || data.status === 'STOPPED_EARLY')) {
      await prisma.task.update({
        where: { id: session.taskId },
        data: {
          actualMinutes: { increment: actualMinutes },
        },
      });
    }

    return updated;
  },

  async getSessions(userId: string) {
    return prisma.focusSession.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  },

  async getTodayFocusStats(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const sessions = await prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: startOfToday },
        status: { in: ['COMPLETED', 'STOPPED_EARLY'] },
      },
    });

    const totalMinutes = sessions.reduce((acc, s) => acc + s.actualMinutes, 0);
    return {
      totalMinutes,
      completedSessionsCount: sessions.length,
      sessions,
    };
  },
};
