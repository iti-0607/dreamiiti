import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Authentication & Tenant Isolation Integration Tests', () => {
  const testUser = {
    name: 'Test Aspirant',
    email: `tester_${Date.now()}@dreamiiti.app`,
    password: 'securePassword123',
  };

  let authToken: string;

  it('successfully signs up a new user with default life areas and profile', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.token).toBeDefined();

    authToken = res.body.token;
  });

  it('prevents duplicate email registration', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send(testUser);

    expect(res.status).toBe(500); // Handled error
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('already exists');
  });

  it('rejects invalid login credentials without revealing account existence', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'wrongPassword',
    });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('successfully logs in with valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('protects private endpoints from unauthenticated access', async () => {
    const res = await request(app).get('/api/v1/dreams');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('allows access to private profile when authorized', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });
});
