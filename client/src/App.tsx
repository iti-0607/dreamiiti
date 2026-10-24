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

// Authenticated Core Pages
import { DashboardPage } from './pages/DashboardPage.js';
import { GoalsPage } from './pages/GoalsPage.js';
import { HabitsPage } from './pages/HabitsPage.js';
import { CalendarPage } from './pages/CalendarPage.js';
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

              {/* Authenticated Application Routes (Exact 5 Discipline Pillars) */}
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="goals/:goalId" element={<GoalsPage />} />
                <Route path="habits" element={<HabitsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/*" element={<SettingsPage />} />

                {/* Legacy route redirects to simplified pillars */}
                <Route path="today" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="tasks" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dreams" element={<Navigate to="/app/goals" replace />} />
                <Route path="dreams/*" element={<Navigate to="/app/goals" replace />} />
                <Route path="focus" element={<Navigate to="/app/calendar" replace />} />
                <Route path="wellness" element={<Navigate to="/app/habits" replace />} />
                <Route path="reviews" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="insights" element={<Navigate to="/app/dashboard" replace />} />
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
