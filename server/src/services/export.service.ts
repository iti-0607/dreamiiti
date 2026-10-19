import { prisma } from '../prisma.js';

export const ExportService = {
  async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        createdAt: true,
        profile: true,
        settings: true,
        lifeAreas: true,
        dreams: {
          include: {
            goals: {
              include: {
                milestones: true,
                tasks: {
                  include: { subtaskItems: true },
                },
              },
            },
          },
        },
        habits: {
          include: { logs: true },
        },
        focusSessions: true,
        moodEntries: true,
        journalEntries: true,
        weeklyReviews: true,
        monthlyReviews: true,
      },
    });

    if (!user) throw new Error('User not found.');

    return {
      exportedAt: new Date().toISOString(),
      platform: 'DreamIITi',
      version: '1.0',
      userData: user,
    };
  },

  async deleteAccount(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    // Cascade delete user
    await prisma.user.delete({ where: { id: userId } });
    return { success: true, message: 'Your account and all associated personal data have been completely deleted.' };
  },
};
