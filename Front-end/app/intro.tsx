import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import {
  Heart,
  Activity,
  BookOpen,
  Lightbulb,
  Users,
  Dumbbell,
  Smile,
  Headphones,
  Wind,
  HandHeart,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const INTRO_SHOWN_KEY = '@intro_shown';

interface Challenge {
  id: number;
  name: string;
  xp: number;
  icon: any;
  category: string;
  colors: [string, string];
  mediaType: 'video' | 'gif' | 'gradient';
  mediaSource?: any; // Video/GIF source
}

const challenges: Challenge[] = [
  { 
    id: 1, 
    name: 'Morning Meditation', 
    xp: 15, 
    icon: Heart, 
    category: 'Wellness', 
    colors: ['#4ECDC4', '#44A08D'],
    mediaType: 'gradient', // Change to 'video' or 'gif' when you add media files
    // mediaSource: require('../assets/videos/meditation.mp4'), // Uncomment when you add video
  },
  { 
    id: 2, 
    name: 'Healthy Meal', 
    xp: 10, 
    icon: Activity, 
    category: 'Health', 
    colors: ['#F39C12', '#E67E22'],
    mediaType: 'gradient',
    // mediaSource: require('../assets/videos/healthy-meal.mp4'),
  },
  { 
    id: 3, 
    name: 'Journal Entry', 
    xp: 10, 
    icon: BookOpen, 
    category: 'Reflection', 
    colors: ['#9B59B6', '#8E44AD'],
    mediaType: 'gradient',
    // mediaSource: require('../assets/videos/journal.mp4'),
  },
  { 
    id: 4, 
    name: 'Learn Something New', 
    xp: 10, 
    icon: Lightbulb, 
    category: 'Education', 
    colors: ['#3498DB', '#2980B9'],
    mediaType: 'gradient',
    // mediaSource: require('../assets/videos/learning.mp4'),
  },
  { 
    id: 5, 
    name: 'Social Connection', 
    xp: 20, 
    icon: Users, 
    category: 'Social', 
    colors: ['#F39C12', '#E67E22'],
    mediaType: 'gradient',
    // mediaSource: require('../assets/videos/social.mp4'),
  },
  { 
    id: 6, 
    name: 'Exercise', 
    xp: 20, 
    icon: Dumbbell, 
    category: 'Health', 
    colors: ['#3498DB', '#2980B9'],
    mediaType: 'gradient',
    // mediaSource: require('../assets/videos/exercise.mp4'),
  },
  { 
    id: 7, 
    name: 'Gratitude List', 
    xp: 10, 
    icon: Smile, 
    category: 'Reflection', 
    colors: ['#9B59B6', '#8E44AD'],
    mediaType: 'gradient',
    // mediaSource: require('../assets/videos/gratitude.mp4'),
  },
  { 
    id: 8, 
    name: 'Listen to Podcast', 
    xp: 15, 
    icon: Headphones, 
    category: 'Education', 
    colors: ['#3498DB', '#2980B9'],
    mediaType: 'gradient',
    // mediaSource: require('../assets/videos/podcast.mp4'),
  },
  { 
    id: 9, 
    name: 'Deep Breathing', 
    xp: 10, 
    icon: Wind, 
    category: 'Wellness', 
    colors: ['#4ECDC4', '#44A08D'],
    mediaType: 'gradient',
    // mediaSource: require('../assets/videos/breathing.mp4'),
  },
  { 
    id: 10, 
    name: 'Help Someone', 
    xp: 20, 
    icon: HandHeart, 
    category: 'Social', 
    colors: ['#F39C12', '#E67E22'],
    mediaType: 'gradient',
    // mediaSource: require('../assets/videos/help.mp4'),
  },
];

export default function IntroScreen() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const xpFloat = useRef(new Animated.Value(0)).current;

  const currentChallenge = challenges[currentIndex];
  const Icon = currentChallenge.icon;

  // Render background based on media type
  const renderBackground = () => {
    if (currentChallenge.mediaType === 'video' && currentChallenge.mediaSource) {
      return (
        <Video
          source={currentChallenge.mediaSource}
          style={styles.backgroundMedia}
          resizeMode="cover"
          repeat
          muted
          playInBackground={false}
          playWhenInactive={false}
        />
      );
    } else if (currentChallenge.mediaType === 'gif' && currentChallenge.mediaSource) {
      return (
        <ImageBackground
          source={currentChallenge.mediaSource}
          style={styles.backgroundMedia}
          resizeMode="cover"
        />
      );
    } else {
      // Fallback to gradient
      return (
        <View style={[styles.backgroundMedia, { 
          backgroundColor: currentChallenge.colors[0] 
        }]} />
      );
    }
  };

  useEffect(() => {
    // Icon entrance animation
    Animated.spring(iconScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Breathing animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating XP animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(xpFloat, {
          toValue: -30,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(xpFloat, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-transition to next challenge
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => (prev + 1) % challenges.length);
        iconScale.setValue(0);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(iconScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIndex]);

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

    // Mark intro as shown
    await AsyncStorage.setItem(INTRO_SHOWN_KEY, 'true');

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        navigation.navigate('Login' as never);
      });
    }, 200);
  };

  return (
    <View style={styles.container}>
      {/* Background Video/GIF/Gradient */}
      {renderBackground()}
      
      {/* Overlay for better text visibility */}
      <View style={styles.overlay} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>MindFusion</Text>
          <Text style={styles.tagline}>Small Steps. Big Wins.</Text>
        </View>

        {/* Challenge Display */}
        <View style={styles.challengeDisplay}>
          <Text style={styles.challengeName}>{currentChallenge.name}</Text>
          <Text style={styles.categoryText}>{currentChallenge.category}</Text>

          <Animated.View
            style={[
              styles.xpBadge,
              {
                transform: [{ translateY: xpFloat }],
              },
            ]}
          >
            <Text style={styles.xpText}>+{currentChallenge.xp} XP</Text>
          </Animated.View>
        </View>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {challenges.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Sign In Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleNavigateToLogin}
            activeOpacity={0.9}
          >
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Sign In / Sign Up</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Dark overlay for text visibility
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.95,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  challengeDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  categoryText: {
    fontSize: 20,
    color: '#FFFFFF',
    opacity: 0.95,
    marginBottom: 40,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  xpBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  signInButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonContainer: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    paddingVertical: 18,
    paddingHorizontal: 60,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
