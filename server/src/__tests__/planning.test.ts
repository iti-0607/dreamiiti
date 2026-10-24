import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('User-Owned Planning & Zero AI Generation Tests', () => {
  let user1Token: string;
  let user2Token: string;
  let createdDreamId: string;
  let createdGoalId: string;
  let createdMilestoneId: string;
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

  it('creating a goal does not create any tasks or milestones automatically', async () => {
    // 1. Create a dream
    const dreamRes = await request(app)
      .post('/api/v1/dreams')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Learn Full-Stack Development',
        motivation: 'To create impactful tools.',
        timeframe: '3_months',
      });

    expect(dreamRes.status).toBe(201);
    createdDreamId = dreamRes.body.dream.id;

    // 2. Create a goal under the dream
    const goalRes = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        dreamId: createdDreamId,
        title: 'Master React & Node.js',
        description: 'Deep dive into full-stack architecture',
        horizon: 'MONTHLY',
        estimatedHours: 20,
        importance: 'HIGH',
      });

    expect(goalRes.status).toBe(201);
    createdGoalId = goalRes.body.goal.id;

    // Fetch the created goal to inspect relations
    const fetchGoalRes = await request(app)
      .get(`/api/v1/goals/${createdGoalId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(fetchGoalRes.status).toBe(200);
    // Crucial rule: zero auto-generated milestones or tasks!
    expect(fetchGoalRes.body.goal.milestones).toHaveLength(0);
    expect(fetchGoalRes.body.goal.tasks).toHaveLength(0);
  });

  it('selecting a yearly, six-month, or monthly planning horizon does not trigger AI generation', async () => {
    const horizons = ['YEARLY', 'SIX_MONTH', 'MONTHLY', 'WEEKLY'];

    for (const h of horizons) {
      const res = await request(app)
        .post('/api/v1/goals')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: `Goal for ${h} horizon`,
          horizon: h,
          estimatedHours: 40,
        });

      expect(res.status).toBe(201);
      const goal = res.body.goal;
      expect(goal.horizon).toBe(h);
      expect(goal.milestones).toHaveLength(0);
      expect(goal.tasks).toHaveLength(0);
    }
  });

  it('onboarding does not generate planning items (goals, tasks, or calendar blocks)', async () => {
    // New user completes onboarding
    const newUserEmail = `onboarding_${Date.now()}@dreamiiti.app`;
    const signupRes = await request(app).post('/api/v1/auth/signup').send({
      name: 'Onboarding Tester',
      email: newUserEmail,
      password: 'password123',
    });
    const newToken = signupRes.body.token;

    // User updates profile and sets initial dream (mimicking onboarding step 1-6)
    await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${newToken}`)
      .send({
        currentHorizon: '3_months',
        focusDuration: 25,
      });

    await request(app)
      .post('/api/v1/dreams')
      .set('Authorization', `Bearer ${newToken}`)
      .send({
        title: 'Initial Onboarding Dream',
        timeframe: '3_months',
      });

    // Verify ZERO goals, ZERO tasks, and ZERO calendar blocks were automatically created
    const goalsRes = await request(app)
      .get('/api/v1/goals')
      .set('Authorization', `Bearer ${newToken}`);
    expect(goalsRes.body.goals).toHaveLength(0);

    const tasksRes = await request(app)
      .get('/api/v1/tasks?view=all')
      .set('Authorization', `Bearer ${newToken}`);
    expect(tasksRes.body.tasks).toHaveLength(0);

    const blocksRes = await request(app)
      .get('/api/v1/calendar/blocks')
      .set('Authorization', `Bearer ${newToken}`);
    expect(blocksRes.body.blocks).toHaveLength(0);
  });

  it('only explicit user actions create milestones and tasks', async () => {
    // Explicitly add milestone
    const milestoneRes = await request(app)
      .post('/api/v1/milestones')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        goalId: createdGoalId,
        title: 'Complete Core Architecture Documentation',
      });

    expect(milestoneRes.status).toBe(201);
    createdMilestoneId = milestoneRes.body.milestone.id;

    // Explicitly add task
    const taskRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        goalId: createdGoalId,
        milestoneId: createdMilestoneId,
        title: 'Write complex database migration',
        priority: 'MUST_DO',
        estimatedMinutes: 60,
      });

    expect(taskRes.status).toBe(201);
    createdTaskId = taskRes.body.task.id;

    // Explicitly add subtask
    const subtaskRes = await request(app)
      .post(`/api/v1/tasks/${createdTaskId}/subtasks`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Verify foreign key cascade rules' });

    expect(subtaskRes.status).toBe(201);
    expect(subtaskRes.body.subtask.title).toBe('Verify foreign key cascade rules');
  });

  it('AI advisory responses provide explanatory text and cannot mutate planning data', async () => {
    // Check initial counts
    const initialTasksRes = await request(app)
      .get('/api/v1/tasks?view=all')
      .set('Authorization', `Bearer ${user1Token}`);
    const initialCount = initialTasksRes.body.tasks.length;

    // Request non-authoritative AI advice
    const helpRes = await request(app)
      .post(`/api/v1/tasks/${createdTaskId}/help-me-start`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ reason: 'too_big' });

    expect(helpRes.status).toBe(200);
    expect(helpRes.body.guidance).toBeDefined();
    expect(helpRes.body.microStep).toBeDefined();

    // Verify task count did NOT change, no silent task was created
    const postTasksRes = await request(app)
      .get('/api/v1/tasks?view=all')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(postTasksRes.body.tasks.length).toBe(initialCount);

    // Verify goal milestones did NOT change
    const goalRes = await request(app)
      .get(`/api/v1/goals/${createdGoalId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(goalRes.body.goal.milestones.length).toBe(1);
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

    // Overlapping block
    const overlapStart = new Date(now.getTime() + 1000 * 60 * 90).toISOString();
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

  it('user-created planning data is preserved and progress reflects user updates', async () => {
    // Toggle milestone
    const toggleMilestone = await request(app)
      .patch(`/api/v1/milestones/${createdMilestoneId}/toggle`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(toggleMilestone.status).toBe(200);
    expect(toggleMilestone.body.milestone.isCompleted).toBe(true);

    // Toggle task
    const toggleTask = await request(app)
      .patch(`/api/v1/tasks/${createdTaskId}/toggle`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(toggleTask.status).toBe(200);
    expect(toggleTask.body.task.status).toBe('COMPLETED');

    // Check goal progress updated accurately
    const goalRes = await request(app)
      .get(`/api/v1/goals/${createdGoalId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(goalRes.status).toBe(200);
    expect(goalRes.body.goal.progress).toBe(100);
    expect(goalRes.body.goal.status).toBe('COMPLETED');
  });

  it('tenant isolation: user 2 cannot access user 1 dream or goal', async () => {
    const res = await request(app)
      .get(`/api/v1/dreams/${createdDreamId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
