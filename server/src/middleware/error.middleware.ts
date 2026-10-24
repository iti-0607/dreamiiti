import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle Prisma unique constraint errors
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target.join(', ')
      : err.meta?.target || 'field';
    res.status(409).json({
      success: false,
      error: `A record with this ${target} already exists.`,
    });
    return;
  }

  // Handle Prisma not found errors
  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'The requested resource was not found.',
    });
    return;
  }

  console.error('[DreamIITi Error]:', err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
