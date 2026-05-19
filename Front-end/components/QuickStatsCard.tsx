import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { api } from '@/lib/api';

export default function QuickStatsCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.getStatsSummary();
      setData(response);
    } catch (error) {
      console.error('Error loading stats summary:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.card}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>📈</Text>
          <Text style={styles.errorText}>Unable to load statistics</Text>
          <Text style={styles.errorSubtext}>Keep logging to build your stats!</Text>
        </View>
      </View>
    );
  }

  const { allTime, thisMonth } = data;

  const getMoodEmoji = (mood: string | null) => {
    if (!mood) return '😐';
    const moodMap: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      stressed: '😰',
      anxious: '😟',
      calm: '😌',
      energetic: '🤩',
    };
    return moodMap[mood] || '😐';
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}>
        <Text style={styles.headerTitle}>📈 Quick Stats</Text>
        {expanded ? <ChevronUp size={24} color="#2C3E50" /> : <ChevronDown size={24} color="#2C3E50" />}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {/* All Time Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Time</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={styles.statValue}>{allTime.soberDays}</Text>
                <Text style={styles.statLabel}>Sober Days</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🚫</Text>
                <Text style={styles.statValue}>{allTime.drinksAvoided}</Text>
                <Text style={styles.statLabel}>Drinks Avoided</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>💰</Text>
                <Text style={styles.statValue}>RS {allTime.moneySaved}</Text>
                <Text style={styles.statLabel}>Money Saved</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>💸</Text>
                <Text style={styles.statValue}>RS {allTime.moneySpent || 0}</Text>
                <Text style={styles.statLabel}>Money Spent</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statValue}>RS {allTime.avgDrinkPrice || 500}</Text>
                <Text style={styles.statLabel}>Avg Price</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📱</Text>
                <Text style={styles.statValue}>{allTime.daysInApp}</Text>
                <Text style={styles.statLabel}>Days in App</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statValue}>{allTime.totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🍺</Text>
                <Text style={styles.statValue}>{allTime.totalDrinks}</Text>
                <Text style={styles.statLabel}>Total Drinks</Text>
              </View>
            </View>
          </View>

          {/* This Month Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Month</Text>
            <View style={styles.monthStats}>
              <View style={styles.monthStatRow}>
                <Text style={styles.monthStatLabel}>Sober Days</Text>
                <Text style={styles.monthStatValue}>{thisMonth.soberDays}</Text>
              </View>

              <View style={styles.monthStatRow}>
                <Text style={styles.monthStatLabel}>Total Drinks</Text>
                <Text style={styles.monthStatValue}>{thisMonth.totalDrinks}</Text>
              </View>

              <View style={styles.monthStatRow}>
                <Text style={styles.monthStatLabel}>Average Drinks/Day</Text>
                <Text style={styles.monthStatValue}>{thisMonth.averageDrinks}</Text>
              </View>

              <View style={styles.monthStatRow}>
                <Text style={styles.monthStatLabel}>Days Logged</Text>
                <Text style={styles.monthStatValue}>{thisMonth.daysLogged}</Text>
              </View>

              <View style={styles.monthStatRow}>
                <Text style={styles.monthStatLabel}>Money Spent</Text>
                <Text style={styles.monthStatValue}>RS {thisMonth.moneySpent || 0}</Text>
              </View>

              {thisMonth.mostCommonMood && (
                <View style={styles.monthStatRow}>
                  <Text style={styles.monthStatLabel}>Most Common Mood</Text>
                  <View style={styles.moodValue}>
                    <Text style={styles.moodEmoji}>{getMoodEmoji(thisMonth.mostCommonMood)}</Text>
                    <Text style={styles.monthStatValue}>
                      {thisMonth.mostCommonMood.charAt(0).toUpperCase() + thisMonth.mostCommonMood.slice(1)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Highlight */}
          {allTime.moneySaved > 0 && (
            <View style={styles.highlight}>
              <Text style={styles.highlightText}>
                💰 You've saved RS {allTime.moneySaved} by avoiding {allTime.drinksAvoided} drinks!
              </Text>
            </View>
          )}
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: '30%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  monthStats: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  monthStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  monthStatLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  monthStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  moodValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodEmoji: {
    fontSize: 18,
  },
  highlight: {
    backgroundColor: '#10B98110',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
