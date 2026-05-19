import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface StreakVisualizationProps {
  currentStreak: number;
  longestStreak: number;
  daysSober: number;
}

export default function StreakVisualization({
  currentStreak,
  longestStreak,
  daysSober,
}: StreakVisualizationProps) {
  // Milestone targets
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  const nextMilestone = milestones.find((m) => m > currentStreak) || milestones[milestones.length - 1];
  const progress = (currentStreak / nextMilestone) * 100;

  const getStreakEmoji = (streak: number) => {
    if (streak >= 365) return '👑';
    if (streak >= 180) return '💎';
    if (streak >= 90) return '🏆';
    if (streak >= 60) return '⭐';
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '💪';
    if (streak >= 7) return '🎯';
    return '🌱';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 365) return 'Legendary! One year strong!';
    if (streak >= 180) return 'Diamond status! Amazing!';
    if (streak >= 90) return 'Champion! 90 days!';
    if (streak >= 60) return 'Superstar! 60 days!';
    if (streak >= 30) return 'On fire! 30 days!';
    if (streak >= 14) return 'Two weeks strong!';
    if (streak >= 7) return 'One week milestone!';
    if (streak >= 1) return 'Great start! Keep going!';
    return 'Start your streak today!';
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#F093FB', '#F5576C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}>
        <Text style={styles.headerTitle}>🔥 Streak Status</Text>
        <Text style={styles.headerSubtitle}>Keep the momentum going!</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Current Streak */}
        <View style={styles.streakSection}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakEmoji}>{getStreakEmoji(currentStreak)}</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakValue}>{currentStreak} days</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
          </View>
          <Text style={styles.streakMessage}>{getStreakMessage(currentStreak)}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Longest</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{daysSober}</Text>
            <Text style={styles.statLabel}>Total Sober</Text>
          </View>
        </View>

        {/* Next Milestone */}
        <View style={styles.milestoneSection}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneTitle}>Next Milestone</Text>
            <Text style={styles.milestoneTarget}>{nextMilestone} days</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <Text style={styles.milestoneText}>
            {nextMilestone - currentStreak} days to go! 💪
          </Text>
        </View>

        {/* Milestone List */}
        <View style={styles.milestonesGrid}>
          {milestones.map((milestone) => {
            const achieved = currentStreak >= milestone;
            return (
              <View
                key={milestone}
                style={[styles.milestoneChip, achieved && styles.milestoneChipAchieved]}>
                <Text style={[styles.milestoneChipText, achieved && styles.milestoneChipTextAchieved]}>
                  {achieved ? '✓' : ''} {milestone}d
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  streakSection: {
    marginBottom: 20,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  streakLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  streakMessage: {
    fontSize: 14,
    color: '#F5576C',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  milestoneSection: {
    marginBottom: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  milestoneTarget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F5576C',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F5576C',
    borderRadius: 4,
  },
  milestoneText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  milestoneChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  milestoneChipAchieved: {
    backgroundColor: '#10B98110',
    borderColor: '#10B981',
  },
  milestoneChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  milestoneChipTextAchieved: {
    color: '#10B981',
  },
});
