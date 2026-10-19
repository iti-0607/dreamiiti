import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, selectedAreas?: string[]) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  updateSettings: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token) {
      localStorage.setItem('dream_token', res.token);
    }
    setUser(res.user);
  };

  const signup = async (name: string, email: string, password: string, selectedAreas?: string[]) => {
    const res = await api.post('/auth/signup', { name, email, password, selectedAreas });
    if (res.token) {
      localStorage.setItem('dream_token', res.token);
    }
    setUser(res.user);
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
        refreshUser,
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
