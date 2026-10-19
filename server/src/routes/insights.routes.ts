import { Router, Response } from 'express';
import { InsightService } from '../services/insight.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const insights = await InsightService.getInsights(req.user!.id);
    res.json({ success: true, insights });
  } catch (error) {
    next(error);
  }
});

export default router;
