import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { MotivationalQuote, UserBadge, Badge, DrinkLog } from '@/types/database.types';
import { Flame, Trophy, Zap, Award, Heart, AlertCircle, Activity, Target } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const { profile, refreshProfile } = useAuth();
  const navigation = useNavigation<any>();
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [recentBadges, setRecentBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soberDays, setSoberDays] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);

  const loadData = async () => {
    try {
      const quoteResponse = await api.getQuote();
      if (quoteResponse.quote) {
        setQuote(quoteResponse.quote);
      }

      if (profile?.id) {
        try {
          // Use getGamificationProfile to get only earned achievements with earned_at dates
          const gamificationResponse = await api.getGamificationProfile();
          if (gamificationResponse?.achievements && gamificationResponse.achievements.length > 0) {
            // Sort by earned_at date (most recent first) and take top 3
            const recent = gamificationResponse.achievements
              .sort((a: any, b: any) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
              .slice(0, 3);
            setRecentBadges(recent);
          } else {
            // New user - no achievements yet
            setRecentBadges([]);
          }
        } catch (error) {
          console.error('Error fetching achievements:', error);
          setRecentBadges([]);
        }

        let todaysPoints = 0;
        try {
          const todayTasksResponse = await api.getTodayTasks();
          todaysPoints = todayTasksResponse.totalPointsEarnedToday || 0;
          setTodayPoints(todaysPoints);
        } catch (pointsError) {
          console.error('Error loading today points:', pointsError);
          setTodayPoints(0);
        }

        const drinkLogsResponse = await api.getDrinkLogs();
        if (drinkLogsResponse.logs) {
          const drinkLogs = drinkLogsResponse.logs;
          let currentStreak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toISOString().split('T')[0];

            const log = drinkLogs.find((l: any) => l.date === dateString);

            if (!log || log.drinks_count === 0) {
              currentStreak++;
            } else {
              break;
            }
          }

          setSoberDays(currentStreak);
        }

        // Load total points from gamification profile as single source of truth
        try {
          const gamificationResponse = await api.getGamificationProfile();
          if (gamificationResponse?.profile?.total_points !== undefined) {
            setTotalPoints(gamificationResponse.profile.total_points || (todaysPoints || profile.total_points || 0));
          } else {
            setTotalPoints(profile.total_points || todaysPoints || 0);
          }
        } catch (pointsError) {
          console.error('Error loading total points:', pointsError);
          setTotalPoints(profile.total_points || todaysPoints || 0);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  useFocusEffect(
    React.useCallback(() => {
      refreshProfile();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    await loadData();
  };

  const handleSOS = () => {
    navigation.navigate('SOS' as never);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello, {profile?.username || 'Friend'}!</Text>
          <Text style={styles.welcomeText}>Keep up the amazing work</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
          <AlertCircle size={24} color="#FFFFFF" />
          <Text style={styles.sosButtonText}>SOS Help</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Flame size={32} color="#FFFFFF" />
              <Text style={styles.statValue}>{soberDays}</Text>
              <Text style={styles.statLabel}>Sober Days</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Zap size={32} color="#FFFFFF" />
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Trophy size={32} color="#FFFFFF" />
              <Text style={styles.statValue}>{profile?.current_streak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </LinearGradient>
          </View>
        </View>

        {quote && (
          <View style={styles.quoteCard}>
            <Heart size={24} color="#FF6B6B" style={styles.quoteIcon} />
            <Text style={styles.quoteText}>"{quote.quote}"</Text>
            <Text style={styles.quoteAuthor}>- {quote.author}</Text>
          </View>
        )}

        <View style={styles.levelCard}>
          <LinearGradient colors={['#F093FB', '#F5576C']} style={styles.levelGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <Text style={styles.levelTitle}>Current Level</Text>
            <Text style={styles.levelValue}>{profile?.level || 'Beginner'}</Text>
            <View style={styles.avatarLevelContainer}>
              <Award size={24} color="#FFFFFF" />
              <Text style={styles.avatarLevelText}>Avatar Level {profile?.avatar_level || 1}</Text>
            </View>
          </LinearGradient>
        </View>

          <View style={styles.badgesSection}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <View style={styles.badgesContainer}>
            {recentBadges.length > 0 ? (
              recentBadges.map((userBadge, index) => {
                // The gamification profile returns achievements with achievement_name and description directly
                const badgeName = userBadge.achievement_name || userBadge.name || 'Achievement';
                const badgeDescription = userBadge.description || 'Keep up the progress!';
                
                return (
                  <View key={userBadge.id || `badge-${index}`} style={styles.badgeCard}>
                    <View style={styles.badgeIconContainer}>
                      <Award size={32} color="#FFD700" />
                    </View>
                    <Text style={styles.badgeName}>{badgeName}</Text>
                    <Text style={styles.badgeDescription} numberOfLines={2}>
                      {badgeDescription}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.badgesEmptyText}>No achievements yet. Complete tasks to earn badges.</Text>
            )}
            </View>
          </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Track' as never)}>
              <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.actionGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                <Activity size={28} color="#FFFFFF" />
                <Text style={styles.actionText}>Log Drinks</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Challenges' as never)}>
              <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.actionGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                <Target size={28} color="#FFFFFF" />
                <Text style={styles.actionText}>Challenges</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
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
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    marginTop: 8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  sosButton: {
    backgroundColor: '#E74C3C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quoteIcon: {
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#2C3E50',
    lineHeight: 28,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'right',
  },
  levelCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  levelGradient: {
    padding: 24,
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  levelValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  avatarLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  avatarLevelText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  badgesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgesEmptyText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    flex: 1,
    paddingVertical: 16,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIconContainer: {
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
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
  actionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
});
