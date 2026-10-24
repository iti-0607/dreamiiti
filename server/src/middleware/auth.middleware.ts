import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthUser } from '../types/index.js';
import { prisma } from '../prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dreamiiti_default_dev_secret_2026';

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.dream_token) {
      token = req.cookies.dream_token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to access this resource.',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded?.id || decoded?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Invalid session structure. Please sign in again.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User account no longer exists or session has expired.',
      });
      return;
    }

    req.user = user as AuthUser;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please sign in again.',
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.dream_token) {
      token = req.cookies.dream_token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded?.id || decoded?.userId;
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true },
        });
        if (user) {
          req.user = user as AuthUser;
        }
      }
    }
  } catch {
    // Optional auth silently fails and proceeds as guest
  }
  next();
};
