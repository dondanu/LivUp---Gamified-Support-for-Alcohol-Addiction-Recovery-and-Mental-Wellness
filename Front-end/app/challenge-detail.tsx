import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ArrowLeft, Target, Star, Zap, Award, Play, Clock, CheckCircle } from 'lucide-react-native';
import { Challenge } from '@/types/database.types';
import { getChallengeByTitle, getChallengeById, getChallengeIdFromTitle, ChallengeConfig } from '@/config/challenges';

export default function ChallengeDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  // Get challenge from route params
  const challenge = route.params?.challenge as Challenge;
  
  // Get challenge-specific config by matching title to ID
  const challengeTitle = challenge?.title || challenge?.task_name || '';
  const challengeId = challengeTitle ? getChallengeIdFromTitle(challengeTitle) : undefined;
  const challengeConfig: ChallengeConfig | undefined = challengeId 
    ? getChallengeById(challengeId)
    : challengeTitle
      ? getChallengeByTitle(challengeTitle)
      : undefined;

  // Check if challenge is already completed today
  useEffect(() => {
    const checkCompletionStatus = async () => {
      if (!profile?.id || !challenge?.id) {
        setCheckingStatus(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const completedResponse = await api.getCompletedTasks();
        const completedToday = completedResponse.tasks?.some((task: any) => {
          if (!task.completion_date) return false;
          const completionDate = task.completion_date.split('T')[0];
          return task.task_id === parseInt(challenge.id) && completionDate === today;
        });
        setIsCompleted(completedToday || false);
      } catch (error) {
        console.error('Error checking completion status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkCompletionStatus();
  }, [profile, challenge]);

  if (!challenge && !challengeConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Challenge not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Use config data if available, otherwise fall back to API challenge data
  const displayChallenge = challengeConfig || challenge;
  const title = challengeConfig?.title || challenge?.title || challenge?.task_name || 'Challenge';
  const description = challengeConfig?.description || challenge?.description || '';
  const difficulty = challengeConfig?.difficulty || challenge?.difficulty || 'Easy';
  const points = challengeConfig?.points || challenge?.points_reward || 0;
  const challengeApiId = challenge?.id || challengeId;

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return ['#4ECDC4', '#44A08D'];
      case 'medium':
        return ['#F39C12', '#E67E22'];
      case 'hard':
        return ['#E74C3C', '#C0392B'];
      default:
        return ['#95A5A6', '#7F8C8D'];
    }
  };

  const handleStartChallenge = () => {
    // Normalize challenge id from title
    const challengeIdNormalized = challengeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    if (challengeIdNormalized === 'music-therapy' || challengeIdNormalized === 'music therapy') {
      // Navigate to Music Therapy activity page
      navigation.navigate('MusicTherapyChallenge' as never, { challenge } as never);
    } else if (challengeIdNormalized === 'deep-breathing' || challengeIdNormalized === 'deep breathing') {
      // Navigate to Deep Breathing timed challenge
      navigation.navigate('DeepBreathingChallenge' as never, { challenge } as never);
    } else {
      // For other challenges, show instructions and allow completion
      Alert.alert(
        'Start Challenge',
        `Ready to start "${title}"? Follow the instructions and complete the challenge to earn ${points} points!`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start',
            onPress: () => {
              // For now, navigate to a generic activity page or show completion button
              // We'll implement specific pages for other challenges later
              Alert.alert(
                'Challenge Started',
                'Follow the instructions above to complete this challenge. When finished, you can mark it as complete.',
                [{ text: 'OK' }]
              );
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getDifficultyColor(difficulty) as [string, string]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Target size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.pointsCard}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.pointsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Star size={32} color="#FFFFFF" />
            <Text style={styles.pointsValue}>{points}</Text>
            <Text style={styles.pointsLabel}>Points Reward</Text>
          </LinearGradient>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>About This Challenge</Text>
          <Text style={styles.descriptionText}>{description || 'No description available'}</Text>
          
          {challengeConfig?.duration && (
            <View style={styles.durationBadge}>
              <Clock size={16} color="#4ECDC4" />
              <Text style={styles.durationText}>{challengeConfig.duration}</Text>
            </View>
          )}
        </View>

        {challengeConfig?.instructions && challengeConfig.instructions.length > 0 && (
          <View style={styles.instructionsCard}>
            <Text style={styles.sectionTitle}>📋 How to Complete</Text>
            {challengeConfig.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Award size={24} color="#4ECDC4" />
              <Text style={styles.infoLabel}>Difficulty</Text>
              <Text style={styles.infoValue}>{difficulty}</Text>
            </View>
            <View style={styles.infoItem}>
              <Zap size={24} color="#F39C12" />
              <Text style={styles.infoLabel}>Points</Text>
              <Text style={styles.infoValue}>{points}</Text>
            </View>
          </View>
        </View>

        {challengeConfig?.tips && challengeConfig.tips.length > 0 && (
          <View style={styles.tipsCard}>
            <Text style={styles.sectionTitle}>💡 Tips for Success</Text>
            {challengeConfig.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <CheckCircle size={16} color="#4ECDC4" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {challengeConfig?.motivation && (
          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>"{challengeConfig.motivation}"</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {checkingStatus ? (
          <View style={styles.startButton}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.startButtonText}>Checking status...</Text>
          </View>
        ) : isCompleted ? (
          <View style={[styles.startButton, styles.completedButton]}>
            <CheckCircle size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Completed Today ✅</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, loading && styles.startButtonDisabled]}
            onPress={handleStartChallenge}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Play size={24} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start Challenge</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    textAlign: 'center',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  pointsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  pointsGradient: {
    padding: 24,
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  pointsLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  descriptionCard: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
    marginBottom: 12,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
    marginLeft: 6,
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
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 4,
  },
  tipsCard: {
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 22,
    marginLeft: 8,
  },
  motivationCard: {
    backgroundColor: '#F5F7FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 100,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  motivationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2C3E50',
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  completedButton: {
    backgroundColor: '#27AE60',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    backgroundColor: '#4ECDC4',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

