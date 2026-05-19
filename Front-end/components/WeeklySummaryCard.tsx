import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { api } from '@/lib/api';

export default function WeeklySummaryCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.getWeeklyComparison();
      setData(response);
    } catch (error) {
      console.error('Error loading weekly comparison:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Loading comparison...</Text>
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.card}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>📊</Text>
          <Text style={styles.errorText}>Unable to load weekly comparison</Text>
          <Text style={styles.errorSubtext}>Log more data to see your progress!</Text>
        </View>
      </View>
    );
  }

  const { currentWeek, lastWeek, comparison } = data;

  const renderComparison = (label: string, current: number, last: number, percentage: number, lowerIsBetter = false) => {
    const isImprovement = lowerIsBetter ? percentage < 0 : percentage > 0;
    const color = isImprovement ? '#10B981' : percentage === 0 ? '#64748B' : '#EF4444';
    const Icon = isImprovement ? TrendingUp : TrendingDown;
    const arrow = percentage > 0 ? '↑' : percentage < 0 ? '↓' : '→';

    return (
      <View style={styles.comparisonRow}>
        <Text style={styles.comparisonLabel}>{label}</Text>
        <View style={styles.comparisonValues}>
          <Text style={styles.lastValue}>{last}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.currentValue}>{current}</Text>
          <View style={[styles.percentageBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.percentageText, { color }]}>
              {arrow} {Math.abs(percentage)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}>
        <Text style={styles.headerTitle}>📊 This Week vs Last Week</Text>
        <Text style={styles.headerSubtitle}>Your progress comparison</Text>
      </LinearGradient>

      <View style={styles.content}>
        {renderComparison(
          'Drinks',
          currentWeek.totalDrinks,
          lastWeek.totalDrinks,
          comparison.drinks,
          true // lower is better
        )}

        {renderComparison(
          'Sober Days',
          currentWeek.soberDays,
          lastWeek.soberDays,
          comparison.soberDays,
          false // higher is better
        )}

        {currentWeek.mostCommonMood && lastWeek.mostCommonMood && (
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Mood</Text>
            <View style={styles.comparisonValues}>
              <Text style={styles.moodEmoji}>{getMoodEmoji(lastWeek.mostCommonMood)}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.moodEmoji}>{getMoodEmoji(currentWeek.mostCommonMood)}</Text>
              {comparison.mood !== null && (
                <View
                  style={[
                    styles.percentageBadge,
                    { backgroundColor: comparison.mood > 0 ? '#10B98120' : '#EF444420' },
                  ]}>
                  <Text
                    style={[
                      styles.percentageText,
                      { color: comparison.mood > 0 ? '#10B981' : '#EF4444' },
                    ]}>
                    {comparison.mood > 0 ? '↑' : '↓'} {Math.abs(comparison.mood)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {currentWeek.totalDrinks < lastWeek.totalDrinks && (
          <View style={styles.encouragement}>
            <Text style={styles.encouragementText}>🎉 Great job! Keep it up!</Text>
          </View>
        )}

        {currentWeek.totalDrinks > lastWeek.totalDrinks && (
          <View style={[styles.encouragement, styles.encouragementWarning]}>
            <Text style={styles.encouragementText}>💪 You can do better this week!</Text>
          </View>
        )}
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
  comparisonRow: {
    marginBottom: 16,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  comparisonValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
  },
  arrow: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  currentValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moodEmoji: {
    fontSize: 24,
  },
  encouragement: {
    backgroundColor: '#10B98110',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  encouragementWarning: {
    backgroundColor: '#F59E0B10',
  },
  encouragementText: {
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
