export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  timezone: string;
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

export interface LifeArea {
  id: string;
  name: string;
  color: string;
  icon: string;
  isSystem: boolean;
}

export interface Dream {
  id: string;
  userId: string;
  lifeAreaId?: string | null;
  lifeArea?: LifeArea | null;
  title: string;
  description?: string | null;
  motivation?: string | null;
  timeframe?: string | null;
  targetDate?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  coverColor: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  successCriteria?: string | null;
  progress: number;
  goalsCount?: number;
  milestonesCount?: number;
  tasksCount?: number;
  completedTasksCount?: number;
  goals?: Goal[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  dreamId?: string | null;
  dream?: { id: string; title: string; coverColor: string } | null;
  title: string;
  description?: string | null;
  horizon: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
  startDate?: string | null;
  targetDate?: string | null;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedHours: number;
  successCriteria?: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  progress: number;
  milestones?: Milestone[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string | null;
  targetDate?: string | null;
  order: number;
  isCompleted: boolean;
  completedAt?: string | null;
  tasks?: Task[];
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface Task {
  id: string;
  userId: string;
  goalId?: string | null;
  goal?: { id: string; title: string; dream?: { coverColor: string } | null } | null;
  milestoneId?: string | null;
  milestone?: { id: string; title: string } | null;
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
  completedAt?: string | null;
  subtaskItems?: Subtask[];
  scheduledBlocks?: ScheduledBlock[];
  createdAt: string;
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

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category: string;
  frequency: 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'CUSTOM';
  targetDaysPerWeek: number;
  selectedWeekdays?: string | null;
  reminderTime?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  currentStreak: number;
  bestStreak: number;
  plantStage: 'SEED' | 'SPROUT' | 'BUD' | 'BLOOM' | 'FOREST';
  isCompletedToday?: boolean;
  logsCount?: number;
  logs?: HabitLog[];
  lifeArea?: LifeArea | null;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  isCompleted: boolean;
}

export interface FocusSession {
  id: string;
  taskId?: string | null;
  task?: { title: string } | null;
  targetMinutes: number;
  actualMinutes: number;
  startedAt: string;
  endedAt?: string | null;
  status: 'COMPLETED' | 'STOPPED_EARLY' | 'CANCELLED';
  notes?: string | null;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  energy: string;
  stress?: string | null;
  notes?: string | null;
}

export interface JournalEntry {
  id: string;
  date: string;
  prompt?: string | null;
  content: string;
  tags?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  plannedTasksCount: number;
  completedTasksCount: number;
  habitRate: number;
  focusMinutes: number;
  wins?: string | null;
  struggles?: string | null;
  continuationNotes?: string | null;
  nextWeekPriorities?: string | null;
  createdAt: string;
}
