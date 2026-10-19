import { GoalBreakdownOutput } from '../types/index.js';

export interface PlanningAssistant {
  generateGoalBreakdown(
    title: string,
    description?: string,
    horizon?: string,
    availableHoursPerWeek?: number
  ): Promise<GoalBreakdownOutput>;
  suggestNextAction(taskTitle: string): Promise<{ microStep: string; rationale: string }>;
  proposeWeeklySchedule(tasks: any[], availableHours: number): Promise<any>;
}

export class DeterministicPlanningAssistant implements PlanningAssistant {
  async generateGoalBreakdown(
    title: string,
    description = '',
    horizon = 'MONTHLY',
    availableHoursPerWeek = 10
  ): Promise<GoalBreakdownOutput> {
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    // Deterministic progressive decomposition based on input
    const isTechOrCode = /code|build|app|web|backend|frontend|project|software|system|api/i.test(
      cleanTitle + ' ' + cleanDesc
    );
    const isStudyOrExam = /exam|study|learn|gate|iit|course|test|certification|read/i.test(
      cleanTitle + ' ' + cleanDesc
    );
    const isFitnessOrHealth = /run|weight|gym|health|fitness|diet|workout|habit/i.test(
      cleanTitle + ' ' + cleanDesc
    );

    let milestones: GoalBreakdownOutput['milestones'] = [];

    if (isTechOrCode) {
      milestones = [
        {
          title: 'Phase 1: Architecture & Foundation Setup',
          description: 'Establish the project scope, repository structure, and core technical stack.',
          targetWeek: 1,
          tasks: [
            {
              title: `Define specifications & technical requirements for ${cleanTitle}`,
              estimatedMinutes: 45,
              priority: 'MUST_DO',
              firstStep5Min: 'Create a blank README.md and jot down the 3 core features you need first.',
            },
            {
              title: 'Scaffold repository, configure linters & initial tooling',
              estimatedMinutes: 40,
              priority: 'MUST_DO',
              firstStep5Min: 'Run the project init command in terminal and commit the initial structure.',
            },
            {
              title: 'Set up database schema & initial data migration',
              estimatedMinutes: 60,
              priority: 'SHOULD_DO',
              firstStep5Min: 'List the main 3 database entities on a notepad.',
            },
          ],
        },
        {
          title: 'Phase 2: Core Feature Implementation',
          description: 'Build the foundational domain logic and primary user workflows.',
          targetWeek: 2,
          tasks: [
            {
              title: 'Implement primary CRUD endpoints & backend services',
              estimatedMinutes: 90,
              priority: 'MUST_DO',
              firstStep5Min: 'Create the first service file with a single working function.',
            },
            {
              title: 'Assemble key frontend components & responsive views',
              estimatedMinutes: 90,
              priority: 'SHOULD_DO',
              firstStep5Min: 'Wire up a basic page shell with header and container.',
            },
            {
              title: 'Connect frontend client state with backend API',
              estimatedMinutes: 60,
              priority: 'SHOULD_DO',
              firstStep5Min: 'Write the first fetch/query hook for loading data.',
            },
          ],
        },
        {
          title: 'Phase 3: Integration, Polish & Edge Cases',
          description: 'Refine interaction states, validations, error handling, and visual polish.',
          targetWeek: 3,
          tasks: [
            {
              title: 'Add input validation & error boundaries on critical forms',
              estimatedMinutes: 60,
              priority: 'SHOULD_DO',
              firstStep5Min: 'Test submitting an empty form and check the error message.',
            },
            {
              title: 'Audit responsive layout on mobile & tablet viewports',
              estimatedMinutes: 45,
              priority: 'OPTIONAL',
              firstStep5Min: 'Open browser devtools responsive toggle and scroll through the page.',
            },
          ],
        },
        {
          title: 'Phase 4: Testing & Deployment Verification',
          description: 'Validate complete user journey and deploy to production.',
          targetWeek: 4,
          tasks: [
            {
              title: 'Write automated unit tests for core domain logic',
              estimatedMinutes: 60,
              priority: 'MUST_DO',
              firstStep5Min: 'Write 1 simple test checking the happy path.',
            },
            {
              title: 'Deploy to live staging environment & verify smoke tests',
              estimatedMinutes: 45,
              priority: 'MUST_DO',
              firstStep5Min: 'Review deployment environment variables and secrets.',
            },
          ],
        },
      ];
    } else if (isStudyOrExam) {
      milestones = [
        {
          title: 'Phase 1: Syllabus Mapping & Resource Curating',
          description: 'Audit high-weightage topics and prepare structured study materials.',
          targetWeek: 1,
          tasks: [
            {
              title: `Break down syllabus and key topics for ${cleanTitle}`,
              estimatedMinutes: 45,
              priority: 'MUST_DO',
              firstStep5Min: 'Print or download the official syllabus and highlight 3 core chapters.',
            },
            {
              title: 'Select primary book or video lectures for week 1',
              estimatedMinutes: 30,
              priority: 'SHOULD_DO',
              firstStep5Min: 'Bookmark the first playlist or open chapter 1.',
            },
          ],
        },
        {
          title: 'Phase 2: Deep Conceptual Grasp & Notes',
          description: 'Focus on active recall and conceptual clarity for key fundamentals.',
          targetWeek: 2,
          tasks: [
            {
              title: 'Complete focused study session on Topic Block A',
              estimatedMinutes: 90,
              priority: 'MUST_DO',
              firstStep5Min: 'Set a 25-minute focus timer and read the first 4 pages.',
            },
            {
              title: 'Synthesize concise one-page formula / concept sheet',
              estimatedMinutes: 45,
              priority: 'SHOULD_DO',
              firstStep5Min: 'Take out an index card and write the 3 central definitions.',
            },
          ],
        },
        {
          title: 'Phase 3: Targeted Problem Solving & Active Recall',
          description: 'Solve past-year problems under timed conditions.',
          targetWeek: 3,
          tasks: [
            {
              title: 'Solve 15-20 practice questions from previous tests',
              estimatedMinutes: 90,
              priority: 'MUST_DO',
              firstStep5Min: 'Pick question #1 and read it without looking at the answer key.',
            },
            {
              title: 'Review mistakes and document error patterns',
              estimatedMinutes: 45,
              priority: 'SHOULD_DO',
              firstStep5Min: 'Write down why question 1 felt tricky.',
            },
          ],
        },
        {
          title: 'Phase 4: Timed Mock Assessment & Revision',
          description: 'Simulate realistic test conditions and consolidate weak spots.',
          targetWeek: 4,
          tasks: [
            {
              title: 'Take full-length timed diagnostic mock',
              estimatedMinutes: 120,
              priority: 'MUST_DO',
              firstStep5Min: 'Clear desk and set phone outside the room.',
            },
            {
              title: 'Final consolidation pass over summary cards',
              estimatedMinutes: 60,
              priority: 'SHOULD_DO',
              firstStep5Min: 'Review summary cards for 10 minutes before winding down.',
            },
          ],
        },
      ];
    } else {
      milestones = [
        {
          title: 'Phase 1: Exploration & Clarity',
          description: 'Clarify the core reason and establish a sustainable starting baseline.',
          targetWeek: 1,
          tasks: [
            {
              title: `Draft clear vision and success criteria for: ${cleanTitle}`,
              estimatedMinutes: 30,
              priority: 'MUST_DO',
              firstStep5Min: 'Write 3 bullet points describing how success looks and feels.',
            },
            {
              title: 'Identify 1 routine friction point and remove it',
              estimatedMinutes: 25,
              priority: 'SHOULD_DO',
              firstStep5Min: 'Prepare your workspace or materials the night before.',
            },
          ],
        },
        {
          title: 'Phase 2: Consistent Momentum',
          description: 'Build regular repetition without obsessing over volume.',
          targetWeek: 2,
          tasks: [
            {
              title: 'Complete 3 scheduled action sessions this week',
              estimatedMinutes: 60,
              priority: 'MUST_DO',
              firstStep5Min: 'Schedule the exact calendar slots right now.',
            },
            {
              title: 'Reflect on initial progress and adjust difficulty',
              estimatedMinutes: 20,
              priority: 'SHOULD_DO',
              firstStep5Min: 'Write one sentence in your daily journal about what felt easiest.',
            },
          ],
        },
        {
          title: 'Phase 3: Deepening & Expansion',
          description: 'Advance skill level and tackle higher-leverage components.',
          targetWeek: 3,
          tasks: [
            {
              title: 'Execute milestone deliverable or major practice session',
              estimatedMinutes: 90,
              priority: 'MUST_DO',
              firstStep5Min: 'Commit to the first 10 minutes without multitasking.',
            },
          ],
        },
        {
          title: 'Phase 4: Review & Consolidation',
          description: 'Celebrate consistency, celebrate learning, and plan continuation.',
          targetWeek: 4,
          tasks: [
            {
              title: 'Conduct monthly reflection and acknowledge wins',
              estimatedMinutes: 30,
              priority: 'MUST_DO',
              firstStep5Min: 'List 3 things you know now that you did not know 4 weeks ago.',
            },
          ],
        },
      ];
    }

    return {
      milestones,
      recommendedWeeklyHours: Math.min(availableHoursPerWeek, 8),
      bufferRatio: 0.25, // 25% buffer time for rest and unexpected delays
      reviewPoints: [
        'End of Week 1: Check if the scope felt realistic or overwhelming.',
        'Mid-point (Week 2): Celebrate showing up even on messy days.',
        'End of Week 4: Carry forward what worked and gently release what did not.',
      ],
    };
  }

  async suggestNextAction(taskTitle: string) {
    return {
      microStep: `Set a 5-minute timer and write the first single line or action for "${taskTitle}".`,
      rationale:
        'Overcoming initial inertia accounts for 80% of task resistance. Once underway, cognitive friction drops dramatically.',
    };
  }

  async proposeWeeklySchedule(tasks: any[], availableHours: number) {
    // Distribute tasks across weekdays ensuring no day exceeds 2.5 hours
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const plan: Record<string, any[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [{ title: 'Gentle catch-up or restorative buffer', duration: 30, isBuffer: true }],
      Sunday: [{ title: 'Weekly review & mindful planning for next week', duration: 30, isBuffer: true }],
    };

    let dayIdx = 0;
    for (const t of tasks) {
      const assignedDay = days[dayIdx % days.length];
      plan[assignedDay].push(t);
      dayIdx++;
    }

    return {
      weeklyPlan: plan,
      totalHoursScheduled: Math.min(availableHours, 10),
      note: 'Wednesday and the weekend incorporate restorative buffers to prevent planning fatigue.',
    };
  }
}

// Global assistant instance
export const aiAssistant: PlanningAssistant = new DeterministicPlanningAssistant();
