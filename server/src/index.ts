import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes.js';
import dreamsRoutes from './routes/dreams.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import milestonesRoutes from './routes/milestones.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import habitsRoutes from './routes/habits.routes.js';
import focusRoutes from './routes/focus.routes.js';
import wellnessRoutes from './routes/wellness.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import userRoutes from './routes/user.routes.js';
import goalsPointsRoutes from './routes/goals-points.routes.js';
import coinsRoutes from './routes/coins.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible integration for development previews
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Rate Limiting on Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// OpenAPI Spec endpoint
app.get('/api/v1/openapi.json', (_req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'DreamIITi Full-Stack API',
      version: '1.0.0',
      description: 'Personal growth, life-planning, and anti-procrastination platform API.',
    },
    paths: {
      '/api/v1/auth/signup': { post: { summary: 'Register a new user' } },
      '/api/v1/auth/login': { post: { summary: 'Login and establish session' } },
      '/api/v1/dreams': {
        get: { summary: 'Get all dreams for user' },
        post: { summary: 'Create a new dream' },
      },
      '/api/v1/goals': {
        get: { summary: 'Get goals' },
        post: { summary: 'Create goal' },
      },
      '/api/v1/tasks': {
        get: { summary: 'Get tasks by view (today, upcoming, overdue, all)' },
        post: { summary: 'Create task' },
      },
      '/api/v1/tasks/{id}/help-me-start': {
        post: { summary: 'Anti-procrastination 5-minute doorway generator' },
      },
      '/api/v1/tasks/action/make-today-lighter': {
        post: { summary: 'Make Today Lighter - Minimum Viable Day' },
      },
      '/api/v1/calendar/blocks': {
        get: { summary: 'Get calendar time blocks' },
        post: { summary: 'Schedule time block with conflict detection' },
      },
      '/api/v1/habits': {
        get: { summary: 'Get habit garden status and streaks' },
        post: { summary: 'Create habit' },
      },
      '/api/v1/focus/start': { post: { summary: 'Start focus timer' } },
      '/api/v1/wellness/check-in': { post: { summary: 'Submit daily check-in' } },
      '/api/v1/wellness/journal': {
        get: { summary: 'Get private journal entries' },
        post: { summary: 'Create private journal entry' },
      },
      '/api/v1/reviews/weekly': { post: { summary: 'Submit weekly review' } },
      '/api/v1/insights': { get: { summary: 'Get progress analytics & chart data' } },
      '/api/v1/user/export': { get: { summary: 'Export all personal data in JSON' } },
    },
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'DreamIITi',
    time: new Date().toISOString(),
  });
});

// Mount V1 API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/dreams', dreamsRoutes);
app.use('/api/v1/goals/points', goalsPointsRoutes);
app.use('/api/v1/goals', goalsRoutes);
app.use('/api/v1/milestones', milestonesRoutes);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/habits', habitsRoutes);
app.use('/api/v1/focus', focusRoutes);
app.use('/api/v1/wellness', wellnessRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/insights', insightsRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/coins', coinsRoutes);

// Fallback JSON 404 Handler for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[DreamIITi] Server running smoothly at http://localhost:${PORT}`);
    console.log(`[DreamIITi] OpenAPI documentation available at http://localhost:${PORT}/api/v1/openapi.json`);
  });
}

export default app;
