export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  timezone: string;
  lifePurpose?: string | null;
  sixMonthGoalTitle?: string | null;
  sixMonthGoalDesc?: string | null;
  sixMonthGoalTarget?: string | null;
  onboardingCompleted: boolean;
  coinBalance: number;
  defaultTaskReward: number;
  defaultPenalty: number;
  defaultPenaltyEnabled: boolean;
  profile?: UserProfile | null;
  settings?: UserSettings | null;
}

export interface UserProfile {
  bio?: string | null;
  currentHorizon: string;
  focusDuration: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  weekStartDay: string;
}

export interface UserSettings {
  theme: string;
  wellnessEnabled: boolean;
  gamificationEnabled: boolean;
  notificationsEnabled: boolean;
  dailyCheckInTime: string;
  weeklyReviewDay: string;
}

export interface GoalPoint {
  id: string;
  title: string;
  description?: string | null;
  targetDate?: string | null;
  order: number;
  isCompleted: boolean;
  completedAt?: string | null;
  tasks?: Task[];
}

export interface SixMonthOverview {
  lifePurpose?: string | null;
  sixMonthGoalTitle?: string | null;
  sixMonthGoalDesc?: string | null;
  sixMonthGoalTarget?: string | null;
  progress: number;
  points: GoalPoint[];
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface ScheduledBlock {
  id: string;
  userId: string;
  taskId?: string | null;
  task?: Task | null;
  title: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  color: string;
  isOverride: boolean;
}

export interface Task {
  id: string;
  userId: string;
  goalId?: string | null;
  goal?: any;
  milestoneId?: string | null;
  goalPointId?: string | null;
  goalPoint?: { id: string; title: string } | null;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED';
  priority: 'MUST_DO' | 'SHOULD_DO' | 'OPTIONAL';
  dueDate?: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  estimatedMinutes: number;
  actualMinutes: number;
  tags?: string | null;
  rewardCoins: number;
  penaltyCoins: number;
  penaltyEnabled: boolean;
  rewardAwarded: boolean;
  completedAt?: string | null;
  subtaskItems?: Subtask[];
  scheduledBlocks?: ScheduledBlock[];
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category: string;
  frequency: 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'CUSTOM';
  targetDaysPerWeek: number;
  selectedWeekdays?: string | null;
  scheduledTime?: string | null;
  reminderTime?: string | null;
  rewardCoins: number;
  penaltyCoins: number;
  penaltyEnabled: boolean;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  currentStreak: number;
  bestStreak: number;
  plantStage: 'SEED' | 'SPROUT' | 'BUD' | 'BLOOM' | 'FOREST';
  isCompletedToday?: boolean;
  logsCount?: number;
  logs?: HabitLog[];
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  isCompleted: boolean;
  coinsAwarded?: number;
  rewardAwarded?: boolean;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'REWARD' | 'PENALTY' | 'REDEMPTION' | 'ADJUSTMENT';
  description: string;
  taskId?: string | null;
  habitId?: string | null;
  rewardId?: string | null;
  createdAt: string;
}

export interface CoinLedger {
  balance: number;
  defaultTaskReward: number;
  defaultPenalty: number;
  defaultPenaltyEnabled: boolean;
  totalEarned: number;
  totalSpent: number;
  totalPenalties: number;
  transactions: CoinTransaction[];
}

export interface PersonalReward {
  id: string;
  name: string;
  title?: string;
  description?: string | null;
  coinCost: number;
  icon: string;
  active: boolean;
  _count?: { redemptions: number };
}

export interface HeatmapDay {
  date: string;
  dayOfWeek: number;
  tasksCompleted: number;
  tasksScheduled: number;
  habitsCompleted: number;
  habitsExpected: number;
  coinsEarned: number;
  totalActivity: number;
  level: number;
  isToday?: boolean;
}

export interface HeatmapResponse {
  days: HeatmapDay[];
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  totalCompletedTasks: number;
  today?: string;
  todayActive?: boolean;
  todayCompletedCount?: number;
}

// Legacy type compatibility
export interface Dream {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  category: string;
  lifeAreaId?: string | null;
  lifeArea?: any;
  motivation?: string | null;
  goalsCount?: number;
  completedTasksCount?: number;
  tasksCount?: number;
  coverColor?: any;
  progress: number;
  goals?: any[];
  milestones?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  wins?: string | null;
  challenges?: string | null;
  learnings?: string | null;
  rating?: number | null;
  completedTasksCount?: number;
  habitRate?: number;
  focusMinutes?: number;
  nextWeekPriorities?: string | null;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  content: string;
  prompt?: string | null;
  mood?: string | null;
  tags?: string | null;
  createdAt: string;
}

