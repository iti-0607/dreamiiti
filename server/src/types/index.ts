import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest<P = Record<string, string>> extends Request<P> {
  user?: AuthUser;
}

export interface AdvisoryGuidance {
  topic: string;
  advice: string;
  reflectiveQuestions: string[];
}
