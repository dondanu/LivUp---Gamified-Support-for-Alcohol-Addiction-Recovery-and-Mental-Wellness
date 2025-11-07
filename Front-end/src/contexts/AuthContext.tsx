import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

type Profile = {
  id: number;
  user_id: number;
  username?: string;
  total_points?: number;
  current_streak?: number;
  longest_streak?: number;
  level_id?: number;
  avatar_type?: string;
  days_sober?: number;
  level?: string;
  avatar_level?: number;
};

type User = {
  id: number;
  username: string;
  email?: string | null;
  is_anonymous?: boolean;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (username: string, password: string, email?: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await apiClient.getProfile();
      setUser(data.user);
      setProfile(data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await fetchProfile();
      } catch (error) {
        // Not logged in
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const signUp = async (username: string, password: string, email?: string) => {
    try {
      const data = await apiClient.register(username, password, email, false);
      setUser(data.user);
      await fetchProfile();
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Registration failed' };
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      const data = await apiClient.login(username, password);
      setUser(data.user);
      await fetchProfile();
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  };

  const signOut = async () => {
    await apiClient.logout();
    setUser(null);
    setProfile(null);
  };

  const signInAnonymously = async () => {
    try {
      const randomUsername = `anonymous_${Date.now()}`;
      const data = await apiClient.register(randomUsername, 'temp_password', undefined, true);
      setUser(data.user);
      await fetchProfile();
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Anonymous login failed' };
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    signInAnonymously,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
