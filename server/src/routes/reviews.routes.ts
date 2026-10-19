import { Router, Response } from 'express';
import { ReviewService } from '../services/review.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

router.get('/weekly/draft', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const draft = await ReviewService.getWeeklyReviewDraft(req.user!.id);
    res.json({ success: true, ...draft });
  } catch (error) {
    next(error);
  }
});

router.post('/weekly', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const review = await ReviewService.submitWeeklyReview(req.user!.id, req.body);
    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const history = await ReviewService.getReviewsHistory(req.user!.id);
    res.json({ success: true, ...history });
  } catch (error) {
    next(error);
  }
});

router.post('/monthly', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const review = await ReviewService.submitMonthlyReview(req.user!.id, req.body);
    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

export default router;
