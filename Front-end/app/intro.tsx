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

const videos = [
  require('../assets/videos/a.mp4'),
  require('../assets/videos/b.mp4'),
  require('../assets/videos/c.mp4'),
  require('../assets/videos/d.mp4'),
  require('../assets/videos/e.mp4'),
  require('../assets/videos/f.mp4'),
  require('../assets/videos/g.mp4'),
  require('../assets/videos/h.mp4'),
  require('../assets/videos/i.mp4'),
  require('../assets/videos/j.mp4'),
  require('../assets/videos/k.mp4'),
  require('../assets/videos/l.mp4'),
  require('../assets/videos/m.mp4'),
  require('../assets/videos/n.mp4'),
];

export default function IntroScreen() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFirst, setShowFirst] = useState(true);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const currentVideo = videos[currentIndex];
  const nextIndex = (currentIndex + 1) % videos.length;
  const nextVideo = videos[nextIndex];

  const handleVideoEnd = () => {
    // Switch to next video immediately
    setCurrentIndex(nextIndex);
    setShowFirst(!showFirst);
  };

  const handleNavigateToLogin = async () => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    await AsyncStorage.setItem(INTRO_SHOWN_KEY, 'true');
    navigation.navigate('Login' as never);
  };

  return (
    <View style={styles.container}>
      {/* Dual Video Players - One plays while other preloads */}
      <Video
        key={`video-first-${currentIndex}`}
        source={currentVideo}
        style={[styles.backgroundMedia, { zIndex: showFirst ? 2 : 1 }]}
        resizeMode="cover"
        muted
        playInBackground={false}
        playWhenInactive={false}
        onEnd={handleVideoEnd}
        paused={!showFirst}
        repeat={false}
      />
      
      <Video
        key={`video-second-${nextIndex}`}
        source={nextVideo}
        style={[styles.backgroundMedia, { zIndex: showFirst ? 1 : 2 }]}
        resizeMode="cover"
        muted
        playInBackground={false}
        playWhenInactive={false}
        onEnd={handleVideoEnd}
        paused={showFirst}
        repeat={false}
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
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    zIndex: 100,
  },
  signInButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
