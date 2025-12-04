import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ArrowLeft, Wind, Play, Pause, CheckCircle, Clock } from 'lucide-react-native';

export default function DeepBreathingChallenge() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { profile, refreshProfile } = useAuth();
  const challenge = route.params?.challenge;

  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const targetDuration = 1 * 60; // 1 minute in seconds
  const MIN_COMPLETION_SECONDS = 1 * 60;
  const autoCompletionRef = useRef(false);

  const progress = Math.min((timeElapsed / targetDuration) * 100, 100);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (newTime >= targetDuration) {
            setIsPlaying(false);
            setIsCompleted(true);
            if (!autoCompletionRef.current) {
              autoCompletionRef.current = true;
              handleCompleteChallenge(true);
            }
            return targetDuration;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    if (isCompleted) return;
    setIsPlaying(prev => !prev);
  };

  const handleCompleteChallenge = async (isAutoComplete = false) => {
    if (!profile?.id || !challenge?.id) {
      Alert.alert('Error', 'Unable to complete challenge. Please try again.');
      return;
    }

    if (!isAutoComplete && timeElapsed < MIN_COMPLETION_SECONDS) {
      Alert.alert(
        'Not Enough Time',
        'Please practice deep breathing for at least 1 minute before completing this challenge.',
        [{ text: 'OK' }],
      );
      return;
    }

    setLoading(true);
    try {
      await api.acceptChallenge(challenge.id.toString());
      setIsCompleted(true);
      setIsPlaying(false);

      Alert.alert(
        'Challenge Completed! 🎉',
        `Great job focusing on your breath. You've earned ${challenge.points_reward || 10} points!`,
        [
          {
            text: 'OK',
            onPress: async () => {
              await refreshProfile();
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Error completing deep breathing challenge:', error);
      Alert.alert('Error', error.message || 'Failed to complete challenge');
    } finally {
      setLoading(false);
    }
  };

  const title = challenge?.title || 'Deep Breathing';
  const points = challenge?.points_reward || 10;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4ECDC4', '#44A08D']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Wind size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>Practice deep breathing for 1 minute</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.pointsRow}>
            <Text style={styles.infoLabel}>Points Reward:</Text>
            <Text style={styles.pointsValue}>{points} points</Text>
          </View>
          <View style={styles.pointsRow}>
            <Text style={styles.infoLabel}>Target Duration:</Text>
            <Text style={styles.infoValue}>1 minute</Text>
          </View>
        </View>

        <View style={styles.playerCard}>
          <View style={styles.timerContainer}>
            <Clock size={32} color="#4ECDC4" />
            <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
            <Text style={styles.timerLabel}>/ {formatTime(targetDuration)}</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
          </View>

          <TouchableOpacity
            style={[styles.playButton, isCompleted && styles.playButtonDisabled]}
            onPress={handleTogglePlay}
            disabled={isCompleted}>
            {isPlaying ? (
              <>
                <Pause size={32} color="#FFFFFF" />
                <Text style={styles.playButtonText}>Pause Timer</Text>
              </>
            ) : (
              <>
                <Play size={32} color="#FFFFFF" />
                <Text style={styles.playButtonText}>
                  {timeElapsed === 0 ? 'Start Breathing' : 'Resume Timer'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.breathingGuide}>
            Inhale slowly for 4 seconds, hold for 4 seconds, then exhale gently for 4 seconds.
            Repeat this pattern until the timer completes.
          </Text>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>How to Complete</Text>
          <Text style={styles.instructionText}>
            1. Sit or stand comfortably with your back straight{'\n'}
            2. Press "Start Breathing" to begin the timer{'\n'}
            3. Follow the 4-4-4 breathing rhythm (inhale, hold, exhale){'\n'}
            4. Stay focused on your breath for the full minute{'\n'}
            5. The challenge completes automatically and awards your points once time is reached
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            (loading || isCompleted || timeElapsed < MIN_COMPLETION_SECONDS) &&
              styles.completeButtonDisabled,
          ]}
          onPress={() => handleCompleteChallenge()}
          disabled={loading || isCompleted || timeElapsed < MIN_COMPLETION_SECONDS}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : isCompleted ? (
            <>
              <CheckCircle size={24} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Completed!</Text>
            </>
          ) : (
            <>
              <CheckCircle size={24} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>
                {timeElapsed < MIN_COMPLETION_SECONDS
                  ? 'Wait for timer to finish'
                  : 'Complete Challenge'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 12,
  },
  timerLabel: {
    fontSize: 18,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  breathingGuide: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 22,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 8,
  },
  completeButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});


