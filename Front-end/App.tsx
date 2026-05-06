import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Home, Activity, TrendingUp, Target, User } from 'lucide-react-native';
import ErrorBoundary from './components/ErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';
import SystemNavigationBar from 'react-native-system-navigation-bar';

// Only ignore specific known warnings, not all errors
if (__DEV__) {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'Sending `onAnimatedValueUpdate` with no listeners registered',
  ]);
}

// Screens
import IntroScreen from './app/intro';
import LoginScreen from './app/(auth)/login';
import RegisterScreen from './app/(auth)/register';
import HomeScreen from './app/(tabs)/index';
import TrackScreen from './app/(tabs)/track';
import ProgressScreen from './app/(tabs)/progress';
import ChallengesScreen from './app/(tabs)/challenges';
import ProfileScreen from './app/(tabs)/profile';
import SOSScreen from './app/sos';
import ChallengeDetailScreen from './app/challenge-detail';
import MusicTherapyChallenge from './app/challenges/music-therapy';
import DeepBreathingChallenge from './app/challenges/deep-breathing';
import NotFoundScreen from './app/+not-found';
import IndexScreen from './app/index';

// Profile Enhancement Screens
import CustomizeProfileScreen from './app/customize-profile';
import AchievementGalleryScreen from './app/achievement-gallery';
import PersonalMilestonesScreen from './app/personal-milestones';
import PersonalJournalScreen from './app/personal-journal';
import SettingsScreen from './app/settings-screen';
import SocialSharingScreen from './app/social-sharing';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4ECDC4',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Journey"
        component={TrackScreen}
        options={{
          tabBarIcon: ({ size, color }) => <Activity size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ size, color }) => <TrendingUp size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Challenges"
        component={ChallengesScreen}
        options={{
          tabBarIcon: ({ size, color }) => <Target size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading, isAnonymous, forceShowIntro } = useAuth();
  const [introShown, setIntroShown] = useState<boolean | null>(null);

  useEffect(() => {
    console.log('[RootNavigator] useEffect: Checking intro status');
    console.log('[RootNavigator] useEffect: user:', user ? 'exists' : 'null');
    console.log('[RootNavigator] useEffect: isAnonymous:', isAnonymous);
    console.log('[RootNavigator] useEffect: loading:', loading);
    console.log('[RootNavigator] useEffect: forceShowIntro:', forceShowIntro);
    
    const checkIntro = async () => {
      try {
        const shown = await AsyncStorage.getItem('@intro_shown');
        console.log('[RootNavigator] checkIntro: intro_shown flag:', shown);
        setIntroShown(shown === 'true');
      } catch (error) {
        console.error('[RootNavigator] checkIntro: Error checking intro status:', error);
        setIntroShown(false); // Default to showing intro on error
      }
    };
    checkIntro();
  }, [user, isAnonymous, loading, forceShowIntro]);

  if (loading || introShown === null) {
    console.log('[RootNavigator] Showing loading screen - loading:', loading, 'introShown:', introShown);
    return <IndexScreen />;
  }

  // Determine which navigator to show
  const isAuthenticated = user || isAnonymous;
  const shouldShowIntro = !introShown || forceShowIntro; // FORCE INTRO IF FLAG IS SET
  
  console.log('[RootNavigator] Navigation decision:');
  console.log('[RootNavigator] - isAuthenticated:', isAuthenticated);
  console.log('[RootNavigator] - introShown:', introShown);
  console.log('[RootNavigator] - forceShowIntro:', forceShowIntro);
  console.log('[RootNavigator] - shouldShowIntro:', shouldShowIntro);
  
  let finalDecision;
  if (isAuthenticated && !forceShowIntro) { // Don't go to tabs if forcing intro
    finalDecision = 'Tabs';
  } else if (shouldShowIntro) {
    finalDecision = 'Intro';
  } else {
    finalDecision = 'Auth';
  }
  
  console.log('[RootNavigator] - Final decision:', finalDecision);
  console.log('[RootNavigator] - Will render stack with initialRouteName:', finalDecision);

  return (
    <Stack.Navigator 
      key={`${isAuthenticated ? 'authenticated' : 'unauthenticated'}-${forceShowIntro ? 'force-intro' : 'normal'}`}
      screenOptions={{ 
        headerShown: false,
        animation: 'none',
        animationDuration: 0,
      }}
      initialRouteName={finalDecision}
    >
      {isAuthenticated && !forceShowIntro ? (
        <>
          {console.log('[RootNavigator] Rendering authenticated stack (Tabs)')}
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="SOS" component={SOSScreen} />
          <Stack.Screen 
            name="ChallengeDetail" 
            component={ChallengeDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MusicTherapyChallenge" 
            component={MusicTherapyChallenge}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DeepBreathingChallenge" 
            component={DeepBreathingChallenge}
            options={{ headerShown: false }}
          />
          {/* Profile Enhancement Screens */}
          <Stack.Screen 
            name="CustomizeProfile" 
            component={CustomizeProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AchievementGallery" 
            component={AchievementGalleryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PersonalMilestones" 
            component={PersonalMilestonesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PersonalJournal" 
            component={PersonalJournalScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SettingsScreen" 
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SocialSharing" 
            component={SocialSharingScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          {console.log('[RootNavigator] Rendering unauthenticated stack (Intro/Auth)')}
          {console.log('[RootNavigator] - shouldShowIntro:', shouldShowIntro)}
          {console.log('[RootNavigator] - forceShowIntro:', forceShowIntro)}
          {console.log('[RootNavigator] - Will show Intro screen:', shouldShowIntro)}
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      )}
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Hide Android navigation bar on app start
    if (Platform.OS === 'android') {
      SystemNavigationBar.navigationHide();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar 
              barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} 
              translucent
              backgroundColor="transparent"
            />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

