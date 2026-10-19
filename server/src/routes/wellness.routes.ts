import { Router, Response } from 'express';
import { z } from 'zod';
import { WellnessService } from '../services/wellness.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

const checkInSchema = z.object({
  mood: z.string().min(1, 'Mood selection is required'),
  energy: z.string().min(1, 'Energy selection is required'),
  stress: z.string().optional(),
  notes: z.string().optional(),
});

const journalSchema = z.object({
  date: z.string().optional(),
  prompt: z.string().optional(),
  content: z.string().min(1, 'Journal content is required'),
  tags: z.string().optional(),
});

router.get('/check-in/today', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const checkIn = await WellnessService.getTodayCheckIn(req.user!.id);
    res.json({ success: true, checkIn });
  } catch (error) {
    next(error);
  }
});

router.post('/check-in', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = checkInSchema.parse(req.body);
    const checkIn = await WellnessService.saveCheckIn(req.user!.id, validated as any);
    res.json({ success: true, checkIn });
  } catch (error) {
    next(error);
  }
});

router.get('/journal', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { search } = req.query as { search?: string };
    const entries = await WellnessService.getJournalEntries(req.user!.id, search);
    res.json({ success: true, entries });
  } catch (error) {
    next(error);
  }
});

router.post('/journal', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = journalSchema.parse(req.body);
    const entry = await WellnessService.createJournalEntry(req.user!.id, validated as any);
    res.status(201).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
});

router.put('/journal/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const entry = await WellnessService.updateJournalEntry(req.user!.id, req.params.id, req.body);
    res.json({ success: true, entry });
  } catch (error) {
    next(error);
  }
});

router.delete('/journal/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await WellnessService.deleteJournalEntry(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Journal entry removed' });
  } catch (error) {
    next(error);
  }
});

router.get('/prompts', (_req, res) => {
  res.json({ success: true, prompts: WellnessService.getPrompts() });
});

export default router;
