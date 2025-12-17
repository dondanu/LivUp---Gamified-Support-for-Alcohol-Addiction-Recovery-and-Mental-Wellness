import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Challenge, UserChallenge } from '@/types/database.types';
import { Target, CheckCircle, Circle, Trophy, Star, Zap } from 'lucide-react-native';

export default function ChallengesScreen() {
  const navigation = useNavigation<any>();
  const { profile, refreshProfile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayPoints, setTodayPoints] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, [profile]);

  useFocusEffect(
    React.useCallback(() => {
      loadChallenges();
    }, [profile])
  );

  const loadChallenges = async () => {
    if (!profile?.id) return;

    try {
      console.log('[Challenges] Loading challenges...');
      const challengesResponse = await api.getChallenges();
      console.log('[Challenges] API Response:', challengesResponse);
      
      if (challengesResponse.challenges) {
        const activeChallenges = challengesResponse.challenges.filter((c: any) => {
          // Filter out challenges that are explicitly inactive, but include all others
          return c.is_active !== false;
        });
        
        // Remove duplicates by title (keep first occurrence)
        const uniqueChallenges = activeChallenges.reduce((acc: any[], challenge: any) => {
          const title = challenge.title || challenge.task_name || '';
          const exists = acc.find(c => (c.title || c.task_name || '') === title);
          if (!exists) {
            acc.push(challenge);
          }
          return acc;
        }, []);
        
        console.log('[Challenges] Active challenges:', activeChallenges.length);
        console.log('[Challenges] Unique challenges:', uniqueChallenges.length);
        setChallenges(uniqueChallenges);
        
        // Get today's progress to determine completed/in-progress challenges
        try {
          const todayResponse = await api.getTodayTasks();
          const completedToday = todayResponse.completedTasks || [];

          const userChallengesList = completedToday.map((task: any) => ({
            id: task.id?.toString() || '',
            user_id: profile?.id || '',
            challenge_id: task.task_id?.toString() || '',
            status: 'completed',
            completed_at: task.completion_date || new Date().toISOString(),
            created_at: task.created_at || new Date().toISOString(),
            challenges: {
              id: task.task_id?.toString() || '',
              title: task.task_name || task.title,
              description: task.description,
              difficulty: task.difficulty || 'Easy',
              points_reward: task.points_reward || task.points || 0,
            },
          }));
          
          setUserChallenges(userChallengesList);
          setTodayPoints(todayResponse.totalPointsEarnedToday || 0);
          console.log('[Challenges] Today completed:', completedToday.length);
        } catch (error) {
          console.error('[Challenges] Error loading today\'s tasks:', error);
          setUserChallenges([]);
          setTodayPoints(0);
        }
      } else {
        console.warn('[Challenges] No challenges in response:', challengesResponse);
        setChallenges([]);
      }
    } catch (error) {
      console.error('[Challenges] Error loading challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
  };

  const acceptChallenge = async (challengeId: string) => {
    if (!profile?.id) return;

    try {
      await api.acceptChallenge(challengeId);
      Alert.alert('Success', 'Challenge accepted! Good luck!');
      loadChallenges();
    } catch (error: any) {
      console.error('Error accepting challenge:', error);
      Alert.alert('Error', error.message || 'Failed to accept challenge');
    }
  };

  const completeChallenge = async (userChallengeId: string, pointsReward: number) => {
    if (!profile?.id) return;

    try {
      await api.completeChallenge(userChallengeId);
      Alert.alert('Congratulations!', `You earned ${pointsReward} points!`);
      await refreshProfile();
      loadChallenges();
    } catch (error: any) {
      console.error('Error completing challenge:', error);
      Alert.alert('Error', error.message || 'Failed to complete challenge');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  const isChallengeAccepted = (challengeId: string) => {
    return userChallenges.some(
      (uc) => uc.challenge_id === challengeId && uc.status !== 'completed'
    );
  };

  const completedCount = userChallenges.filter((uc) => uc.status === 'completed').length;
  const inProgressCount = userChallenges.filter((uc) => uc.status === 'in_progress').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F093FB', '#F5576C']} style={styles.header} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <Text style={styles.headerTitle}>Daily Challenges</Text>
        <Text style={styles.headerSubtitle}>Complete tasks to earn points and level up</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <CheckCircle size={28} color="#FFFFFF" />
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#F39C12', '#E67E22']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Zap size={28} color="#FFFFFF" />
              <Text style={styles.statValue}>{inProgressCount}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Trophy size={28} color="#FFFFFF" />
              <Text style={styles.statValue}>
                {profile?.total_points && profile.total_points > 0
                  ? profile.total_points
                  : todayPoints || 0}
              </Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </LinearGradient>
          </View>
        </View>

        {userChallenges.filter((uc) => uc.status === 'in_progress').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            {userChallenges
              .filter((uc) => uc.status === 'in_progress')
              .map((userChallenge) => (
                <View key={userChallenge.id} style={styles.challengeCard}>
                  <LinearGradient
                    colors={getDifficultyColor(userChallenge.challenges?.difficulty || 'Easy') as [string, string]}
                    style={styles.challengeGradient}
                    start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                    <View style={styles.challengeContent}>
                      <View style={styles.challengeHeader}>
                        <Text style={styles.challengeTitle}>
                          {userChallenge.challenges?.title}
                        </Text>
                        <View style={styles.pointsBadge}>
                          <Star size={16} color="#FFD700" />
                          <Text style={styles.pointsText}>
                            {userChallenge.challenges?.points_reward}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.challengeDescription}>
                        {userChallenge.challenges?.description}
                      </Text>

                      <View style={styles.challengeFooter}>
                        <View style={styles.difficultyBadge}>
                          <Text style={styles.difficultyText}>
                            {userChallenge.challenges?.difficulty}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.completeButton}
                          onPress={() =>
                            completeChallenge(
                              userChallenge.id,
                              userChallenge.challenges?.points_reward || 0
                            )
                          }>
                          <CheckCircle size={20} color="#FFFFFF" />
                          <Text style={styles.completeButtonText}>Complete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Challenges</Text>
          {challenges.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No challenges available at the moment.</Text>
              <Text style={styles.emptySubtext}>Check back later for new challenges!</Text>
            </View>
          ) : (
            challenges
              .filter((challenge) => {
                // Show all active challenges, even if completed
                // We'll mark them as completed in the UI instead of hiding them
                return challenge.is_active !== false;
              })
              .map((challenge) => {
                const isCompleted = userChallenges.some(
                  (uc) => uc.challenge_id === challenge.id && uc.status === 'completed'
                );
                return { challenge, isCompleted };
              })
              .map(({ challenge, isCompleted }) => (
                <TouchableOpacity
                  key={challenge.id}
                  style={[styles.challengeCard, isCompleted && styles.challengeCardCompleted]}
                  activeOpacity={isCompleted ? 1 : 0.7}
                  onPress={() => {
                    if (isCompleted) {
                      Alert.alert(
                        'Come Back Tomorrow',
                        'You have already completed this challenge today. New challenges unlock every day!'
                      );
                      return;
                    }
                    navigation.navigate('ChallengeDetail' as never, { 
                      challenge
                    } as never);
                  }}>
                  <View style={styles.challengeContent}>
                    {isCompleted && (
                      <View style={styles.completedBadge}>
                        <CheckCircle size={16} color="#27AE60" />
                        <Text style={styles.completedText}>Completed Today</Text>
                      </View>
                    )}
                    <View style={styles.challengeHeader}>
                      <Text style={[styles.challengeTitleDark, isCompleted && styles.challengeTitleCompleted]}>
                        {challenge.title || challenge.task_name}
                      </Text>
                      <View style={styles.pointsBadgeDark}>
                        <Star size={16} color="#FFD700" />
                        <Text style={styles.pointsTextDark}>{challenge.points_reward}</Text>
                      </View>
                    </View>

                    <Text style={[styles.challengeDescriptionDark, isCompleted && styles.challengeDescriptionDisabled]}>
                      {challenge.description}
                    </Text>

                    <View style={styles.challengeFooter}>
                      <View
                        style={[
                          styles.difficultyBadgeDark,
                          {
                            backgroundColor:
                              (challenge.difficulty || 'Easy') === 'Easy'
                                ? '#4ECDC4'
                                : (challenge.difficulty || 'Easy') === 'Medium'
                                  ? '#F39C12'
                                  : '#E74C3C',
                          },
                        ]}>
                        <Text style={styles.difficultyText}>{challenge.difficulty || 'Easy'}</Text>
                      </View>

                      <View style={[styles.acceptButton, isCompleted && styles.acceptButtonCompleted]}>
                        <Target size={20} color="#FFFFFF" />
                        <Text style={styles.acceptButtonText}>
                          {isCompleted ? 'Completed' : 'View Details'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    marginTop: 8,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // Make it clear it's tappable
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  challengeCardCompleted: {
    backgroundColor: '#F0F9F4',
    borderColor: '#27AE60',
    borderWidth: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
    marginLeft: 6,
  },
  challengeTitleCompleted: {
    opacity: 0.7,
    textDecorationLine: 'line-through',
  },
  acceptButtonCompleted: {
    backgroundColor: '#27AE60',
  },
  challengeGradient: {
    padding: 20,
  },
  challengeContent: {
    width: '100%',
    padding: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  challengeTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 12,
  },
  challengeTitleDark: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsBadgeDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  pointsTextDark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeDescriptionDark: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 14,
    marginTop: 4,
  },
  challengeDescriptionDisabled: {
    color: '#9EA7AC',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  difficultyBadgeDark: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});
