import { Router, Response } from 'express';
import { CoinService } from '../services/coin.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';
import { prisma } from '../prisma.js';

const router = Router();
router.use(requireAuth);

// Get coin ledger, balance, and transaction history
router.get('/ledger', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = await CoinService.getLedger(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

// Update default reward and penalty settings
router.put('/settings', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { defaultTaskReward, defaultPenalty, defaultPenaltyEnabled } = req.body;
    const updateData: any = {};
    if (defaultTaskReward !== undefined) updateData.defaultTaskReward = Math.max(0, parseInt(defaultTaskReward, 10));
    if (defaultPenalty !== undefined) updateData.defaultPenalty = Math.max(0, parseInt(defaultPenalty, 10));
    if (defaultPenaltyEnabled !== undefined) updateData.defaultPenaltyEnabled = Boolean(defaultPenaltyEnabled);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: { defaultTaskReward: true, defaultPenalty: true, defaultPenaltyEnabled: true, coinBalance: true },
    });

    res.json({ success: true, settings: user });
  } catch (error) {
    next(error);
  }
});

// Settle missed task penalties for the current day
router.post('/settle-day', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await CoinService.settleMissedTasks(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// List personal rewards
router.get('/rewards', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const rewards = await CoinService.getPersonalRewards(req.user!.id);
    res.json({ success: true, rewards });
  } catch (error) {
    next(error);
  }
});

// Create personal reward
router.post('/rewards', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, description, coinCost, icon } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: 'Reward name is required' });
      return;
    }
    const reward = await CoinService.createPersonalReward(req.user!.id, {
      name,
      description,
      coinCost: coinCost ? parseInt(coinCost, 10) : 50,
      icon,
    });
    res.status(201).json({ success: true, reward });
  } catch (error) {
    next(error);
  }
});

// Update personal reward
router.put('/rewards/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const reward = await CoinService.updatePersonalReward(req.user!.id, req.params.id, req.body);
    res.json({ success: true, reward });
  } catch (error) {
    next(error);
  }
});

// Delete personal reward
router.delete('/rewards/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await CoinService.deletePersonalReward(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Reward deleted' });
  } catch (error) {
    next(error);
  }
});

// Redeem personal reward
router.post('/rewards/:id/redeem', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await CoinService.redeemReward(req.user!.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
