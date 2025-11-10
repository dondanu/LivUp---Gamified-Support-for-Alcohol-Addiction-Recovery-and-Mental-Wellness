import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Profile } from '@/types/database.types';

interface User {
  id: string;
  username: string;
  email: string | null;
  isAnonymous: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
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
      const response = await api.getProfile();
      
      // Map backend response to frontend User type
      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        isAnonymous: response.user.is_anonymous,
      };
      setUser(userData);

      // Map backend profile to frontend Profile type
      const profileData: Profile = {
        id: response.profile.id,
        username: response.user.username,
        avatar_level: response.profile.avatar_type ? parseInt(response.profile.avatar_type) || 1 : 1,
        is_anonymous: response.user.is_anonymous,
        total_points: response.profile.total_points || 0,
        current_streak: response.profile.current_streak || 0,
        longest_streak: response.profile.longest_streak || 0,
        level: `Level ${response.profile.level_id || 1}`, // You may need to fetch level name
        created_at: response.profile.created_at,
        updated_at: response.profile.updated_at,
      };
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If profile fetch fails, user might not be authenticated
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Check if user is already authenticated (has token)
    const checkAuth = async () => {
      try {
        await fetchProfile();
      } catch (error) {
        // Not authenticated or token expired
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const response = await api.register(
        username || email.split('@')[0],
        password,
        email,
        false
      );

      // Set user from response
      setUser(response.user);
      
      // Fetch profile
      await fetchProfile();

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: { message: error.message || 'Failed to sign up' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Backend uses username for login, but we'll try email first
      // If backend supports email login, use email; otherwise extract username
      const username = email.includes('@') ? email.split('@')[0] : email;
      
      const response = await api.login(username, password);

      // Set user from response
      setUser(response.user);
      
      // Fetch profile
      await fetchProfile();

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: { message: error.message || 'Failed to sign in' } };
    }
  };

  const signOut = async () => {
    try {
      await api.logout();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear local state even if API call fails
      setUser(null);
      setProfile(null);
    }
  };

  const signInAnonymously = async () => {
    try {
      // Generate a random username for anonymous user
      const randomUsername = `anonymous_${Math.random().toString(36).substring(7)}`;
      const response = await api.register(
        randomUsername,
        Math.random().toString(36),
        undefined,
        true
      );

      setUser(response.user);
      await fetchProfile();

      return { error: null };
    } catch (error: any) {
      console.error('Anonymous sign in error:', error);
      return { error: { message: error.message || 'Failed to sign in anonymously' } };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile();
    }
  };

  const value = {
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
