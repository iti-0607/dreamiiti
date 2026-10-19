import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface GoalBreakdownOutput {
  milestones: {
    title: string;
    description: string;
    targetWeek: number;
    tasks: {
      title: string;
      estimatedMinutes: number;
      priority: 'MUST_DO' | 'SHOULD_DO' | 'OPTIONAL';
      firstStep5Min: string;
    }[];
  }[];
  recommendedWeeklyHours: number;
  bufferRatio: number;
  reviewPoints: string[];
}
