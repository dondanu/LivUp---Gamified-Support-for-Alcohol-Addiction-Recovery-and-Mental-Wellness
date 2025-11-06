import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './src/contexts/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import LoginScreen from './src/screens/LoginScreen';
import SOSScreen from './src/screens/SOSScreen';

enableScreens();
const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabsNavigator() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Track" component={PlaceholderScreen} />
      <Tabs.Screen name="Challenges" component={PlaceholderScreen} />
      <Tabs.Screen name="Profile" component={PlaceholderScreen} />
    </Tabs.Navigator>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'dark-content'} />
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Root" component={TabsNavigator} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SOS" component={SOSScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
