import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_SHOWN_KEY = '@intro_shown';

export default function Index() {
  console.log('[IndexScreen] Component rendered');
  const { user, loading, isAnonymous } = useAuth();
  const navigation = useNavigation<any>();
  const [checkingIntro, setCheckingIntro] = useState(true);

  useEffect(() => {
    console.log('[IndexScreen] useEffect: Component mounted, starting intro check');
    checkIntroStatus();
  }, []);

  useEffect(() => {
    console.log('[IndexScreen] useEffect: Auth state changed');
    console.log('[IndexScreen] - loading:', loading);
    console.log('[IndexScreen] - checkingIntro:', checkingIntro);
    console.log('[IndexScreen] - user:', user ? 'exists' : 'null');
    console.log('[IndexScreen] - isAnonymous:', isAnonymous);
    
    if (!loading && !checkingIntro) {
      console.log('[IndexScreen] useEffect: Auth loaded and intro checked, re-checking status');
      checkIntroStatus();
    }
  }, [user, loading, isAnonymous]);

  const checkIntroStatus = async () => {
    console.log('[IndexScreen] checkIntroStatus: Starting intro status check');
    try {
      const introShown = await AsyncStorage.getItem(INTRO_SHOWN_KEY);
      console.log('[IndexScreen] checkIntroStatus: intro_shown flag:', introShown);
      console.log('[IndexScreen] checkIntroStatus: loading:', loading);
      console.log('[IndexScreen] checkIntroStatus: user:', user ? 'exists' : 'null');
      console.log('[IndexScreen] checkIntroStatus: isAnonymous:', isAnonymous);
      
      if (!loading) {
        if (user || isAnonymous) {
          console.log('[IndexScreen] checkIntroStatus: User authenticated, navigating to Tabs');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Tabs' as never }],
          });
        } else if (!introShown) {
          console.log('[IndexScreen] checkIntroStatus: Intro not shown, navigating to Intro');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Intro' as never }],
          });
        } else {
          console.log('[IndexScreen] checkIntroStatus: Intro shown, navigating to Auth');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' as never }],
          });
        }
      } else {
        console.log('[IndexScreen] checkIntroStatus: Still loading, waiting...');
      }
    } catch (error) {
      console.error('[IndexScreen] checkIntroStatus: Error checking intro status:', error);
    } finally {
      setCheckingIntro(false);
      console.log('[IndexScreen] checkIntroStatus: Intro status check completed');
    }
  };

  useEffect(() => {
    if (!loading && !checkingIntro) {
      checkIntroStatus();
    }
  }, [user, loading, isAnonymous]);

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
