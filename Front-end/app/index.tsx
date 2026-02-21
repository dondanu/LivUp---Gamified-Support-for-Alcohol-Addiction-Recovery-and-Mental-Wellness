import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_SHOWN_KEY = '@intro_shown';

export default function Index() {
  const { user, loading } = useAuth();
  const navigation = useNavigation<any>();
  const [checkingIntro, setCheckingIntro] = useState(true);

  useEffect(() => {
    checkIntroStatus();
  }, []);

  const checkIntroStatus = async () => {
    try {
      const introShown = await AsyncStorage.getItem(INTRO_SHOWN_KEY);
      
      if (!loading) {
        if (!introShown && !user) {
          // First time user - show intro
          navigation.reset({
            index: 0,
            routes: [{ name: 'Intro' as never }],
          });
        } else if (user) {
          // Logged in user - go to tabs
          navigation.reset({
            index: 0,
            routes: [{ name: 'Tabs' as never }],
          });
        } else {
          // Returning user - go to auth
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' as never }],
          });
        }
      }
    } catch (error) {
      console.error('Error checking intro status:', error);
    } finally {
      setCheckingIntro(false);
    }
  };

  useEffect(() => {
    if (!loading && !checkingIntro) {
      checkIntroStatus();
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4ECDC4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
