import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ChevronLeft } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

// Avatar options for random selection
const AVATAR_OPTIONS = [
  '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿',
  '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿',
  '🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿',
  '👴🏻', '👴🏼', '👴🏽', '👴🏾', '👴🏿',
  '👵🏻', '👵🏼', '👵🏽', '👵🏾', '👵🏿',
];

// Indian names for mock data
const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
  'Aadhya', 'Ananya', 'Diya', 'Isha', 'Kavya', 'Kiara', 'Navya', 'Pari', 'Saanvi', 'Sara',
  'Rohan', 'Ravi', 'Karthik', 'Priya', 'Meera', 'Lakshmi', 'Vijay', 'Kumar', 'Deepak', 'Suresh',
  'Anjali', 'Divya', 'Pooja', 'Sneha', 'Swati', 'Neha', 'Ritu', 'Kavita', 'Madhuri', 'Rekha',
];

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Nair', 'Iyer', 'Menon', 'Rao', 'Gupta',
  'Verma', 'Joshi', 'Desai', 'Mehta', 'Shah', 'Pillai', 'Krishnan', 'Bhat', 'Agarwal', 'Chopra',
];

interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
}

export default function LeaderboardScreen() {
  const navigation = useNavigation();
  const { profile, anonymousData, isAnonymous } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userChallengesCompleted, setUserChallengesCompleted] = useState(0);
  const [userPoints, setUserPoints] = useState(0);

  // Generate random name
  const generateRandomName = () => {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${firstName} ${lastName}`;
  };

  // Generate random avatar
  const generateRandomAvatar = () => {
    return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
  };

  // Generate random points (weighted towards lower values for realism)
  const generateRandomPoints = () => {
    const rand = Math.random();
    if (rand < 0.3) {
      // 30% chance: 5,000 - 15,000 points
      return Math.floor(Math.random() * 10000) + 5000;
    } else if (rand < 0.6) {
      // 30% chance: 15,000 - 30,000 points
      return Math.floor(Math.random() * 15000) + 15000;
    } else if (rand < 0.85) {
      // 25% chance: 30,000 - 50,000 points
      return Math.floor(Math.random() * 20000) + 30000;
    } else {
      // 15% chance: 50,000 - 80,000 points (top players)
      return Math.floor(Math.random() * 30000) + 50000;
    }
  };

  // Generate random trend
  const generateRandomTrend = (): 'up' | 'down' | 'same' => {
    const rand = Math.random();
    if (rand < 0.4) return 'up';
    if (rand < 0.7) return 'down';
    return 'same';
  };

  // Generate mock leaderboard data
  const generateLeaderboardData = () => {
    const entries: LeaderboardEntry[] = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < 40; i++) {
      let name = generateRandomName();
      // Ensure unique names
      while (usedNames.has(name)) {
        name = generateRandomName();
      }
      usedNames.add(name);

      entries.push({
        id: i + 1,
        name,
        avatar: generateRandomAvatar(),
        points: generateRandomPoints(),
        rank: i + 1, // Will be updated after sorting
        trend: generateRandomTrend(),
      });
    }

    // Sort by points descending
    entries.sort((a, b) => b.points - a.points);

    // Update ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  };

  // Load user stats and generate leaderboard
  useEffect(() => {
    const loadUserStats = async () => {
      // Get user's real stats
      if (isAnonymous && anonymousData) {
        setUserChallengesCompleted(anonymousData.completedTasks?.length || 0);
        setUserPoints(anonymousData.totalPoints || 0);
      } else if (profile) {
        // For registered users, get challenges completed count from backend
        try {
          const stats = await api.getTaskStatistics();
          setUserChallengesCompleted(stats.statistics?.totalTasksCompleted || 0);
          setUserPoints(profile.total_points || 0);
        } catch (error) {
          console.error('Error loading task statistics:', error);
          // Fallback to profile data
          setUserChallengesCompleted(0);
          setUserPoints(profile.total_points || 0);
        }
      }
    };

    loadUserStats();

    // Generate new random leaderboard data on each mount
    setLeaderboardData(generateLeaderboardData());
  }, [profile, anonymousData, isAnonymous]);

  // Get podium colors
  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#A8E6A1'; // Green
      case 2:
        return '#FFD89C'; // Orange/Gold
      case 3:
        return '#FFB6C1'; // Pink
      default:
        return '#E0E0E0';
    }
  };

  // Get rank badge color
  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return '#FFFFFF';
    return '#757575';
  };

  return (
    <View style={styles.container}>
      {/* Sunburst background using conic gradient simulation */}
      <View style={styles.sunburstContainer}>
        {[...Array(32)].map((_, i) => {
          const rotation = (i * 360) / 32;
          const isLight = i % 2 === 0;
          return (
            <View
              key={i}
              style={[
                styles.sunburstSegment,
                {
                  backgroundColor: isLight ? '#FFFFFF' : '#F5F0E8',
                  transform: [{ rotate: `${rotation}deg` }],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Overlay to soften the effect */}
      <View style={styles.sunburstOverlay} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="#2C3E50" />
        </TouchableOpacity>
        <View style={styles.headerStats}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatIcon}>💎</Text>
            <Text style={styles.headerStatValue}>{userChallengesCompleted}</Text>
          </View>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatIcon}>🏆</Text>
            <Text style={styles.headerStatValue}>{userPoints.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Leaderboard</Text>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top 3 Podium */}
        <View style={styles.podiumContainer}>
          {/* Rank 2 */}
          {leaderboardData[1] && (
            <View style={styles.podiumItem}>
              <View style={[styles.podiumAvatar, { borderColor: getPodiumColor(2) }]}>
                <Text style={styles.podiumAvatarText}>{leaderboardData[1].avatar}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {leaderboardData[1].name.split(' ')[0]}
              </Text>
              <View style={styles.podiumPoints}>
                <Text style={styles.podiumPointsIcon}>💎</Text>
                <Text style={styles.podiumPointsValue}>
                  {leaderboardData[1].points.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.podiumRank, { backgroundColor: getPodiumColor(2) }]}>
                <Text style={styles.podiumRankText}>#2</Text>
              </View>
            </View>
          )}

          {/* Rank 1 */}
          {leaderboardData[0] && (
            <View style={[styles.podiumItem, styles.podiumItemFirst]}>
              <View style={[styles.podiumAvatar, styles.podiumAvatarFirst, { borderColor: getPodiumColor(1) }]}>
                <Text style={styles.podiumAvatarText}>{leaderboardData[0].avatar}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {leaderboardData[0].name.split(' ')[0]}
              </Text>
              <View style={styles.podiumPoints}>
                <Text style={styles.podiumPointsIcon}>💎</Text>
                <Text style={styles.podiumPointsValue}>
                  {leaderboardData[0].points.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.podiumRank, styles.podiumRankFirst, { backgroundColor: getPodiumColor(1) }]}>
                <Text style={styles.podiumRankText}>#1</Text>
              </View>
            </View>
          )}

          {/* Rank 3 */}
          {leaderboardData[2] && (
            <View style={styles.podiumItem}>
              <View style={[styles.podiumAvatar, { borderColor: getPodiumColor(3) }]}>
                <Text style={styles.podiumAvatarText}>{leaderboardData[2].avatar}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {leaderboardData[2].name.split(' ')[0]}
              </Text>
              <View style={styles.podiumPoints}>
                <Text style={styles.podiumPointsIcon}>💎</Text>
                <Text style={styles.podiumPointsValue}>
                  {leaderboardData[2].points.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.podiumRank, { backgroundColor: getPodiumColor(3) }]}>
                <Text style={styles.podiumRankText}>#3</Text>
              </View>
            </View>
          )}
        </View>

        {/* Rest of leaderboard */}
        <View style={styles.listContainer}>
          {leaderboardData.slice(3).map((entry) => (
            <View key={entry.id} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Text style={styles.listRank}>#{entry.rank}</Text>
                <View style={styles.listAvatar}>
                  <Text style={styles.listAvatarText}>{entry.avatar}</Text>
                </View>
                <Text style={styles.listName}>{entry.name}</Text>
              </View>
              <View style={styles.listItemRight}>
                <View style={styles.listPoints}>
                  <Text style={styles.listPointsIcon}>💎</Text>
                  <Text style={styles.listPointsValue}>
                    {entry.points.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.listTrend}>
                  {entry.trend === 'up' && <Text style={styles.trendUp}>▲</Text>}
                  {entry.trend === 'down' && <Text style={styles.trendDown}>▼</Text>}
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
    backgroundColor: '#F5F0E8',
  },
  sunburstContainer: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    width: 1200,
    height: 1200,
    marginLeft: -600,
    marginTop: -600,
  },
  sunburstSegment: {
    position: 'absolute',
    width: 600,
    height: 600,
    left: 300,
    top: 300,
    transformOrigin: '0% 0%',
  },
  sunburstOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F0E8',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  headerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  headerStatIcon: {
    fontSize: 20,
  },
  headerStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  podiumItemFirst: {
    marginBottom: 20,
  },
  podiumAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumAvatarFirst: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  podiumAvatarText: {
    fontSize: 36,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  podiumPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  podiumPointsIcon: {
    fontSize: 14,
  },
  podiumPointsValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C3E50',
  },
  podiumRank: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  podiumRankFirst: {
    paddingVertical: 48,
  },
  podiumRankText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  listRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#757575',
    width: 32,
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  listAvatarText: {
    fontSize: 24,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  listPointsIcon: {
    fontSize: 14,
  },
  listPointsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667EEA',
  },
  listTrend: {
    width: 20,
    alignItems: 'center',
  },
  trendUp: {
    fontSize: 14,
    color: '#27AE60',
  },
  trendDown: {
    fontSize: 14,
    color: '#E74C3C',
  },
});
