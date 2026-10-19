import { Router, Response } from 'express';
import { z } from 'zod';
import { CalendarService } from '../services/calendar.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

const blockSchema = z.object({
  taskId: z.string().nullable().optional(),
  title: z.string().min(1, 'Block title is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  isBreak: z.boolean().optional(),
  color: z.string().optional(),
  isOverride: z.boolean().optional(),
});

router.get('/blocks', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const blocks = await CalendarService.getScheduledBlocks(req.user!.id, startDate, endDate);
    res.json({ success: true, blocks });
  } catch (error) {
    next(error);
  }
});

router.post('/blocks', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = blockSchema.parse(req.body);
    const result = await CalendarService.createScheduledBlock(req.user!.id, validated as any);
    if (result.hasConflict) {
      res.status(409).json({ success: false, ...result });
      return;
    }
    res.status(201).json({ success: true, block: result.block });
  } catch (error) {
    next(error);
  }
});

router.put('/blocks/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await CalendarService.updateScheduledBlock(req.user!.id, req.params.id, req.body);
    if (result.hasConflict) {
      res.status(409).json({ success: false, ...result });
      return;
    }
    res.json({ success: true, block: result.block });
  } catch (error) {
    next(error);
  }
});

router.delete('/blocks/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await CalendarService.deleteScheduledBlock(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Scheduled block removed' });
  } catch (error) {
    next(error);
  }
});

router.post('/resolve-unfinished', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { action, taskIds } = req.body;
    if (!action || !Array.isArray(taskIds) || taskIds.length === 0) {
      res.status(400).json({ success: false, error: 'Valid action and taskIds array are required' });
      return;
    }
    const result = await CalendarService.resolveUnfinishedWork(req.user!.id, action, taskIds);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
