"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('[DreamIITi Seed] Clearing previous development data...');
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.userAchievement.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.monthlyReview.deleteMany();
    await prisma.weeklyReview.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.moodEntry.deleteMany();
    await prisma.focusSession.deleteMany();
    await prisma.habitLog.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.scheduledBlock.deleteMany();
    await prisma.subtask.deleteMany();
    await prisma.task.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.dream.deleteMany();
    await prisma.lifeArea.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();
    console.log('[DreamIITi Seed] Creating demo user...');
    const passwordHash = await bcryptjs_1.default.hash('dream123', 12);
    const demoUser = await prisma.user.create({
        data: {
            email: 'demo@dreamiiti.app',
            name: 'Aarav Sharma',
            passwordHash,
            timezone: 'Asia/Kolkata',
            profile: {
                create: {
                    bio: 'Building systems, mastering computer science, and living with intentionality.',
                    currentHorizon: '3_months',
                    focusDuration: 25,
                    workingHoursStart: '08:30',
                    workingHoursEnd: '19:00',
                    weekStartDay: 'monday',
                },
            },
            settings: {
                create: {
                    theme: 'light',
                    wellnessEnabled: true,
                    gamificationEnabled: true,
                    notificationsEnabled: true,
                    dailyCheckInTime: '09:00',
                    weeklyReviewDay: 'sunday',
                },
            },
        },
    });
    console.log('[DreamIITi Seed] Creating life areas...');
    const careerArea = await prisma.lifeArea.create({
        data: { userId: demoUser.id, name: 'Career & Learning', color: '#2E6F52', icon: 'Briefcase', isSystem: true },
    });
    const healthArea = await prisma.lifeArea.create({
        data: { userId: demoUser.id, name: 'Health & Routine', color: '#3B7A57', icon: 'HeartPulse', isSystem: true },
    });
    const financialArea = await prisma.lifeArea.create({
        data: { userId: demoUser.id, name: 'Financial Freedom', color: '#E5A93C', icon: 'Coins', isSystem: true },
    });
    const creativeArea = await prisma.lifeArea.create({
        data: { userId: demoUser.id, name: 'Creativity & Hobbies', color: '#8E82B6', icon: 'Palette', isSystem: true },
    });
    const personalArea = await prisma.lifeArea.create({
        data: { userId: demoUser.id, name: 'Personal Growth', color: '#7B6FA1', icon: 'Sparkles', isSystem: true },
    });
    console.log('[DreamIITi Seed] Creating dreams...');
    const dream1 = await prisma.dream.create({
        data: {
            userId: demoUser.id,
            lifeAreaId: careerArea.id,
            title: 'Master Distributed Systems & Build a World-Class Portfolio Project',
            description: 'Deep dive into event-driven architecture, write production-grade TypeScript, and publish a showcase open-source project.',
            motivation: 'To gain true confidence in full-stack engineering and unlock high-impact career opportunities without burnout.',
            timeframe: '3_months',
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
            coverColor: '#2E6F52',
            priority: 'HIGH',
            successCriteria: 'Working repository with 90%+ test coverage, technical write-up, and interactive live demo.',
            progress: 45,
        },
    });
    const dream2 = await prisma.dream.create({
        data: {
            userId: demoUser.id,
            lifeAreaId: healthArea.id,
            title: 'Run a 10K with Ease & Sustainable Energy',
            description: 'Build aerobic endurance, maintain consistent hydration, and sleep 7.5 hours each night.',
            motivation: 'Clear thinking starts with physical vitality and waking up energized without caffeine reliance.',
            timeframe: '6_months',
            targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
            coverColor: '#3B7A57',
            priority: 'MEDIUM',
            successCriteria: 'Run 10km under 58 minutes feeling steady and strong throughout.',
            progress: 60,
        },
    });
    const dream3 = await prisma.dream.create({
        data: {
            userId: demoUser.id,
            lifeAreaId: creativeArea.id,
            title: 'Learn Fingerstyle Guitar & Play 3 Favorite Melodies',
            description: 'Spend 20 quiet minutes in the evening practicing acoustic guitar transitions.',
            motivation: 'An analog creative outlet that disconnects me from screens and recharges my spirit.',
            timeframe: '1_year',
            targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
            coverColor: '#8E82B6',
            priority: 'LOW',
            successCriteria: 'Smooth performance of 3 fingerstyle pieces without hesitations.',
            progress: 25,
        },
    });
    console.log('[DreamIITi Seed] Creating goals and milestones...');
    const goal1 = await prisma.goal.create({
        data: {
            userId: demoUser.id,
            dreamId: dream1.id,
            title: 'Complete Core Architecture & Backend Engine',
            description: 'Implement domain models, tenant isolation, and deterministic test suite.',
            horizon: 'MONTHLY',
            startDate: new Date(),
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            importance: 'HIGH',
            estimatedHours: 40,
            status: 'IN_PROGRESS',
            progress: 65,
        },
    });
    const milestone1 = await prisma.milestone.create({
        data: {
            userId: demoUser.id,
            goalId: goal1.id,
            title: 'Define domain schemas & test contracts',
            order: 0,
            isCompleted: true,
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
    });
    const milestone2 = await prisma.milestone.create({
        data: {
            userId: demoUser.id,
            goalId: goal1.id,
            title: 'Implement anti-procrastination endpoints & conflict checks',
            order: 1,
            isCompleted: true,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    });
    const milestone3 = await prisma.milestone.create({
        data: {
            userId: demoUser.id,
            goalId: goal1.id,
            title: 'Conduct end-to-end user journey tests',
            order: 2,
            isCompleted: false,
            targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
    });
    console.log('[DreamIITi Seed] Creating tasks...');
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30, 0);
    const task1 = await prisma.task.create({
        data: {
            userId: demoUser.id,
            goalId: goal1.id,
            milestoneId: milestone3.id,
            title: 'Verify calendar conflict warning and schedule blocks',
            description: 'Ensure overlap detection warns gracefully and lets user override cleanly.',
            priority: 'MUST_DO',
            dueDate: new Date(),
            scheduledStart: startOfToday,
            scheduledEnd: new Date(startOfToday.getTime() + 45 * 60 * 1000),
            estimatedMinutes: 45,
            actualMinutes: 40,
            status: 'COMPLETED',
            completedAt: new Date(),
            tags: 'Testing, Calendar',
            subtaskItems: {
                create: [
                    { title: 'Test overlapping time slot warning', isCompleted: true, order: 0 },
                    { title: 'Test deliberate override toggle', isCompleted: true, order: 1 },
                ],
            },
        },
    });
    const task2 = await prisma.task.create({
        data: {
            userId: demoUser.id,
            goalId: goal1.id,
            milestoneId: milestone3.id,
            title: 'Design Habit Garden growth animation states',
            description: 'Check that plant stages transition from SEED to SPROUT to BUD to BLOOM.',
            priority: 'MUST_DO',
            dueDate: new Date(),
            scheduledStart: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0),
            scheduledEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0, 0),
            estimatedMinutes: 60,
            status: 'TODO',
            tags: 'Design, UI',
            subtaskItems: {
                create: [
                    { title: 'Create SVGs for Seed, Sprout, and Bloom', isCompleted: true, order: 0 },
                    { title: 'Connect stage to streak calculation', isCompleted: false, order: 1 },
                ],
            },
        },
    });
    const task3 = await prisma.task.create({
        data: {
            userId: demoUser.id,
            goalId: goal1.id,
            title: 'Reflect in daily wellness journal',
            description: 'Take 5 minutes to celebrate progress and note down today’s calm moments.',
            priority: 'SHOULD_DO',
            dueDate: new Date(),
            estimatedMinutes: 15,
            status: 'TODO',
            tags: 'Wellness',
        },
    });
    console.log('[DreamIITi Seed] Creating calendar scheduled blocks...');
    await prisma.scheduledBlock.create({
        data: {
            userId: demoUser.id,
            taskId: task1.id,
            title: task1.title,
            startTime: task1.scheduledStart,
            endTime: task1.scheduledEnd,
            color: '#2E6F52',
        },
    });
    await prisma.scheduledBlock.create({
        data: {
            userId: demoUser.id,
            title: 'Mindful Lunch & Afternoon Walk',
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30, 0),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 30, 0),
            isBreak: true,
            color: '#E5A93C',
        },
    });
    await prisma.scheduledBlock.create({
        data: {
            userId: demoUser.id,
            taskId: task2.id,
            title: task2.title,
            startTime: task2.scheduledStart,
            endTime: task2.scheduledEnd,
            color: '#2E6F52',
        },
    });
    console.log('[DreamIITi Seed] Creating habits and logs...');
    const habit1 = await prisma.habit.create({
        data: {
            userId: demoUser.id,
            lifeAreaId: healthArea.id,
            name: 'Morning Hydration & 10-Minute Stretch',
            description: 'Drink 500ml water right after waking and stretch hips and spine.',
            category: 'Health',
            frequency: 'DAILY',
            targetDaysPerWeek: 7,
            currentStreak: 12,
            bestStreak: 21,
            plantStage: 'BUD',
        },
    });
    const habit2 = await prisma.habit.create({
        data: {
            userId: demoUser.id,
            lifeAreaId: careerArea.id,
            name: 'Deep Work Focus Block (45m)',
            description: 'Single-tasking session on high-leverage goals before checking messages.',
            category: 'Focus',
            frequency: 'WEEKDAYS',
            targetDaysPerWeek: 5,
            selectedWeekdays: '1,2,3,4,5',
            currentStreak: 8,
            bestStreak: 15,
            plantStage: 'BUD',
        },
    });
    const habit3 = await prisma.habit.create({
        data: {
            userId: demoUser.id,
            lifeAreaId: creativeArea.id,
            name: 'Acoustic Guitar Practice (15m)',
            description: 'Practice chords and transitions in a peaceful state.',
            category: 'Creativity',
            frequency: 'WEEKLY',
            targetDaysPerWeek: 4,
            currentStreak: 5,
            bestStreak: 8,
            plantStage: 'SPROUT',
        },
    });
    // Seed logs for the past 12 days
    for (let i = 1; i <= 12; i++) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        await prisma.habitLog.create({
            data: {
                userId: demoUser.id,
                habitId: habit1.id,
                date: dateStr,
                isCompleted: true,
            },
        });
    }
    console.log('[DreamIITi Seed] Creating focus sessions...');
    await prisma.focusSession.create({
        data: {
            userId: demoUser.id,
            taskId: task1.id,
            targetMinutes: 25,
            actualMinutes: 25,
            startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            endedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
            status: 'COMPLETED',
            notes: 'Deep flow state achieved. Clean code without distraction.',
        },
    });
    console.log('[DreamIITi Seed] Creating wellness and journal entry...');
    const todayStr = new Date().toISOString().split('T')[0];
    await prisma.moodEntry.create({
        data: {
            userId: demoUser.id,
            date: todayStr,
            mood: 'good',
            energy: 'high',
            stress: 'low',
            notes: 'Felt calm and purposeful this morning after stretching.',
        },
    });
    await prisma.journalEntry.create({
        data: {
            userId: demoUser.id,
            date: todayStr,
            prompt: 'What felt surprisingly manageable today?',
            content: 'Starting the refactor felt daunting yesterday, but once I committed to just 5 minutes of setup, the resistance evaporated. Showing up is truly 90% of the journey.',
            tags: 'Gratitude, Reflection, Anti-Procrastination',
        },
    });
    console.log('[DreamIITi Seed] Creating weekly review...');
    await prisma.weeklyReview.create({
        data: {
            userId: demoUser.id,
            weekStartDate: '2026-10-13',
            plannedTasksCount: 14,
            completedTasksCount: 12,
            habitRate: 88,
            focusMinutes: 320,
            wins: 'Consistently honored morning routine and completed the core backend logic without rushing.',
            struggles: 'Felt a bit tired on Thursday afternoon; took a short walk instead of forcing screen time.',
            continuationNotes: 'Keep the 25-minute focus intervals. They feel natural and sustainable.',
            nextWeekPriorities: 'Integrate the full calendar and finalize the Habit Garden visuals.',
        },
    });
    console.log('✅ [DreamIITi Seed] Demo data seeded successfully!');
    console.log('👉 Demo account credentials:');
    console.log('   Email: demo@dreamiiti.app');
    console.log('   Password: dream123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
