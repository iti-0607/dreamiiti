import { prisma } from '../prisma.js';

export const CalendarService = {
  async getScheduledBlocks(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate && endDate) {
      where.startTime = { gte: new Date(startDate) };
      where.endTime = { lte: new Date(endDate) };
    }

    return prisma.scheduledBlock.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            goal: { select: { id: true, title: true, dream: { select: { coverColor: true } } } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  },

  async createScheduledBlock(userId: string, data: {
    taskId?: string;
    title: string;
    startTime: string;
    endTime: string;
    isBreak?: boolean;
    color?: string;
    isOverride?: boolean;
  }) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (end <= start) {
      throw new Error('End time must be after start time.');
    }

    // Check for overlapping blocks
    const conflicts = await prisma.scheduledBlock.findMany({
      where: {
        userId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
      include: { task: true },
    });

    if (conflicts.length > 0 && !data.isOverride) {
      return {
        hasConflict: true,
        conflicts: conflicts.map((c) => ({
          id: c.id,
          title: c.title,
          startTime: c.startTime,
          endTime: c.endTime,
        })),
        warning: `This time slot overlaps with ${conflicts.length} existing scheduled block(s). You may adjust the time or choose to override.`,
      };
    }

    const block = await prisma.scheduledBlock.create({
      data: {
        userId,
        taskId: data.taskId || null,
        title: data.title.trim(),
        startTime: start,
        endTime: end,
        isBreak: data.isBreak || false,
        color: data.color || '#2E6F52',
        isOverride: data.isOverride || false,
      },
      include: { task: true },
    });

    // If linked to a task, update task's scheduled dates
    if (data.taskId) {
      await prisma.task.update({
        where: { id: data.taskId },
        data: {
          scheduledStart: start,
          scheduledEnd: end,
        },
      });
    }

    return { hasConflict: false, block };
  },

  async updateScheduledBlock(userId: string, blockId: string, data: any) {
    const existing = await prisma.scheduledBlock.findFirst({
      where: { id: blockId, userId },
    });

    if (!existing) throw new Error('Scheduled block not found or unauthorized.');

    const updatePayload: any = { ...data };
    if (data.startTime) updatePayload.startTime = new Date(data.startTime);
    if (data.endTime) updatePayload.endTime = new Date(data.endTime);

    if (updatePayload.startTime && updatePayload.endTime && updatePayload.endTime <= updatePayload.startTime) {
      throw new Error('End time must be after start time.');
    }

    // Check conflict if times changed
    if ((data.startTime || data.endTime) && !data.isOverride) {
      const start = updatePayload.startTime || existing.startTime;
      const end = updatePayload.endTime || existing.endTime;

      const conflicts = await prisma.scheduledBlock.findMany({
        where: {
          userId,
          id: { not: blockId },
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });

      if (conflicts.length > 0) {
        return {
          hasConflict: true,
          conflicts: conflicts.map((c) => ({
            id: c.id,
            title: c.title,
            startTime: c.startTime,
            endTime: c.endTime,
          })),
          warning: 'This change causes an overlap with existing blocks. Choose override to proceed anyway.',
        };
      }
    }

    const updated = await prisma.scheduledBlock.update({
      where: { id: blockId },
      data: updatePayload,
      include: { task: true },
    });

    if (updated.taskId) {
      await prisma.task.update({
        where: { id: updated.taskId },
        data: {
          scheduledStart: updated.startTime,
          scheduledEnd: updated.endTime,
        },
      });
    }

    return { hasConflict: false, block: updated };
  },

  async deleteScheduledBlock(userId: string, blockId: string) {
    const existing = await prisma.scheduledBlock.findFirst({
      where: { id: blockId, userId },
    });
    if (!existing) throw new Error('Scheduled block not found or unauthorized.');

    if (existing.taskId) {
      await prisma.task.update({
        where: { id: existing.taskId },
        data: { scheduledStart: null, scheduledEnd: null },
      });
    }

    await prisma.scheduledBlock.delete({ where: { id: blockId } });
    return { success: true };
  },

  // Reschedule or triage unfinished work
  async resolveUnfinishedWork(userId: string, action: 'tomorrow' | 'backlog' | 'cancel', taskIds: string[]) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    for (const id of taskIds) {
      const task = await prisma.task.findFirst({ where: { id, userId } });
      if (!task) continue;

      if (action === 'tomorrow') {
        await prisma.task.update({
          where: { id },
          data: { dueDate: tomorrow, scheduledStart: null, scheduledEnd: null },
        });
        await prisma.scheduledBlock.deleteMany({ where: { taskId: id } });
      } else if (action === 'backlog') {
        await prisma.task.update({
          where: { id },
          data: { dueDate: null, scheduledStart: null, scheduledEnd: null },
        });
        await prisma.scheduledBlock.deleteMany({ where: { taskId: id } });
      } else if (action === 'cancel') {
        await prisma.task.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });
      }
    }

    return { success: true, message: `Updated ${taskIds.length} tasks successfully.` };
  },
};
