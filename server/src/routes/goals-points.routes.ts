import { Router, Response } from 'express';
import { GoalPointService } from '../services/goal-point.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

router.get('/overview', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = await GoalPointService.getSixMonthOverview(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.put('/six-month', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = await GoalPointService.updateSixMonthGoal(req.user!.id, req.body);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { title, description, targetDate } = req.body;
    if (!title || !title.trim()) {
      res.status(400).json({ success: false, error: 'Point title is required' });
      return;
    }
    const point = await GoalPointService.createPoint(req.user!.id, { title, description, targetDate });
    res.status(201).json({ success: true, point });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const point = await GoalPointService.updatePoint(req.user!.id, req.params.id, req.body);
    res.json({ success: true, point });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/toggle', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const point = await GoalPointService.togglePoint(req.user!.id, req.params.id);
    res.json({ success: true, point });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/toggle', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const point = await GoalPointService.togglePoint(req.user!.id, req.params.id);
    res.json({ success: true, point });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await GoalPointService.deletePoint(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Goal point removed' });
  } catch (error) {
    next(error);
  }
});

router.put('/action/reorder', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { pointIds } = req.body;
    if (!Array.isArray(pointIds)) {
      res.status(400).json({ success: false, error: 'pointIds array is required' });
      return;
    }
    const points = await GoalPointService.reorderPoints(req.user!.id, pointIds);
    res.json({ success: true, points });
  } catch (error) {
    next(error);
  }
});

export default router;
