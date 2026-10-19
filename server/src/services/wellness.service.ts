import { prisma } from '../prisma.js';

export const WellnessService = {
  async getTodayCheckIn(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    return prisma.moodEntry.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });
  },

  async saveCheckIn(userId: string, data: { mood: string; energy: string; stress?: string; notes?: string }) {
    const today = new Date().toISOString().split('T')[0];

    return prisma.moodEntry.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        mood: data.mood,
        energy: data.energy,
        stress: data.stress || null,
        notes: data.notes?.trim() || null,
      },
      create: {
        userId,
        date: today,
        mood: data.mood,
        energy: data.energy,
        stress: data.stress || null,
        notes: data.notes?.trim() || null,
      },
    });
  },

  async getRecentCheckIns(userId: string, days = 14) {
    return prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: days,
    });
  },

  async getJournalEntries(userId: string, search?: string) {
    const where: any = { userId };
    if (search) {
      where.OR = [
        { content: { contains: search } },
        { prompt: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    return prisma.journalEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 50,
    });
  },

  async createJournalEntry(userId: string, data: { date?: string; prompt?: string; content: string; tags?: string }) {
    const entryDate = data.date || new Date().toISOString().split('T')[0];

    return prisma.journalEntry.create({
      data: {
        userId,
        date: entryDate,
        prompt: data.prompt?.trim() || null,
        content: data.content.trim(),
        tags: data.tags?.trim() || null,
      },
    });
  },

  async updateJournalEntry(userId: string, entryId: string, data: { content: string; tags?: string }) {
    const existing = await prisma.journalEntry.findFirst({ where: { id: entryId, userId } });
    if (!existing) throw new Error('Journal entry not found or unauthorized.');

    return prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        content: data.content.trim(),
        tags: data.tags?.trim() || null,
      },
    });
  },

  async deleteJournalEntry(userId: string, entryId: string) {
    const existing = await prisma.journalEntry.findFirst({ where: { id: entryId, userId } });
    if (!existing) throw new Error('Journal entry not found or unauthorized.');

    await prisma.journalEntry.delete({ where: { id: entryId } });
    return { success: true };
  },

  getPrompts() {
    return [
      "What felt surprisingly manageable today?",
      "What friction or resistance did I notice before starting?",
      "What is one small accomplishment I can acknowledge myself for?",
      "What would make tomorrow 10% simpler?",
      "What unrealistic expectation can I release right now?",
      "What energized me today, even for a moment?",
    ];
  },
};
