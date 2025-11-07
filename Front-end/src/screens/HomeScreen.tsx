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
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Flame, Trophy, Zap, Award, Heart, AlertCircle, Activity, Target } from 'lucide-react-native';

type MotivationalQuote = { id: number; quote: string; author: string };
type Achievement = { id: number; name: string; description: string; earned_at?: string };

export default function HomeScreen() {
  const { profile, refreshProfile } = useAuth();
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soberDays, setSoberDays] = useState(0);

  const loadData = async () => {
    try {
      // Get motivational quote
      try {
        const quoteData = await apiClient.getMotivationalQuote();
        if (quoteData.quote) {
          setQuote(quoteData.quote);
        }
      } catch (error) {
        console.error('Error loading quote:', error);
      }

      // Get dashboard data (includes profile, achievements, etc.)
      try {
        const dashboard = await apiClient.getDashboard();
        if (dashboard.dashboard) {
          setSoberDays(dashboard.dashboard.profile?.days_sober || 0);
          setRecentAchievements(dashboard.dashboard.recentAchievements || []);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        // Fallback to drink statistics
        try {
          const stats = await apiClient.getDrinkStatistics();
          if (stats.statistics) {
            setSoberDays(stats.statistics.totalSoberDays || 0);
          }
        } catch (statsError) {
          console.error('Error loading statistics:', statsError);
        }
      }

      // Get achievements
      try {
        const achievementsData = await apiClient.getAchievements();
        if (achievementsData.achievements) {
          const earned = achievementsData.achievements.filter((a: any) => a.earned_at);
          setRecentAchievements(earned.slice(0, 3));
        }
      } catch (error) {
        console.error('Error loading achievements:', error);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    await loadData();
  };

  const handleSOS = () => {
    navigation.navigate('SOS');
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
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello, {profile?.username || profile?.user_id || 'Friend'}!</Text>
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
            <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.statGradient}>
              <Flame size={32} color="#FFFFFF" />
              <Text style={styles.statValue}>{soberDays}</Text>
              <Text style={styles.statLabel}>Sober Days</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.statGradient}>
              <Zap size={32} color="#FFFFFF" />
              <Text style={styles.statValue}>{profile?.total_points || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.statGradient}>
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
          <LinearGradient colors={['#F093FB', '#F5576C']} style={styles.levelGradient}>
            <Text style={styles.levelTitle}>Current Level</Text>
            <Text style={styles.levelValue}>Level {profile?.level_id || 1}</Text>
            <View style={styles.avatarLevelContainer}>
              <Award size={24} color="#FFFFFF" />
              <Text style={styles.avatarLevelText}>Avatar: {profile?.avatar_type || 'Basic'}</Text>
            </View>
          </LinearGradient>
        </View>

        {recentAchievements.length > 0 && (
          <View style={styles.badgesSection}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <View style={styles.badgesContainer}>
              {recentAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.badgeCard}>
                  <View style={styles.badgeIconContainer}>
                    <Award size={32} color="#FFD700" />
                  </View>
                  <Text style={styles.badgeName}>{achievement.name}</Text>
                  <Text style={styles.badgeDescription} numberOfLines={2}>
                    {achievement.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.actionGradient}>
                <Activity size={28} color="#FFFFFF" />
                <Text style={styles.actionText}>Log Drinks</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.actionGradient}>
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
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24 },
  headerContent: { marginTop: 8 },
  greeting: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  welcomeText: { fontSize: 16, color: '#FFFFFF', opacity: 0.9, marginTop: 4 },
  content: { padding: 16 },
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
  sosButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
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
  statGradient: { padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#FFFFFF', marginTop: 4, textAlign: 'center' },
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
  quoteIcon: { marginBottom: 12 },
  quoteText: { fontSize: 18, fontStyle: 'italic', color: '#2C3E50', lineHeight: 28, marginBottom: 12 },
  quoteAuthor: { fontSize: 14, color: '#7F8C8D', textAlign: 'right' },
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
  levelGradient: { padding: 24, alignItems: 'center' },
  levelTitle: { fontSize: 16, color: '#FFFFFF', opacity: 0.9 },
  levelValue: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginVertical: 8 },
  avatarLevelContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  avatarLevelText: { fontSize: 14, color: '#FFFFFF', marginLeft: 8 },
  badgesSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', marginBottom: 16 },
  badgesContainer: { flexDirection: 'row', justifyContent: 'space-between' },
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
  badgeIconContainer: { marginBottom: 8 },
  badgeName: { fontSize: 14, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginBottom: 4 },
  badgeDescription: { fontSize: 11, color: '#7F8C8D', textAlign: 'center' },
  quickActions: { marginBottom: 20 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
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
  actionGradient: { padding: 20, alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginTop: 8 },
});
