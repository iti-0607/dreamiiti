import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Planning, Habits, and Anti-Procrastination Tests', () => {
  let user1Token: string;
  let user2Token: string;
  let createdDreamId: string;
  let createdGoalId: string;
  let createdTaskId: string;

  it('sets up two separate users for tenant isolation testing', async () => {
    const res1 = await request(app).post('/api/v1/auth/signup').send({
      name: 'User One',
      email: `user1_${Date.now()}@dreamiiti.app`,
      password: 'password123',
    });
    user1Token = res1.body.token;

    const res2 = await request(app).post('/api/v1/auth/signup').send({
      name: 'User Two',
      email: `user2_${Date.now()}@dreamiiti.app`,
      password: 'password123',
    });
    user2Token = res2.body.token;
  });

  it('user 1 creates a dream and a goal', async () => {
    const dreamRes = await request(app)
      .post('/api/v1/dreams')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Learn Full-Stack Development',
        motivation: 'To create impactful tools.',
        timeframe: '3_months',
      });

    expect(dreamRes.status).toBe(201);
    expect(dreamRes.body.dream.title).toBe('Learn Full-Stack Development');
    createdDreamId = dreamRes.body.dream.id;

    const goalRes = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        dreamId: createdDreamId,
        title: 'Master React & Node.js',
        horizon: 'MONTHLY',
        estimatedHours: 20,
      });

    expect(goalRes.status).toBe(201);
    createdGoalId = goalRes.body.goal.id;
  });

  it('tenant isolation: user 2 cannot access user 1 dream', async () => {
    const res = await request(app)
      .get(`/api/v1/dreams/${createdDreamId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(500); // Handled not found or unauthorized
    expect(res.body.success).toBe(false);
  });

  it('user 1 tests the deterministic goal decomposition engine', async () => {
    const res = await request(app)
      .post('/api/v1/goals/decompose')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'I want to build a strong backend project in two months',
        horizon: 'MONTHLY',
        availableHoursPerWeek: 12,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.plan.milestones.length).toBeGreaterThan(0);
    expect(res.body.plan.milestones[0].tasks[0].firstStep5Min).toBeDefined();
    expect(res.body.plan.bufferRatio).toBe(0.25);
  });

  it('user 1 creates a task and triggers anti-procrastination Help Me Start', async () => {
    const taskRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        goalId: createdGoalId,
        title: 'Write complex database migration',
        priority: 'MUST_DO',
        estimatedMinutes: 60,
      });

    expect(taskRes.status).toBe(201);
    createdTaskId = taskRes.body.task.id;

    const helpRes = await request(app)
      .post(`/api/v1/tasks/${createdTaskId}/help-me-start`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ reason: 'too_big' });

    expect(helpRes.status).toBe(200);
    expect(helpRes.body.microStep).toBeDefined();
    expect(helpRes.body.recommendedAction).toBe('break_down');
  });

  it('calendar conflict detection warns when two blocks overlap', async () => {
    const now = new Date();
    const start1 = new Date(now.getTime() + 1000 * 60 * 60).toISOString();
    const end1 = new Date(now.getTime() + 1000 * 60 * 120).toISOString();

    const block1 = await request(app)
      .post('/api/v1/calendar/blocks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Deep Work Session',
        startTime: start1,
        endTime: end1,
      });

    expect(block1.status).toBe(201);

    // Try to create overlapping block
    const overlapStart = new Date(now.getTime() + 1000 * 60 * 90).toISOString(); // Overlaps
    const overlapEnd = new Date(now.getTime() + 1000 * 60 * 150).toISOString();

    const block2 = await request(app)
      .post('/api/v1/calendar/blocks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Conflicting Meeting',
        startTime: overlapStart,
        endTime: overlapEnd,
        isOverride: false,
      });

    expect(block2.status).toBe(409);
    expect(block2.body.hasConflict).toBe(true);
    expect(block2.body.conflicts.length).toBe(1);
  });

  it('user 1 creates a habit and logs daily completion', async () => {
    const habitRes = await request(app)
      .post('/api/v1/habits')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Evening Reading',
        frequency: 'DAILY',
        targetDaysPerWeek: 7,
      });

    expect(habitRes.status).toBe(201);
    const habitId = habitRes.body.habit.id;

    const toggleRes = await request(app)
      .post(`/api/v1/habits/${habitId}/toggle`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({});

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.isCompletedToday).toBe(true);
    expect(toggleRes.body.habit.currentStreak).toBe(1);
  });
});
