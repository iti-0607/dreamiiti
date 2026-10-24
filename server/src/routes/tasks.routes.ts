import { Router, Response } from 'express';
import { z } from 'zod';
import { TaskService } from '../services/task.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
router.use(requireAuth);

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  goalId: z.string().nullable().optional(),
  milestoneId: z.string().nullable().optional(),
  priority: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  scheduledStart: z.string().nullable().optional(),
  scheduledEnd: z.string().nullable().optional(),
  estimatedMinutes: z.number().optional(),
  tags: z.string().optional(),
  subtasks: z.array(z.string()).optional(),
});

router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { view, goalId, priority, search } = req.query as any;
    const tasks = await TaskService.getTasks(req.user!.id, { view, goalId, priority, search });
    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const task = await TaskService.getTaskById(req.user!.id, req.params.id);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = taskSchema.parse(req.body);
    const task = await TaskService.createTask(req.user!.id, validated as any);
    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const task = await TaskService.updateTask(req.user!.id, req.params.id, req.body);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await TaskService.deleteTask(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/toggle', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const task = await TaskService.toggleTaskCompletion(req.user!.id, req.params.id);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/toggle', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const task = await TaskService.toggleTaskCompletion(req.user!.id, req.params.id);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

// Subtask routes
router.post('/:id/subtasks', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { title } = req.body;
    if (!title) {
      res.status(400).json({ success: false, error: 'Subtask title is required' });
      return;
    }
    const subtask = await TaskService.addSubtask(req.user!.id, req.params.id, title);
    res.status(201).json({ success: true, subtask });
  } catch (error) {
    next(error);
  }
});

router.patch('/subtasks/:subtaskId/toggle', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const subtask = await TaskService.toggleSubtask(req.user!.id, req.params.subtaskId);
    res.json({ success: true, subtask });
  } catch (error) {
    next(error);
  }
});

router.put('/subtasks/:subtaskId/toggle', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const subtask = await TaskService.toggleSubtask(req.user!.id, req.params.subtaskId);
    res.json({ success: true, subtask });
  } catch (error) {
    next(error);
  }
});

router.delete('/subtasks/:subtaskId', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await TaskService.deleteSubtask(req.user!.id, req.params.subtaskId);
    res.json({ success: true, message: 'Subtask deleted' });
  } catch (error) {
    next(error);
  }
});

// Anti-procrastination endpoints
router.post('/:id/help-me-start', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { reason } = req.body;
    const guidance = await TaskService.helpMeStart(req.user!.id, req.params.id, reason || 'default');
    res.json({ success: true, ...guidance });
  } catch (error) {
    next(error);
  }
});

router.post('/action/make-today-lighter', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await TaskService.makeTodayLighter(req.user!.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.post('/action/guilt-free-restart', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await TaskService.guiltFreeRestart(req.user!.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
