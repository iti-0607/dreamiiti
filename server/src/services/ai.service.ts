import { AdvisoryGuidance } from '../types/index.js';

export interface PlanningAssistant {
  explainTaskApproach(taskTitle: string, description?: string): Promise<{ explanation: string; suggestions: string[] }>;
  offerProcrastinationAdvice(reason: string): Promise<{ advice: string; reflection: string }>;
  explainSchedulingConflict(block1Title: string, block2Title: string): Promise<string>;
  summarizeProgress(completedCount: number, focusMinutes: number): Promise<string>;
}

export class NonAuthoritativeAdvisoryAssistant implements PlanningAssistant {
  async explainTaskApproach(taskTitle: string, description = '') {
    return {
      explanation: `To approach "${taskTitle}", consider writing down the immediate prerequisite or required tool. Clarifying what comes first reduces cognitive hesitation.`,
      suggestions: [
        'Break your own work into small 20-30 minute focused intervals.',
        'Eliminate secondary distractions before starting.',
        'Focus on the first draft or first step rather than immediate perfection.',
      ],
    };
  }

  async offerProcrastinationAdvice(reason: string) {
    const adviceMap: Record<string, { advice: string; reflection: string }> = {
      too_big: {
        advice: 'Large tasks often trigger hesitation because the finish line feels distant. Focus only on opening the workspace today.',
        reflection: 'What is the very first physical action you can take in under 3 minutes?',
      },
      low_energy: {
        advice: 'Honor your low energy without guilt. Doing 5 minutes of mindful progress is infinitely better than zero.',
        reflection: 'Can you give yourself permission to do a gentle, minimal pass?',
      },
      distracted: {
        advice: 'Distraction is often a search for novelty when facing friction. Close unrelated browser tabs and set a short timer.',
        reflection: 'What single tab or file do you truly need open right now?',
      },
      default: {
        advice: 'Starting inertia accounts for most resistance. Once you begin, momentum naturally takes over.',
        reflection: 'What would make taking the first step 10% easier right now?',
      },
    };

    return adviceMap[reason] || adviceMap.default;
  }

  async explainSchedulingConflict(block1Title: string, block2Title: string) {
    return `"${block1Title}" and "${block2Title}" overlap on your schedule. You can decide whether to adjust one of the time blocks or keep both scheduled simultaneously.`;
  }

  async summarizeProgress(completedCount: number, focusMinutes: number) {
    return `You have completed ${completedCount} tasks with ${focusMinutes} minutes of focused attention. Consistency is a steady rhythm built step by step.`;
  }
}

export const aiAssistant: PlanningAssistant = new NonAuthoritativeAdvisoryAssistant();
