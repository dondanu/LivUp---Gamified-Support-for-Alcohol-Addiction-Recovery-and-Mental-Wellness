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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Challenge, UserChallenge } from '@/types/database.types';
import { Target, CheckCircle, Circle, Trophy, Star, Zap } from 'lucide-react-native';

export default function ChallengesScreen() {
  const { profile, refreshProfile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, [profile]);

  const loadChallenges = async () => {
    if (!profile?.id) return;

    try {
      const { data: allChallenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true });

      const { data: myUserChallenges } = await supabase
        .from('user_challenges')
        .select('*, challenges(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (allChallenges) setChallenges(allChallenges);
      if (myUserChallenges) setUserChallenges(myUserChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
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
      const { error } = await supabase.from('user_challenges').insert({
        user_id: profile.id,
        challenge_id: challengeId,
        status: 'in_progress',
      });

      if (error) throw error;
      Alert.alert('Success', 'Challenge accepted! Good luck!');
      loadChallenges();
    } catch (error) {
      console.error('Error accepting challenge:', error);
      Alert.alert('Error', 'Failed to accept challenge');
    }
  };

  const completeChallenge = async (userChallengeId: string, pointsReward: number) => {
    if (!profile?.id) return;

    try {
      const { error: updateError } = await supabase
        .from('user_challenges')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', userChallengeId);

      if (updateError) throw updateError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_points: (profile.total_points || 0) + pointsReward,
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      Alert.alert('Congratulations!', `You earned ${pointsReward} points!`);
      await refreshProfile();
      loadChallenges();
    } catch (error) {
      console.error('Error completing challenge:', error);
      Alert.alert('Error', 'Failed to complete challenge');
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
              <Text style={styles.statValue}>{profile?.total_points || 0}</Text>
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
          {challenges
            .filter((challenge) => !isChallengeAccepted(challenge.id))
            .map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeContent}>
                  <View style={styles.challengeHeader}>
                    <Text style={styles.challengeTitleDark}>{challenge.title}</Text>
                    <View style={styles.pointsBadgeDark}>
                      <Star size={16} color="#FFD700" />
                      <Text style={styles.pointsTextDark}>{challenge.points_reward}</Text>
                    </View>
                  </View>

                  <Text style={styles.challengeDescriptionDark}>{challenge.description}</Text>

                  <View style={styles.challengeFooter}>
                    <View
                      style={[
                        styles.difficultyBadgeDark,
                        {
                          backgroundColor:
                            challenge.difficulty === 'Easy'
                              ? '#4ECDC4'
                              : challenge.difficulty === 'Medium'
                                ? '#F39C12'
                                : '#E74C3C',
                        },
                      ]}>
                      <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => acceptChallenge(challenge.id)}>
                      <Target size={20} color="#FFFFFF" />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
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
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
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
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeGradient: {
    padding: 20,
  },
  challengeContent: {
    width: '100%',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    marginBottom: 16,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
