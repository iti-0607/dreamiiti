import { Router, Response } from 'express';
import { z } from 'zod';
import { MilestoneService } from '../services/milestone.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

const milestoneSchema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
  title: z.string().min(1, 'Milestone title is required'),
  description: z.string().optional(),
  targetDate: z.string().nullable().optional(),
});

router.post('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = milestoneSchema.parse(req.body);
    const milestone = await MilestoneService.createMilestone(req.user!.id, validated as any);
    res.status(201).json({ success: true, milestone });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/toggle', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const milestone = await MilestoneService.toggleMilestone(req.user!.id, req.params.id);
    res.json({ success: true, milestone });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/toggle', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const milestone = await MilestoneService.toggleMilestone(req.user!.id, req.params.id);
    res.json({ success: true, milestone });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await MilestoneService.deleteMilestone(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Milestone deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
