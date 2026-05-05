import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { register, login, getProfile, logout, tokenManager } from '@/src/api';
import { Profile } from '@/types/database.types';
import { anonymousStorage, AnonymousUserData } from '@/lib/anonymousStorage';

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
  isAnonymous: boolean;
  anonymousData: AnonymousUserData | null;
  pendingNavigation: string | null;
  forceShowIntro: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<{ error: any }>;
  convertToRegistered: (email: string, password: string, username: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  refreshAnonymousData: () => Promise<void>;
  setPendingNavigation: (screen: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousData, setAnonymousData] = useState<AnonymousUserData | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [forceShowIntro, setForceShowIntro] = useState(false);

  const fetchProfile = async () => {
    try {
      console.log('[AuthContext] fetchProfile: Fetching latest profile data');
      const response = await getProfile();
      
      console.log('[AuthContext] fetchProfile: Profile response:', {
        total_points: response.profile.total_points,
        level_id: response.profile.level_id,
      });
      
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
        user_id: response.profile.user_id,
        username: response.user.username,
        avatar_level: response.profile.level_id || 1, // Use level_id as avatar_level
        avatar_type: response.profile.avatar_type || 'boy', // Add avatar_type
        is_anonymous: response.user.is_anonymous,
        total_points: response.profile.total_points || 0,
        current_streak: response.profile.current_streak || 0,
        longest_streak: response.profile.longest_streak || 0,
        level: `Level ${response.profile.level_id || 1}`,
        level_id: response.profile.level_id || 1, // Add level_id
        created_at: response.profile.created_at,
        updated_at: response.profile.updated_at,
      };
      
      console.log('[AuthContext] fetchProfile: Setting profile state with:', {
        total_points: profileData.total_points,
        level_id: profileData.level_id,
        avatar_type: profileData.avatar_type,
      });
      
      setProfile(profileData);
    } catch (error: any) {
      // Don't log error if we're in anonymous mode
      const isAnonMode = await anonymousStorage.isAnonymousMode();
      if (!isAnonMode) {
        console.error('Error fetching profile:', error);
      }
      // If profile fetch fails, user might not be authenticated
      setUser(null);
      setProfile(null);
      // Re-throw so caller can handle
      throw error;
    }
  };

  useEffect(() => {
    console.log('[AuthContext] useEffect: Starting auth check');
    // Check if user is already authenticated (has token)
    const checkAuth = async () => {
      try {
        console.log('[AuthContext] checkAuth: Checking authentication status');
        // First check if in anonymous mode
        const isAnonMode = await anonymousStorage.isAnonymousMode();
        console.log('[AuthContext] checkAuth: Anonymous mode:', isAnonMode);
        
        if (isAnonMode) {
          // User is in anonymous mode - no API calls needed
          console.log('[AuthContext] checkAuth: Setting anonymous mode');
          setIsAnonymous(true);
          const data = await anonymousStorage.getData();
          setAnonymousData(data);
          setUser(null);
          setProfile(null);
          setLoading(false);
          console.log('[AuthContext] checkAuth: Anonymous mode setup complete');
          return;
        }
        
        // Check if we have a token
        const token = await tokenManager.getToken();
        console.log('[AuthContext] checkAuth: Token exists:', !!token);
        
        if (token) {
          // Only try to fetch profile if we have a token
          try {
            console.log('[AuthContext] checkAuth: Fetching user profile');
            await fetchProfile();
            console.log('[AuthContext] checkAuth: Profile fetched successfully');
          } catch (profileError: any) {
            // Profile fetch failed - clear auth state
            console.log('[AuthContext] checkAuth: Profile fetch failed, clearing auth state');
            setUser(null);
            setProfile(null);
          }
        } else {
          // No token, user is not authenticated
          console.log('[AuthContext] checkAuth: No token found, user not authenticated');
          setUser(null);
          setProfile(null);
        }
      } catch (error: any) {
        // Not authenticated or token expired or network error
        console.log('[AuthContext] checkAuth: Auth check failed:', error.message);
        setUser(null);
        setProfile(null);
      } finally {
        console.log('[AuthContext] checkAuth: Auth check completed, setting loading to false');
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
    console.log('[AuthContext] signOut: Starting sign out process');
    
    // FORCE INTRO IMMEDIATELY - BEFORE ANYTHING ELSE
    console.log('[AuthContext] signOut: 🚀 SETTING forceShowIntro = true IMMEDIATELY');
    setForceShowIntro(true);
    
    try {
      if (isAnonymous) {
        console.log('[AuthContext] signOut: User is anonymous, disabling anonymous mode');
        await anonymousStorage.disableAnonymousMode();
        setIsAnonymous(false);
        setAnonymousData(null);
        setUser(null);
        setProfile(null);
        console.log('[AuthContext] signOut: Anonymous mode disabled successfully');
      } else {
        console.log('[AuthContext] signOut: User is registered, calling logout API');
        await logout();
        setUser(null);
        setProfile(null);
        console.log('[AuthContext] signOut: Registered user logged out successfully');
      }
      
      // Clear intro shown flag to force showing intro screen
      console.log('[AuthContext] signOut: Clearing intro shown flag to show intro screen');
      try {
        await AsyncStorage.removeItem('@intro_shown');
        console.log('[AuthContext] signOut: ✅ Successfully removed @intro_shown flag');
        
        // Verify it was actually removed
        const checkFlag = await AsyncStorage.getItem('@intro_shown');
        console.log('[AuthContext] signOut: ✅ Verification - @intro_shown flag is now:', checkFlag);
        
      } catch (flagError) {
        console.error('[AuthContext] signOut: ❌ Error removing @intro_shown flag:', flagError);
      }
      
      console.log('[AuthContext] signOut: Sign out process completed successfully');
      
      // Reset the force flag after a longer delay to ensure navigation completes
      setTimeout(() => {
        console.log('[AuthContext] signOut: 🔄 Resetting forceShowIntro flag');
        setForceShowIntro(false);
      }, 500); // Increased delay to 500ms
      
    } catch (error) {
      console.error('[AuthContext] signOut: Error during sign out:', error);
      if (isAnonymous) {
        console.log('[AuthContext] signOut: Fallback - force clearing anonymous mode');
        await anonymousStorage.disableAnonymousMode();
        setIsAnonymous(false);
        setAnonymousData(null);
      }
      setUser(null);
      setProfile(null);
      // Still clear intro flag even on error
      console.log('[AuthContext] signOut: Fallback - clearing intro flag even on error');
      try {
        await AsyncStorage.removeItem('@intro_shown');
        console.log('[AuthContext] signOut: ✅ Fallback - Successfully removed @intro_shown flag');
      } catch (flagError) {
        console.error('[AuthContext] signOut: ❌ Fallback - Error removing @intro_shown flag:', flagError);
      }
      console.log('[AuthContext] signOut: Fallback sign out completed');
      
      // Reset force flag even on error
      setTimeout(() => {
        console.log('[AuthContext] signOut: 🔄 Fallback - Resetting forceShowIntro flag');
        setForceShowIntro(false);
      }, 500);
    }
  };

  const signInAnonymously = async () => {
    try {
      // Enable anonymous mode (NO account creation!)
      await anonymousStorage.enableAnonymousMode();
      
      setIsAnonymous(true);
      const data = await anonymousStorage.getData();
      setAnonymousData(data);
      setUser(null);
      setProfile(null);

      return { error: null };
    } catch (error: any) {
      return { error: { message: 'Failed to start anonymous mode' } };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile();
    }
  };

  const refreshAnonymousData = async () => {
    if (isAnonymous) {
      const data = await anonymousStorage.getData();
      setAnonymousData(data);
    }
  };

  const convertToRegistered = async (email: string, password: string, username: string) => {
    try {
      // Get all anonymous data
      const anonData = await anonymousStorage.getData();
      
      if (!anonData) {
        return { error: { message: 'No anonymous data found' } };
      }
      
      // Create new account
      const response = await register({
        username,
        password,
        email,
        isAnonymous: false,
      });

      // Update user state
      setUser(response.user);
      await fetchProfile();
      
      // TODO: Upload all anonymous data to the server
      // For now, we'll just clear anonymous mode
      await anonymousStorage.disableAnonymousMode();
      setIsAnonymous(false);
      setAnonymousData(null);

      return { error: null };
    } catch (error: any) {
      let errorMessage = 'Failed to create account';

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

  const value = {
    user,
    profile,
    loading,
    isAnonymous,
    anonymousData,
    pendingNavigation,
    forceShowIntro,
    signUp,
    signIn,
    signOut,
    signInAnonymously,
    convertToRegistered,
    refreshProfile,
    refreshAnonymousData,
    setPendingNavigation,
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
