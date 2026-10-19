import { Router, Response } from 'express';
import { ExportService } from '../services/export.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

router.get('/export', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = await ExportService.exportUserData(req.user!.id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=dreamiiti-data-${Date.now()}.json`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/account', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await ExportService.deleteAccount(req.user!.id);
    res.clearCookie('dream_token');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
