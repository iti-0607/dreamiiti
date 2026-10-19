import { Router, Response } from 'express';
import { z } from 'zod';
import { FocusService } from '../services/focus.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

const startSessionSchema = z.object({
  taskId: z.string().nullable().optional(),
  targetMinutes: z.number().min(5).max(180).optional(),
});

router.get('/sessions', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const sessions = await FocusService.getSessions(req.user!.id);
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
});

router.get('/today', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const stats = await FocusService.getTodayFocusStats(req.user!.id);
    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
});

router.post('/start', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = startSessionSchema.parse(req.body);
    const session = await FocusService.startSession(req.user!.id, validated as any);
    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/end', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, notes } = req.body;
    const session = await FocusService.endSession(req.user!.id, req.params.id, { status, notes });
    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
});

export default router;
