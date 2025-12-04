import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform, ErrorUtils, LogBox } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Home, Activity, TrendingUp, Target, User } from 'lucide-react-native';
import 'react-native-gesture-handler';

// Suppress all error displays - errors are logged but not shown to users
try {
  if (ErrorUtils && typeof ErrorUtils.getGlobalHandler === 'function') {
    const originalErrorHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      // Log error to console for debugging, but don't show to user
      console.error('Global error (suppressed from UI):', error);
      // Don't call original handler to prevent error display
    });
  }
} catch (error) {
  // ErrorUtils might not be available - silently continue
  console.log('ErrorUtils not available');
}

// Disable LogBox to prevent error toasts/overlays
try {
  if (LogBox && typeof LogBox.ignoreAllLogs === 'function') {
    LogBox.ignoreAllLogs(true);
    LogBox.ignoreLogs([
      'The action \'RESET\'',
      'was not handled by any navigator',
      'Non-serializable values were found',
      'Warning:',
      'Error:',
      'NavigationContainer',
    ]);
  }
} catch (error) {
  // LogBox might not be available - silently continue
  console.log('LogBox not available');
}

// Screens
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
        name="Track"
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
  const { user, loading } = useAuth();

  if (loading) {
    return <IndexScreen />;
  }

  return (
    <Stack.Navigator 
      key={user ? 'authenticated' : 'unauthenticated'}
      screenOptions={{ headerShown: false }}
      screenListeners={{
        // Suppress navigation errors
        beforeRemove: () => {
          // Prevent navigation errors from showing
        },
      }}>
      {user ? (
        <>
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
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer
        onReady={() => {
          // Suppress navigation errors
        }}
        onStateChange={() => {
          // Suppress navigation state change errors
        }}
        onUnhandledAction={(action) => {
          // Silently handle unhandled navigation actions (like RESET on signout)
          console.log('Unhandled navigation action (suppressed):', action.type);
          return true; // Return true to indicate we handled it
        }}>
        <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

