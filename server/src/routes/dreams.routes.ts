import { Router, Response } from 'express';
import { z } from 'zod';
import { DreamService } from '../services/dream.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

const dreamSchema = z.object({
  title: z.string().min(1, 'Dream title is required'),
  description: z.string().optional(),
  motivation: z.string().optional(),
  lifeAreaId: z.string().nullable().optional(),
  timeframe: z.string().optional(),
  targetDate: z.string().nullable().optional(),
  coverColor: z.string().optional(),
  priority: z.string().optional(),
  successCriteria: z.string().optional(),
});

router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { lifeAreaId, status, search } = req.query as { lifeAreaId?: string; status?: string; search?: string };
    const dreams = await DreamService.getDreams(req.user!.id, { lifeAreaId, status, search });
    res.json({ success: true, dreams });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const dream = await DreamService.getDreamById(req.user!.id, req.params.id);
    res.json({ success: true, dream });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = dreamSchema.parse(req.body);
    const dream = await DreamService.createDream(req.user!.id, validated as any);
    res.status(201).json({ success: true, dream });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const dream = await DreamService.updateDream(req.user!.id, req.params.id, req.body);
    res.json({ success: true, dream });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await DreamService.deleteDream(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Dream deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
