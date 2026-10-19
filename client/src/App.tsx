import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';

// Layout
import { AppShell } from './components/layout/AppShell.js';

// Public Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { SignupPage } from './pages/SignupPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';

// Authenticated Pages
import { TodayPage } from './pages/TodayPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { DreamsPage } from './pages/DreamsPage.js';
import { DreamDetailPage } from './pages/DreamDetailPage.js';
import { GoalsPage } from './pages/GoalsPage.js';
import { TasksPage } from './pages/TasksPage.js';
import { CalendarPage } from './pages/CalendarPage.js';
import { HabitsPage } from './pages/HabitsPage.js';
import { FocusPage } from './pages/FocusPage.js';
import { WellnessPage } from './pages/WellnessPage.js';
import { ReviewsPage } from './pages/ReviewsPage.js';
import { InsightsPage } from './pages/InsightsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30s
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Authenticated Application Routes */}
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Navigate to="/app/today" replace />} />
                <Route path="today" element={<TodayPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="dreams" element={<DreamsPage />} />
                <Route path="dreams/new" element={<DreamsPage />} />
                <Route path="dreams/:dreamId" element={<DreamDetailPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="goals/:goalId" element={<GoalsPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="habits" element={<HabitsPage />} />
                <Route path="focus" element={<FocusPage />} />
                <Route path="wellness" element={<WellnessPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="insights" element={<InsightsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/security" element={<SettingsPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
