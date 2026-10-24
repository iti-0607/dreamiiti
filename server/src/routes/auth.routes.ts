import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  selectedAreas: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/signup', async (req, res, next) => {
  try {
    const validated = signupSchema.parse(req.body);
    const result = await AuthService.signup(validated);

    // Set HTTP-only secure cookie
    res.cookie('dream_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await AuthService.login(validated);

    res.cookie('dream_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await AuthService.getMe(req.user!.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

router.post('/onboarding', requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await AuthService.completeOnboarding(req.user!.id, req.body);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const profile = await AuthService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const settings = await AuthService.updateSettings(req.user!.id, req.body);
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }
    const result = await AuthService.requestPasswordReset(email);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'Valid token and password (min 6 chars) are required' });
      return;
    }
    const result = await AuthService.resetPassword(token, newPassword);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'Current password and new password (min 6 chars) are required' });
      return;
    }
    const result = await AuthService.changePassword(req.user!.id, currentPassword, newPassword);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('dream_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
