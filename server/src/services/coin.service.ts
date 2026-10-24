import { prisma } from '../prisma.js';

export const CoinService = {
  async getLedger(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true, defaultTaskReward: true, defaultPenalty: true, defaultPenaltyEnabled: true },
    });
    if (!user) throw new Error('User not found.');

    const transactions = await prisma.coinTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    let totalEarned = 0;
    let totalSpent = 0;
    let totalPenalties = 0;

    for (const tx of transactions) {
      if (tx.type === 'REWARD' && tx.amount > 0) {
        totalEarned += tx.amount;
      } else if (tx.type === 'REDEMPTION' && tx.amount < 0) {
        totalSpent += Math.abs(tx.amount);
      } else if (tx.type === 'PENALTY' && tx.amount < 0) {
        totalPenalties += Math.abs(tx.amount);
      }
    }

    return {
      balance: user.coinBalance,
      defaultTaskReward: user.defaultTaskReward,
      defaultPenalty: user.defaultPenalty,
      defaultPenaltyEnabled: user.defaultPenaltyEnabled,
      totalEarned,
      totalSpent,
      totalPenalties,
      transactions,
    };
  },

  async awardCoins(
    userId: string,
    amount: number,
    type: 'REWARD' | 'ADJUSTMENT',
    description: string,
    meta?: { taskId?: string; habitId?: string; idempotencyKey?: string }
  ) {
    if (amount <= 0) return null;

    if (meta?.idempotencyKey) {
      const existing = await prisma.coinTransaction.findUnique({
        where: { idempotencyKey: meta.idempotencyKey },
      });
      if (existing) return existing;
    }

    return prisma.$transaction(async (tx) => {
      const transaction = await tx.coinTransaction.create({
        data: {
          userId,
          amount,
          type,
          description,
          taskId: meta?.taskId || null,
          habitId: meta?.habitId || null,
          idempotencyKey: meta?.idempotencyKey || null,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { coinBalance: { increment: amount } },
      });

      return transaction;
    });
  },

  async settleMissedTasks(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const overdueTasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: { lt: startOfToday },
        status: { not: 'COMPLETED' },
        penaltyEnabled: true,
        penaltyCoins: { gt: 0 },
      },
    });

    let penaltiesApplied = 0;

    for (const task of overdueTasks) {
      const dateKey = task.dueDate ? task.dueDate.toISOString().split('T')[0] : 'overdue';
      const idempotencyKey = `penalty_task_${task.id}_${dateKey}`;

      const existing = await prisma.coinTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existing) continue;

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId }, select: { coinBalance: true } });
        const deduct = task.penaltyCoins;
        const newBalance = Math.max(0, (user?.coinBalance || 0) - deduct);

        await tx.coinTransaction.create({
          data: {
            userId,
            amount: -deduct,
            type: 'PENALTY',
            description: `Missed task penalty: ${task.title}`,
            taskId: task.id,
            idempotencyKey,
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { coinBalance: newBalance },
        });
      });

      penaltiesApplied++;
    }

    return { success: true, penaltiesApplied };
  },

  async getPersonalRewards(userId: string) {
    return prisma.personalReward.findMany({
      where: { userId },
      include: {
        _count: { select: { redemptions: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async createPersonalReward(userId: string, data: { name: string; description?: string; coinCost: number; icon?: string }) {
    return prisma.personalReward.create({
      data: {
        userId,
        name: data.name.trim(),
        description: data.description?.trim(),
        coinCost: Math.max(1, data.coinCost),
        icon: data.icon || 'Gift',
        active: true,
      },
    });
  },

  async updatePersonalReward(userId: string, rewardId: string, data: any) {
    const existing = await prisma.personalReward.findFirst({ where: { id: rewardId, userId } });
    if (!existing) throw new Error('Reward not found or unauthorized.');

    return prisma.personalReward.update({
      where: { id: rewardId },
      data,
    });
  },

  async deletePersonalReward(userId: string, rewardId: string) {
    const existing = await prisma.personalReward.findFirst({ where: { id: rewardId, userId } });
    if (!existing) throw new Error('Reward not found or unauthorized.');

    await prisma.personalReward.delete({ where: { id: rewardId } });
    return { success: true };
  },

  async redeemReward(userId: string, rewardId: string) {
    const reward = await prisma.personalReward.findFirst({
      where: { id: rewardId, userId, active: true },
    });
    if (!reward) throw new Error('Reward not found or not active.');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });
    if (!user || user.coinBalance < reward.coinCost) {
      throw new Error(`Insufficient coins. You have ${user?.coinBalance || 0} coins, but "${reward.name}" requires ${reward.coinCost} coins.`);
    }

    return prisma.$transaction(async (tx) => {
      const redemption = await tx.rewardRedemption.create({
        data: {
          userId,
          rewardId: reward.id,
          rewardName: reward.name,
          coinCost: reward.coinCost,
        },
      });

      await tx.coinTransaction.create({
        data: {
          userId,
          amount: -reward.coinCost,
          type: 'REDEMPTION',
          description: `Redeemed reward: ${reward.name}`,
          rewardId: reward.id,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { coinBalance: { decrement: reward.coinCost } },
        select: { coinBalance: true },
      });

      return {
        success: true,
        redemption,
        newBalance: updatedUser.coinBalance,
      };
    });
  },
};
