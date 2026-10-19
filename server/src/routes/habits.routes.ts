import { Router, Response } from 'express';
import { z } from 'zod';
import { HabitService } from '../services/habit.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required'),
  description: z.string().optional(),
  lifeAreaId: z.string().nullable().optional(),
  category: z.string().optional(),
  frequency: z.string().optional(),
  targetDaysPerWeek: z.number().optional(),
  selectedWeekdays: z.string().optional(),
  reminderTime: z.string().nullable().optional(),
});

router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const habits = await HabitService.getHabits(req.user!.id);
    res.json({ success: true, habits });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = habitSchema.parse(req.body);
    const habit = await HabitService.createHabit(req.user!.id, validated as any);
    res.status(201).json({ success: true, habit });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const habit = await HabitService.updateHabit(req.user!.id, req.params.id, req.body);
    res.json({ success: true, habit });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/toggle', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { date } = req.body;
    const result = await HabitService.toggleHabitLog(req.user!.id, req.params.id, date);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await HabitService.deleteHabit(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
