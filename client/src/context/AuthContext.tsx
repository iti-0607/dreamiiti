import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  updateSettings: (data: any) => Promise<void>;
  completeOnboarding: (data: any) => Promise<User>;
  refreshUser: () => Promise<void>;
  updateCoinBalance: (balance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('dream_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token) {
      localStorage.setItem('dream_token', res.token);
    }
    setUser(res.user);
    return res.user;
  };

  const signup = async (name: string, email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/signup', { name, email, password });
    if (res.token) {
      localStorage.setItem('dream_token', res.token);
    }
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    }
    localStorage.removeItem('dream_token');
    setUser(null);
  };

  const completeOnboarding = async (data: any): Promise<User> => {
    const res = await api.post('/auth/onboarding', data);
    if (res.success && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Failed to complete onboarding');
  };

  const updateProfile = async (data: any) => {
    const res = await api.put('/auth/profile', data);
    if (res.success && user) {
      setUser({ ...user, profile: res.profile });
    }
  };

  const updateSettings = async (data: any) => {
    const res = await api.put('/auth/settings', data);
    if (res.success && user) {
      setUser({ ...user, settings: res.settings });
    }
  };

  const updateCoinBalance = (balance: number) => {
    setUser((prev) => (prev ? { ...prev, coinBalance: balance } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        updateSettings,
        completeOnboarding,
        refreshUser,
        updateCoinBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
