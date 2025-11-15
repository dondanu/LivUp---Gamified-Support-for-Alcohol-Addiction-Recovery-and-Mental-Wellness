import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { register, login, getProfile, logout, tokenManager } from '@/src/api';
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
      const response = await getProfile();
      
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
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // If profile fetch fails, user might not be authenticated
      setUser(null);
      setProfile(null);
      // Re-throw if it's a network error so we can handle it appropriately
      if (error.message && error.message.includes('Cannot connect')) {
        throw error;
      }
    }
  };

  useEffect(() => {
    // Check if user is already authenticated (has token)
    const checkAuth = async () => {
      try {
        // Check if we have a token first
        const token = await tokenManager.getToken();
        
        if (token) {
          // Only try to fetch profile if we have a token
          await fetchProfile();
        } else {
          // No token, user is not authenticated
          setUser(null);
          setProfile(null);
        }
      } catch (error: any) {
        // Not authenticated or token expired or network error
        console.log('Auth check failed:', error.message);
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
      const response = await register({
        username: username || email.split('@')[0],
        password,
        email,
        isAnonymous: false,
      });

      // Set user from response
      setUser(response.user);
      
      // Fetch profile
      await fetchProfile();

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Extract error message from Axios error response
      let errorMessage = 'Failed to sign up';
      
      // Handle validation errors with details array
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        // Get the first validation error message
        const firstError = error.response.data.details[0];
        errorMessage = firstError.msg || error.response.data.error || errorMessage;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { error: { message: errorMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Backend uses username for login, but we'll try email first
      // If backend supports email login, use email; otherwise extract username
      const username = email.includes('@') ? email.split('@')[0] : email;
      
      const response = await login({ username, password });

      // Set user from response
      setUser(response.user);
      
      // Fetch profile
      await fetchProfile();

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Extract error message from Axios error response
      let errorMessage = 'Failed to sign in';
      
      // Handle validation errors with details array
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const firstError = error.response.data.details[0];
        errorMessage = firstError.msg || error.response.data.error || errorMessage;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      await logout();
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
      const response = await register({
        username: randomUsername,
        password: Math.random().toString(36),
        isAnonymous: true,
      });

      setUser(response.user);
      await fetchProfile();

      return { error: null };
    } catch (error: any) {
      console.error('Anonymous sign in error:', error);
      
      // Extract error message from Axios error response
      let errorMessage = 'Failed to sign in anonymously';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { error: { message: errorMessage } };
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
