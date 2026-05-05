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
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Challenge, UserChallenge } from '@/types/database.types';
import { Target, CheckCircle, Circle, Trophy, Star, Zap, Users } from 'lucide-react-native';
import MilestonePrompt from '@/components/MilestonePrompt';
import { anonymousStorage } from '@/lib/anonymousStorage';

export default function ChallengesScreen() {
  const navigation = useNavigation<any>();
  const { profile, refreshProfile, isAnonymous, anonymousData, refreshAnonymousData } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayPoints, setTodayPoints] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Milestone prompt state
  const [showMilestonePrompt, setShowMilestonePrompt] = useState(false);
  const [milestoneType, setMilestoneType] = useState('');
  const [milestoneData, setMilestoneData] = useState<any>(null);

  // Stats modal states
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showInProgressModal, setShowInProgressModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);

  // Community data state (dynamic)
  const [communityData, setCommunityData] = useState({
    totalChallenges: 1234,
    totalPoints: 15678,
    recentActivity: [] as any[],
  });

  useEffect(() => {
    loadChallenges();
  }, [profile]);

  useFocusEffect(
    React.useCallback(() => {
      loadChallenges();
    }, [profile])
  );

  const loadChallenges = async () => {
    try {
      console.log('[Challenges] Loading challenges...');
      const challengesResponse = await api.getChallenges();
      console.log('[Challenges] API Response:', challengesResponse);
      
      if (challengesResponse.challenges) {
        const activeChallenges = challengesResponse.challenges.filter((c: any) => {
          return c.is_active !== false;
        });
        
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
        
        // Load completed challenges based on mode
        if (isAnonymous) {
          // Anonymous mode - load from local storage
          const anonData = await anonymousStorage.getData();
          if (anonData) {
            const completedTasks = anonData.completedTasks || [];
            const userChallengesList = completedTasks.map((task: any) => ({
              id: task.taskId?.toString() || '',
              user_id: 'anonymous',
              challenge_id: task.taskId?.toString() || '',
              status: 'completed',
              completed_at: task.completionDate || new Date().toISOString(),
              created_at: task.completionDate || new Date().toISOString(),
              challenges: {
                id: task.taskId?.toString() || '',
                title: task.taskName,
                description: '',
                difficulty: 'Easy',
                points_reward: task.pointsEarned || 0,
              },
            }));
            
            setUserChallenges(userChallengesList);
            setTodayPoints(anonData.totalPoints || 0);
            console.log('[Challenges] Anonymous completed:', completedTasks.length);
          }
        } else if (profile?.id) {
          // Registered user - load from API
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
            setUserChallenges([]);
            setTodayPoints(0);
          }
        }
      } else {
        console.warn('[Challenges] No challenges in response:', challengesResponse);
        setChallenges([]);
      }
    } catch (error: any) {
      if (error.response?.status === 503) {
        Alert.alert(
          'System Starting Up',
          'The challenges system is initializing. Please try again in a moment.',
          [{ text: 'Retry', onPress: () => loadChallenges() }]
        );
      } else if (error.response?.status === 500) {
        Alert.alert(
          'Unable to Load Challenges',
          'We\'re experiencing technical difficulties. Please try again later.',
          [{ text: 'Retry', onPress: () => loadChallenges() }]
        );
      } else {
        Alert.alert(
          'Connection Error',
          'Please check your internet connection and try again.',
          [{ text: 'Retry', onPress: () => loadChallenges() }]
        );
      }
      
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

  const completeChallenge = async (challengeId: string, challengeName: string, pointsReward: number) => {
    try {
      if (isAnonymous) {
        // Anonymous mode - save to local storage
        await anonymousStorage.addCompletedTask(
          parseInt(challengeId),
          challengeName,
          pointsReward
        );
        
        // Check for milestones
        const milestoneCheck = await anonymousStorage.checkMilestones();
        
        // Show success alert FIRST
        Alert.alert('Congratulations!', `You earned ${pointsReward} points!`, [
          {
            text: 'Awesome!',
            onPress: async () => {
              await refreshAnonymousData();
              loadChallenges();
              
              // After user clicks "Awesome!", show milestone prompt if needed
              if (milestoneCheck.shouldPrompt) {
                setMilestoneType(milestoneCheck.milestoneType || '');
                setMilestoneData(milestoneCheck.milestoneData);
                setShowMilestonePrompt(true);
              }
            },
          },
        ]);
      } else if (profile?.id) {
        // Registered user - use API
        const response = await api.completeChallenge(challengeId);
        Alert.alert('Congratulations!', `You earned ${pointsReward} points!`);
        
        // Force refresh profile AND reload challenges to get updated points
        await refreshProfile();
        await loadChallenges();
      }
    } catch (error: any) {
      console.error('Error completing challenge:', error);
      Alert.alert('Error', error.message || 'Failed to complete challenge');
    }
  };

  const handleDismissMilestone = () => {
    setShowMilestonePrompt(false);
  };

  // Generate dynamic community data
  const generateCommunityData = () => {
    const names = ['Kamal', 'Priya', 'Raj', 'Sara', 'Arun', 'Devi', 'Kumar', 'Lakshmi', 'Vijay', 'Meera'];
    const challengesList = [
      { name: 'Morning Meditation', points: 15 },
      { name: 'Exercise', points: 20 },
      { name: 'Journal Entry', points: 10 },
      { name: 'Gratitude List', points: 10 },
      { name: 'Complete a 5K Run', points: 50 },
      { name: 'Healthy Meal', points: 10 },
      { name: 'Deep Breathing', points: 10 },
      { name: 'Nature Walk', points: 15 },
    ];
    const colors = ['#667EEA', '#F093FB', '#4ECDC4', '#F39C12', '#E74C3C', '#27AE60'];

    // Generate 5 random activities
    const activities = [];
    for (let i = 0; i < 5; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomChallenge = challengesList[Math.floor(Math.random() * challengesList.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomMinutes = Math.floor(Math.random() * 20) + 1;

      activities.push({
        id: Date.now() + i,
        name: randomName,
        initial: randomName[0],
        challenge: randomChallenge.name,
        points: randomChallenge.points,
        time: `${randomMinutes} min ago`,
        color: randomColor,
      });
    }

    return activities;
  };

  // Generate 1-2 new activities (for subtle updates)
  const generateNewActivities = (count: number) => {
    const names = ['Kamal', 'Priya', 'Raj', 'Sara', 'Arun', 'Devi', 'Kumar', 'Lakshmi', 'Vijay', 'Meera'];
    const challengesList = [
      { name: 'Morning Meditation', points: 15 },
      { name: 'Exercise', points: 20 },
      { name: 'Journal Entry', points: 10 },
      { name: 'Gratitude List', points: 10 },
      { name: 'Complete a 5K Run', points: 50 },
      { name: 'Healthy Meal', points: 10 },
      { name: 'Deep Breathing', points: 10 },
      { name: 'Nature Walk', points: 15 },
    ];
    const colors = ['#667EEA', '#F093FB', '#4ECDC4', '#F39C12', '#E74C3C', '#27AE60'];

    const activities = [];
    for (let i = 0; i < count; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomChallenge = challengesList[Math.floor(Math.random() * challengesList.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      activities.push({
        id: Date.now() + Math.random(), // Unique ID
        name: randomName,
        initial: randomName[0],
        challenge: randomChallenge.name,
        points: randomChallenge.points,
        time: 'Just now',
        color: randomColor,
      });
    }

    return activities;
  };

  // Update community data periodically
  useEffect(() => {
    // Initial data
    setCommunityData({
      totalChallenges: 1234 + Math.floor(Math.random() * 50),
      totalPoints: 15678 + Math.floor(Math.random() * 500),
      recentActivity: generateCommunityData(),
    });

    // Update every 30-40 seconds when modal is open (more realistic)
    const interval = setInterval(() => {
      if (showCommunityModal) {
        // Small, realistic increments
        const challengeIncrement = Math.floor(Math.random() * 3) + 1; // 1-3 challenges
        const pointsIncrement = Math.floor(Math.random() * 20) + 10; // 10-30 points
        
        // Generate 1-2 new activities
        const newActivityCount = Math.random() > 0.5 ? 1 : 2;
        const newActivities = generateNewActivities(newActivityCount);

        setCommunityData(prev => {
          // Keep existing activities and add new ones at the top
          const updatedActivities = [...newActivities, ...prev.recentActivity];
          
          // Update timestamps for existing activities
          const activitiesWithUpdatedTime = updatedActivities.slice(0, 5).map((activity, index) => {
            if (index >= newActivityCount) {
              // Update time for older activities
              const currentTime = activity.time;
              if (currentTime === 'Just now') {
                return { ...activity, time: '1 min ago' };
              } else if (currentTime.includes('min ago')) {
                const mins = parseInt(currentTime);
                return { ...activity, time: `${mins + 1} min ago` };
              }
            }
            return activity;
          });

          return {
            totalChallenges: prev.totalChallenges + challengeIncrement,
            totalPoints: prev.totalPoints + pointsIncrement,
            recentActivity: activitiesWithUpdatedTime,
          };
        });
      }
    }, 35000); // 35 seconds (more realistic interval)

    return () => clearInterval(interval);
  }, [showCommunityModal]);

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

  const completedChallenges = userChallenges.filter((uc) => uc.status === 'completed');
  const inProgressChallenges = userChallenges.filter((uc) => uc.status === 'in_progress');
  const completedCount = completedChallenges.length;
  const inProgressCount = inProgressChallenges.length;

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
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Daily Challenges</Text>
            <Text style={styles.headerSubtitle}>Complete tasks to earn points and level up</Text>
          </View>
          <TouchableOpacity 
            style={styles.guideButton}
            onPress={() => setShowGuideModal(true)}
            activeOpacity={0.8}>
            <Text style={styles.guideButtonText}>?</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => setShowCompletedModal(true)}
            activeOpacity={0.7}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <CheckCircle size={28} color="#FFFFFF" />
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => setShowInProgressModal(true)}
            activeOpacity={0.7}>
            <LinearGradient colors={['#F39C12', '#E67E22']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Zap size={28} color="#FFFFFF" />
              <Text style={styles.statValue}>{inProgressCount}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => setShowPointsModal(true)}
            activeOpacity={0.7}>
            <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Trophy size={28} color="#FFFFFF" />
              <Text style={styles.statValue}>
                {profile?.total_points && profile.total_points > 0
                  ? profile.total_points
                  : todayPoints || 0}
              </Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </LinearGradient>
          </TouchableOpacity>
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
                              userChallenge.challenge_id,
                              userChallenge.challenges?.title || '',
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Challenges</Text>
            <TouchableOpacity 
              style={styles.communityButton}
              onPress={() => setShowCommunityModal(true)}
              activeOpacity={0.7}>
              <Users size={22} color="#667EEA" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
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

      {/* Community Activity Modal */}
      <Modal visible={showCommunityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👥 Community Activity</Text>
              <TouchableOpacity onPress={() => setShowCommunityModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              
              {/* Motivational Header */}
              <View style={styles.communityHeader}>
                <Text style={styles.communityHeaderTitle}>🎉 You're Not Alone!</Text>
                <Text style={styles.communityHeaderText}>
                  Join thousands of users on their recovery journey
                </Text>
              </View>

              {/* Today's Stats */}
              <View style={styles.communitySection}>
                <Text style={styles.communitySectionTitle}>📊 Today's Activity</Text>
                <View style={styles.communityStatsGrid}>
                  <View style={styles.communityStatCard}>
                    <Text style={styles.communityStatValue}>{communityData.totalChallenges.toLocaleString()}</Text>
                    <Text style={styles.communityStatLabel}>Challenges Completed</Text>
                  </View>
                  <View style={styles.communityStatCard}>
                    <Text style={styles.communityStatValue}>{communityData.totalPoints.toLocaleString()}</Text>
                    <Text style={styles.communityStatLabel}>Points Earned</Text>
                  </View>
                </View>
              </View>

              {/* Popular Challenges */}
              <View style={styles.communitySection}>
                <Text style={styles.communitySectionTitle}>🔥 Popular Today</Text>
                <View style={styles.popularChallengeCard}>
                  <View style={styles.popularChallengeHeader}>
                    <Text style={styles.popularChallengeName}>Morning Meditation</Text>
                    <View style={styles.popularChallengeBadge}>
                      <Text style={styles.popularChallengeCount}>156 users</Text>
                    </View>
                  </View>
                  <Text style={styles.popularChallengeDesc}>Most completed challenge today</Text>
                </View>
                <View style={styles.popularChallengeCard}>
                  <View style={styles.popularChallengeHeader}>
                    <Text style={styles.popularChallengeName}>Exercise</Text>
                    <View style={styles.popularChallengeBadge}>
                      <Text style={styles.popularChallengeCount}>142 users</Text>
                    </View>
                  </View>
                  <Text style={styles.popularChallengeDesc}>Trending this week</Text>
                </View>
                <View style={styles.popularChallengeCard}>
                  <View style={styles.popularChallengeHeader}>
                    <Text style={styles.popularChallengeName}>Journal Entry</Text>
                    <View style={styles.popularChallengeBadge}>
                      <Text style={styles.popularChallengeCount}>128 users</Text>
                    </View>
                  </View>
                  <Text style={styles.popularChallengeDesc}>Great for reflection</Text>
                </View>
              </View>

              {/* Recent Activity Feed */}
              <View style={styles.communitySection}>
                <Text style={styles.communitySectionTitle}>⚡ Recent Activity</Text>
                <View style={styles.activityFeed}>
                  {communityData.recentActivity.map((activity) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <View style={[styles.activityAvatar, { backgroundColor: activity.color }]}>
                        <Text style={styles.activityAvatarText}>{activity.initial}</Text>
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityText}>
                          <Text style={styles.activityUser}>{activity.name}</Text> completed{' '}
                          <Text style={styles.activityChallenge}>{activity.challenge}</Text>
                        </Text>
                        <View style={styles.activityFooter}>
                          <Text style={styles.activityPoints}>+{activity.points} points</Text>
                          <Text style={styles.activityTime}>{activity.time}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Motivational Message */}
              <View style={styles.communityMotivation}>
                <Text style={styles.communityMotivationIcon}>💪</Text>
                <Text style={styles.communityMotivationText}>
                  You're part of an amazing community! Complete challenges to inspire others.
                </Text>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Guide Modal */}
      <Modal visible={showGuideModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.guideModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📖 Challenges Guide</Text>
              <TouchableOpacity onPress={() => setShowGuideModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={true}>
              
              {/* Welcome Section */}
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>👋 Welcome!</Text>
                <Text style={styles.guideSectionText}>
                  Complete daily challenges to earn points, level up, and unlock achievements on your recovery journey!
                </Text>
              </View>

              {/* How to Earn Points */}
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>💰 How to Earn Points</Text>
                <View style={styles.guideStep}>
                  <Text style={styles.guideStepNumber}>1</Text>
                  <View style={styles.guideStepContent}>
                    <Text style={styles.guideStepTitle}>Choose a Challenge</Text>
                    <Text style={styles.guideStepText}>Browse available challenges below</Text>
                  </View>
                </View>
                <View style={styles.guideStep}>
                  <Text style={styles.guideStepNumber}>2</Text>
                  <View style={styles.guideStepContent}>
                    <Text style={styles.guideStepTitle}>Tap to View Details</Text>
                    <Text style={styles.guideStepText}>See full description and requirements</Text>
                  </View>
                </View>
                <View style={styles.guideStep}>
                  <Text style={styles.guideStepNumber}>3</Text>
                  <View style={styles.guideStepContent}>
                    <Text style={styles.guideStepTitle}>Complete the Task</Text>
                    <Text style={styles.guideStepText}>Follow instructions and finish the challenge</Text>
                  </View>
                </View>
                <View style={styles.guideStep}>
                  <Text style={styles.guideStepNumber}>4</Text>
                  <View style={styles.guideStepContent}>
                    <Text style={styles.guideStepTitle}>Mark as Complete</Text>
                    <Text style={styles.guideStepText}>Tap "Complete" button to earn points!</Text>
                  </View>
                </View>
              </View>

              {/* Challenge Types */}
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>🎯 Challenge Types</Text>
                <View style={styles.guideChallengeType}>
                  <View style={[styles.guideDifficultyBadge, { backgroundColor: '#4ECDC4' }]}>
                    <Text style={styles.guideDifficultyText}>Easy</Text>
                  </View>
                  <Text style={styles.guideChallengeTypeText}>10-20 points • 5-30 minutes</Text>
                </View>
                <View style={styles.guideChallengeType}>
                  <View style={[styles.guideDifficultyBadge, { backgroundColor: '#F39C12' }]}>
                    <Text style={styles.guideDifficultyText}>Medium</Text>
                  </View>
                  <Text style={styles.guideChallengeTypeText}>15-40 points • 30-60 minutes</Text>
                </View>
                <View style={styles.guideChallengeType}>
                  <View style={[styles.guideDifficultyBadge, { backgroundColor: '#E74C3C' }]}>
                    <Text style={styles.guideDifficultyText}>Hard</Text>
                  </View>
                  <Text style={styles.guideChallengeTypeText}>45-100 points • 1+ hours</Text>
                </View>
              </View>

              {/* Categories */}
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>📂 Categories</Text>
                <View style={styles.guideCategoryList}>
                  <View style={styles.guideCategoryItem}>
                    <Text style={styles.guideCategoryIcon}>🧘</Text>
                    <Text style={styles.guideCategoryName}>Wellness</Text>
                    <Text style={styles.guideCategoryCount}>9 challenges</Text>
                  </View>
                  <View style={styles.guideCategoryItem}>
                    <Text style={styles.guideCategoryIcon}>💪</Text>
                    <Text style={styles.guideCategoryName}>Health</Text>
                    <Text style={styles.guideCategoryCount}>6 challenges</Text>
                  </View>
                  <View style={styles.guideCategoryItem}>
                    <Text style={styles.guideCategoryIcon}>📝</Text>
                    <Text style={styles.guideCategoryName}>Reflection</Text>
                    <Text style={styles.guideCategoryCount}>3 challenges</Text>
                  </View>
                  <View style={styles.guideCategoryItem}>
                    <Text style={styles.guideCategoryIcon}>📚</Text>
                    <Text style={styles.guideCategoryName}>Education</Text>
                    <Text style={styles.guideCategoryCount}>3 challenges</Text>
                  </View>
                  <View style={styles.guideCategoryItem}>
                    <Text style={styles.guideCategoryIcon}>👥</Text>
                    <Text style={styles.guideCategoryName}>Social</Text>
                    <Text style={styles.guideCategoryCount}>4 challenges</Text>
                  </View>
                </View>
              </View>

              {/* Stats Boxes */}
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>📊 Stats Boxes</Text>
                <Text style={styles.guideSectionText}>Tap on the colored boxes at the top to see:</Text>
                <View style={styles.guideStatsList}>
                  <View style={styles.guideStatsItem}>
                    <View style={[styles.guideStatsIcon, { backgroundColor: '#4ECDC4' }]}>
                      <Text style={styles.guideStatsIconText}>✓</Text>
                    </View>
                    <Text style={styles.guideStatsText}>Completed challenges list</Text>
                  </View>
                  <View style={styles.guideStatsItem}>
                    <View style={[styles.guideStatsIcon, { backgroundColor: '#F39C12' }]}>
                      <Text style={styles.guideStatsIconText}>⚡</Text>
                    </View>
                    <Text style={styles.guideStatsText}>In-progress challenges</Text>
                  </View>
                  <View style={styles.guideStatsItem}>
                    <View style={[styles.guideStatsIcon, { backgroundColor: '#667EEA' }]}>
                      <Text style={styles.guideStatsIconText}>🏆</Text>
                    </View>
                    <Text style={styles.guideStatsText}>Points breakdown & level info</Text>
                  </View>
                </View>
              </View>

              {/* Tips */}
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>💡 Pro Tips</Text>
                <View style={styles.guideTip}>
                  <Text style={styles.guideTipIcon}>✨</Text>
                  <Text style={styles.guideTipText}>Start with easy challenges to build momentum</Text>
                </View>
                <View style={styles.guideTip}>
                  <Text style={styles.guideTipIcon}>🔥</Text>
                  <Text style={styles.guideTipText}>Complete 2-3 challenges daily for steady progress</Text>
                </View>
                <View style={styles.guideTip}>
                  <Text style={styles.guideTipIcon}>🎯</Text>
                  <Text style={styles.guideTipText}>Mix different categories for balanced growth</Text>
                </View>
                <View style={styles.guideTip}>
                  <Text style={styles.guideTipIcon}>📅</Text>
                  <Text style={styles.guideTipText}>Challenges reset daily - come back tomorrow!</Text>
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.guideStatsCard}>
                <Text style={styles.guideStatsCardTitle}>📈 Quick Stats</Text>
                <View style={styles.guideStatsRow}>
                  <Text style={styles.guideStatsLabel}>Total Challenges:</Text>
                  <Text style={styles.guideStatsValue}>25</Text>
                </View>
                <View style={styles.guideStatsRow}>
                  <Text style={styles.guideStatsLabel}>Total Points Available:</Text>
                  <Text style={styles.guideStatsValue}>505</Text>
                </View>
                <View style={styles.guideStatsRow}>
                  <Text style={styles.guideStatsLabel}>Your Progress:</Text>
                  <Text style={styles.guideStatsValue}>{completedCount} completed</Text>
                </View>
              </View>

              <View style={styles.guideFooter}>
                <Text style={styles.guideFooterText}>
                  🎉 Start completing challenges now to earn points and level up!
                </Text>
                <TouchableOpacity 
                  style={styles.guideCloseButton}
                  onPress={() => setShowGuideModal(false)}>
                  <Text style={styles.guideCloseButtonText}>Got it!</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Milestone Prompt Modal */}
      <MilestonePrompt
        visible={showMilestonePrompt}
        milestoneType={milestoneType}
        milestoneData={milestoneData}
        onDismiss={handleDismissMilestone}
      />

      {/* Completed Challenges Modal */}
      <Modal visible={showCompletedModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✅ Completed Challenges</Text>
              <TouchableOpacity onPress={() => setShowCompletedModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {completedChallenges.length === 0 ? (
                <Text style={styles.emptyModalText}>No challenges completed yet. Start completing challenges to earn points!</Text>
              ) : (
                completedChallenges.map((uc, index) => (
                  <View key={uc.id || index} style={styles.modalChallengeCard}>
                    <View style={styles.modalChallengeHeader}>
                      <CheckCircle size={20} color="#27AE60" />
                      <Text style={styles.modalChallengeTitle}>
                        {uc.challenges?.title || uc.challenges?.task_name || 'Challenge'}
                      </Text>
                    </View>
                    <Text style={styles.modalChallengeDesc}>
                      {uc.challenges?.description || 'No description'}
                    </Text>
                    <View style={styles.modalChallengeFooter}>
                      <View style={styles.modalPointsBadge}>
                        <Star size={14} color="#FFD700" />
                        <Text style={styles.modalPointsText}>
                          +{uc.challenges?.points_reward || 0} points
                        </Text>
                      </View>
                      <Text style={styles.modalDifficultyText}>
                        {uc.challenges?.difficulty || 'Easy'}
                      </Text>
                    </View>
                  </View>
                ))
              )}
              <View style={styles.modalSummary}>
                <Text style={styles.modalSummaryText}>
                  Total: {completedChallenges.length} challenges completed
                </Text>
                <Text style={styles.modalSummaryPoints}>
                  {completedChallenges.reduce((sum, uc) => sum + (uc.challenges?.points_reward || 0), 0)} points earned
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* In Progress Challenges Modal */}
      <Modal visible={showInProgressModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚡ In Progress</Text>
              <TouchableOpacity onPress={() => setShowInProgressModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {inProgressChallenges.length === 0 ? (
                <Text style={styles.emptyModalText}>No challenges in progress. Start a challenge to begin!</Text>
              ) : (
                inProgressChallenges.map((uc, index) => (
                  <View key={uc.id || index} style={styles.modalChallengeCard}>
                    <View style={styles.modalChallengeHeader}>
                      <Zap size={20} color="#F39C12" />
                      <Text style={styles.modalChallengeTitle}>
                        {uc.challenges?.title || uc.challenges?.task_name || 'Challenge'}
                      </Text>
                    </View>
                    <Text style={styles.modalChallengeDesc}>
                      {uc.challenges?.description || 'No description'}
                    </Text>
                    <View style={styles.modalChallengeFooter}>
                      <View style={styles.modalPointsBadge}>
                        <Star size={14} color="#FFD700" />
                        <Text style={styles.modalPointsText}>
                          {uc.challenges?.points_reward || 0} points
                        </Text>
                      </View>
                      <Text style={styles.modalDifficultyText}>
                        {uc.challenges?.difficulty || 'Easy'}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Total Points Breakdown Modal */}
      <Modal visible={showPointsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏆 Points Breakdown</Text>
              <TouchableOpacity onPress={() => setShowPointsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.pointsBreakdownCard}>
                <Text style={styles.pointsBreakdownTitle}>Total Points</Text>
                <Text style={styles.pointsBreakdownValue}>
                  {profile?.total_points || todayPoints || 0}
                </Text>
              </View>

              <View style={styles.pointsSection}>
                <Text style={styles.pointsSectionTitle}>📋 From Challenges</Text>
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsLabel}>Completed Today:</Text>
                  <Text style={styles.pointsValue}>{completedCount} challenges</Text>
                </View>
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsLabel}>Points Earned:</Text>
                  <Text style={styles.pointsValue}>
                    {completedChallenges.reduce((sum, uc) => sum + (uc.challenges?.points_reward || 0), 0)} points
                  </Text>
                </View>
              </View>

              <View style={styles.pointsSection}>
                <Text style={styles.pointsSectionTitle}>🏅 Current Level</Text>
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsLabel}>Level:</Text>
                  <Text style={styles.pointsValue}>
                    {profile?.level_id || 1} - {profile?.level || 'Beginner'}
                  </Text>
                </View>
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsLabel}>Progress:</Text>
                  <Text style={styles.pointsValue}>
                    {profile?.total_points || 0} / {Math.ceil(((profile?.total_points || 0) / 1000) + 1) * 1000} points
                  </Text>
                </View>
              </View>

              <View style={styles.pointsTip}>
                <Text style={styles.pointsTipText}>
                  💡 Complete more challenges to earn points and level up!
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
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
  guideButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  guideButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  communityButton: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#667EEA',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalClose: {
    fontSize: 28,
    color: '#7F8C8D',
    fontWeight: '300',
  },
  modalScroll: {
    flex: 1,
    marginBottom: 20,
  },
  emptyModalText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingVertical: 40,
    lineHeight: 24,
  },
  modalChallengeCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalChallengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalChallengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  modalChallengeDesc: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  modalChallengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalPointsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F39C12',
    marginLeft: 4,
  },
  modalDifficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667EEA',
    textTransform: 'uppercase',
  },
  modalSummary: {
    backgroundColor: '#667EEA',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalSummaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSummaryPoints: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  pointsBreakdownCard: {
    backgroundColor: '#667EEA',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsBreakdownTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  pointsBreakdownValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pointsSection: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pointsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  pointsTip: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  pointsTipText: {
    fontSize: 14,
    color: '#27AE60',
    textAlign: 'center',
    lineHeight: 20,
  },
  guideModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  guideSection: {
    marginBottom: 24,
  },
  guideSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  guideSectionText: {
    fontSize: 15,
    color: '#7F8C8D',
    lineHeight: 22,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  guideStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667EEA',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  guideStepContent: {
    flex: 1,
  },
  guideStepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  guideStepText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  guideChallengeType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideDifficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 80,
  },
  guideDifficultyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guideChallengeTypeText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  guideCategoryList: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
  },
  guideCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  guideCategoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  guideCategoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  guideCategoryCount: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  guideStatsList: {
    marginTop: 12,
  },
  guideStatsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideStatsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  guideStatsIconText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  guideStatsText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  guideTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  guideTipIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  guideTipText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  guideStatsCard: {
    backgroundColor: '#667EEA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  guideStatsCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  guideStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  guideStatsLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  guideStatsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  guideFooter: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  guideFooterText: {
    fontSize: 15,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  guideCloseButton: {
    backgroundColor: '#667EEA',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  guideCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  communityHeader: {
    backgroundColor: '#667EEA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  communityHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  communityHeaderText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  communitySection: {
    marginBottom: 24,
  },
  communitySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  communityStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  communityStatCard: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  communityStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667EEA',
    marginBottom: 4,
  },
  communityStatLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  popularChallengeCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  popularChallengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  popularChallengeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  popularChallengeBadge: {
    backgroundColor: '#667EEA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularChallengeCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  popularChallengeDesc: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  activityFeed: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
    marginBottom: 6,
  },
  activityUser: {
    fontWeight: '600',
    color: '#667EEA',
  },
  activityChallenge: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityPoints: {
    fontSize: 13,
    fontWeight: '600',
    color: '#27AE60',
    marginRight: 12,
  },
  activityTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  communityMotivation: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  communityMotivationIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  communityMotivationText: {
    fontSize: 15,
    color: '#27AE60',
    textAlign: 'center',
    lineHeight: 22,
  },
});
