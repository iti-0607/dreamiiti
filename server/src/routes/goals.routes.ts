import { Router, Response } from 'express';
import { z } from 'zod';
import { GoalService } from '../services/goal.service.js';
import { aiAssistant } from '../services/ai.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

const goalSchema = z.object({
  dreamId: z.string().nullable().optional(),
  title: z.string().min(1, 'Goal title is required'),
  description: z.string().optional(),
  horizon: z.string().optional(),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
  importance: z.string().optional(),
  estimatedHours: z.number().optional(),
  successCriteria: z.string().optional(),
  milestones: z.array(z.object({ title: z.string(), targetDate: z.string().optional() })).optional(),
});

router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { dreamId, horizon, status } = req.query as { dreamId?: string; horizon?: string; status?: string };
    const goals = await GoalService.getGoals(req.user!.id, { dreamId, horizon, status });
    res.json({ success: true, goals });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const goal = await GoalService.getGoalById(req.user!.id, req.params.id);
    res.json({ success: true, goal });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = goalSchema.parse(req.body);
    const goal = await GoalService.createGoal(req.user!.id, validated as any);
    res.status(201).json({ success: true, goal });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const goal = await GoalService.updateGoal(req.user!.id, req.params.id, req.body);
    res.json({ success: true, goal });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await GoalService.deleteGoal(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// AI & Deterministic Goal Decomposition API
router.post('/decompose', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { title, description, horizon, availableHoursPerWeek } = req.body;
    if (!title) {
      res.status(400).json({ success: false, error: 'Goal title is required for decomposition' });
      return;
    }

    const plan = await aiAssistant.generateGoalBreakdown(
      title,
      description,
      horizon,
      availableHoursPerWeek || 10
    );

    res.json({ success: true, plan });
  } catch (error) {
    next(error);
  }
});

export default router;
