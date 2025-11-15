import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Home, Activity, TrendingUp, Target, User } from 'lucide-react-native';
import 'react-native-gesture-handler';

// Screens
import LoginScreen from './app/(auth)/login';
import RegisterScreen from './app/(auth)/register';
import HomeScreen from './app/(tabs)/index';
import TrackScreen from './app/(tabs)/track';
import ProgressScreen from './app/(tabs)/progress';
import ChallengesScreen from './app/(tabs)/challenges';
import ProfileScreen from './app/(tabs)/profile';
import SOSScreen from './app/sos';
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
      screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="SOS" component={SOSScreen} />
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
      <NavigationContainer>
        <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

