import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';

const INTRO_SHOWN_KEY = '@intro_shown';

export default function IntroScreen() {
  console.log('[IntroScreen] ===== INTRO SCREEN COMPONENT RENDERED =====');
  const navigation = useNavigation();
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef<any>(null);

  useEffect(() => {
    console.log('[IntroScreen] useEffect: Component mounted - INTRO SCREEN IS ACTIVE');
    return () => {
      console.log('[IntroScreen] useEffect cleanup: Component unmounted');
    };
  }, []);

  const handleNavigateToLogin = () => {
    console.log('[IntroScreen] handleNavigateToLogin: User clicked Sign In/Sign Up button');
    
    // Mark intro as shown
    AsyncStorage.setItem(INTRO_SHOWN_KEY, 'true')
      .then(() => {
        console.log('[IntroScreen] handleNavigateToLogin: Intro shown flag set to true');
        // Navigate with replace (instant)
        console.log('[IntroScreen] handleNavigateToLogin: Navigating to Auth screen');
        (navigation as any).replace('Auth');
      })
      .catch((error) => {
        console.error('[IntroScreen] handleNavigateToLogin: Error setting intro flag:', error);
        // Still navigate even if flag setting fails
        (navigation as any).replace('Auth');
      });
  };

  return (
    <View style={styles.container}>
      {/* Full-Screen Looping Video */}
      <Video
        ref={videoRef}
        source={require('../assets/videos/final.mp4')}
        style={styles.backgroundMedia}
        resizeMode="cover"
        repeat
        muted
        playInBackground={false}
        playWhenInactive={false}
      />

      {/* Sign In Button - Fixed at Bottom */}
      <View style={styles.buttonWrapper}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleNavigateToLogin}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Sign In / Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundMedia: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 10,
  },
  signInButton: {
    backgroundColor: '#2750d8ff',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
