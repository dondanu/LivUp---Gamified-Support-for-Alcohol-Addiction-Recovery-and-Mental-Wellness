import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { DrinkLog, MoodLog, TriggerLog, UserBadge } from '@/types/database.types';
import { TrendingUp, Award, Calendar, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [drinkData, setDrinkData] = useState<{ x: string; y: number }[]>([]);
  const [triggerCounts, setTriggerCounts] = useState<{ [key: string]: number }>({});
  const [totalBadges, setTotalBadges] = useState(0);
  const [soberDays, setSoberDays] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadProgressData();
  }, [profile, selectedPeriod]);

  const loadProgressData = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Use backend progress endpoints based on selected period
      if (selectedPeriod === 'week') {
        const weeklyResponse = await api.getWeeklyProgress();
        const report = weeklyResponse.weeklyReport;

        // Set drink chart data
        if (report.drinkLogs && report.drinkLogs.length > 0) {
          const chartData = report.drinkLogs.map((log: any) => {
            const logDate = log.log_date || log.date;
            const drinkCount = log.drink_count !== undefined ? log.drink_count : (log.drinks_count || 0);
            return {
              x: new Date(logDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              y: drinkCount,
            };
          });
          setDrinkData(chartData);
        } else {
          setDrinkData([]);
        }

        // Set sober days from backend calculation
        setSoberDays(report.soberDays || 0);

        // Trigger counts not available in weekly report, fetch separately for now
        try {
          const triggersResponse = await api.getTriggerLogs();
          if (triggersResponse.logs) {
            const startDate = new Date(report.period.startDate);
            const triggers = triggersResponse.logs.filter((trigger: any) => {
              const triggerDate = new Date(trigger.date);
              return triggerDate >= startDate;
            });

            const counts: { [key: string]: number } = {};
            triggers.forEach((trigger: any) => {
              counts[trigger.trigger_type] = (counts[trigger.trigger_type] || 0) + 1;
            });
            setTriggerCounts(counts);
          }
        } catch (triggerError) {
          console.error('Error loading triggers:', triggerError);
          setTriggerCounts({});
        }

        // Get badges count from gamification profile
        try {
          const gamificationResponse = await api.getGamificationProfile();
          setTotalBadges(gamificationResponse?.achievements?.length || 0);
        } catch (achievementsError) {
          console.error('Error loading achievements:', achievementsError);
          setTotalBadges(0);
        }

      } else if (selectedPeriod === 'month') {
        const monthlyResponse = await api.getMonthlyProgress();
        const report = monthlyResponse.monthlyReport;

        // Set drink chart data
        if (report.drinkLogs && report.drinkLogs.length > 0) {
          const chartData = report.drinkLogs.map((log: any) => {
            const logDate = log.log_date || log.date;
            const drinkCount = log.drink_count !== undefined ? log.drink_count : (log.drinks_count || 0);
            return {
              x: new Date(logDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              y: drinkCount,
            };
          });
          setDrinkData(chartData);
        } else {
          setDrinkData([]);
        }

        // Set sober days from backend calculation
        setSoberDays(report.soberDays || 0);

        // Set trigger counts from backend (monthly report includes this)
        if (report.triggerCounts) {
          setTriggerCounts(report.triggerCounts);
        } else {
          setTriggerCounts({});
        }

        // Get badges count from gamification profile
        try {
          const gamificationResponse = await api.getGamificationProfile();
          setTotalBadges(gamificationResponse?.achievements?.length || 0);
        } catch (achievementsError) {
          console.error('Error loading achievements:', achievementsError);
          setTotalBadges(0);
        }

      } else {
        // For "all" (90 days), use overall progress + fetch drink logs for chart
        const overallResponse = await api.getOverallProgress();
        const overall = overallResponse.overallProgress;

        // Set sober days from overall statistics
        setSoberDays(overall.statistics.soberDays || 0);

        // For 90 days chart, fetch drink logs separately
        try {
          const drinkLogsResponse = await api.getDrinkLogs();
          if (drinkLogsResponse.logs) {
            const daysToFetch = 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysToFetch);

            const drinkLogs = drinkLogsResponse.logs.filter((log: any) => {
              const logDate = new Date(log.date);
              return logDate >= startDate;
            }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const chartData = drinkLogs.map((log: any) => ({
              x: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              y: log.drinks_count || 0,
            }));
            setDrinkData(chartData);
          } else {
            setDrinkData([]);
          }
        } catch (drinkError) {
          console.error('Error loading drink logs:', drinkError);
          setDrinkData([]);
        }

        // For triggers, fetch separately for 90 days
        try {
          const triggersResponse = await api.getTriggerLogs();
          if (triggersResponse.logs) {
            const daysToFetch = 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysToFetch);

            const triggers = triggersResponse.logs.filter((trigger: any) => {
              const triggerDate = new Date(trigger.date);
              return triggerDate >= startDate;
            });

            const counts: { [key: string]: number } = {};
            triggers.forEach((trigger: any) => {
              counts[trigger.trigger_type] = (counts[trigger.trigger_type] || 0) + 1;
            });
            setTriggerCounts(counts);
          }
        } catch (triggerError) {
          console.error('Error loading triggers:', triggerError);
          setTriggerCounts({});
        }

        // Set badges from overall statistics
        setTotalBadges(overall.statistics.achievementsEarned || 0);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
      // Fallback: set empty states
      setDrinkData([]);
      setTriggerCounts({});
      setTotalBadges(0);
      setSoberDays(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>Track your recovery journey</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Calendar size={32} color="#FFFFFF" />
              <Text style={styles.statValue}>{soberDays}</Text>
              <Text style={styles.statLabel}>Sober Days</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <TrendingUp size={32} color="#FFFFFF" />
              <Text style={styles.statValue}>{profile?.current_streak || 0}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#F093FB', '#F5576C']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Award size={32} color="#FFFFFF" />
              <Text style={styles.statValue}>{totalBadges}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Drink Tracking</Text>

          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('week')}>
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'week' && styles.periodButtonTextActive,
                ]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'month' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('month')}>
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'month' && styles.periodButtonTextActive,
                ]}>
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === 'all' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('all')}>
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'all' && styles.periodButtonTextActive,
                ]}>
                90 Days
              </Text>
            </TouchableOpacity>
          </View>

          {drinkData.length > 0 ? (
            <View style={styles.chartContainer}>
              <View style={styles.chart}>
                {drinkData.map((item, index) => {
                  const maxValue = Math.max(...drinkData.map((d) => d.y), 1);
                  const barHeight = (item.y / maxValue) * 150;

                  return (
                    <View key={index} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        <LinearGradient
                          colors={['#4ECDC4', '#44A08D']}
                          style={[styles.bar, { height: barHeight || 4 }]}
                          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                        />
                      </View>
                      <Text style={styles.barLabel} numberOfLines={1}>
                        {item.x}
                      </Text>
                      <Text style={styles.barValue}>{item.y}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>No drink data available for this period</Text>
          )}
        </View>

        {Object.keys(triggerCounts).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trigger Analysis</Text>
            <Text style={styles.cardDescription}>Understanding what triggers you most</Text>

            <View style={styles.triggerList}>
              {Object.entries(triggerCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([trigger, count]) => (
                  <View key={trigger} style={styles.triggerItem}>
                    <View style={styles.triggerInfo}>
                      <Text style={styles.triggerName}>
                        {trigger.charAt(0).toUpperCase() + trigger.slice(1)}
                      </Text>
                      <Text style={styles.triggerCount}>{count} times</Text>
                    </View>
                    <View style={styles.triggerBar}>
                      <View
                        style={[
                          styles.triggerBarFill,
                          {
                            width: `${(count / Math.max(...Object.values(triggerCounts))) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.milestoneGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <Sparkles size={32} color="#FFFFFF" />
            <Text style={styles.milestoneTitle}>Keep Going!</Text>
            <Text style={styles.milestoneText}>
              You've made incredible progress on your recovery journey. Every day sober is a
              victory worth celebrating.
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Level Progress</Text>
          <View style={styles.levelInfo}>
            <Text style={styles.levelCurrent}>{profile?.level || 'Beginner'}</Text>
            <Text style={styles.levelPoints}>{profile?.total_points || 0} points</Text>
          </View>
          <View style={styles.levelBar}>
            <View
              style={[
                styles.levelBarFill,
                { width: `${Math.min(((profile?.total_points || 0) % 1000) / 10, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.levelHint}>
            Next milestone at {Math.ceil((profile?.total_points || 0) / 1000) * 1000} points
          </Text>
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
    marginBottom: 16,
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
  card: {
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
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  noDataText: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 14,
    paddingVertical: 32,
  },
  chartContainer: {
    paddingVertical: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingHorizontal: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barWrapper: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 8,
    textAlign: 'center',
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 4,
  },
  triggerList: {
    marginTop: 8,
  },
  triggerItem: {
    marginBottom: 16,
  },
  triggerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  triggerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  triggerCount: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  triggerBar: {
    height: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  triggerBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  milestoneGradient: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  milestoneTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  milestoneText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  levelInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelCurrent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  levelPoints: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 4,
  },
  levelBar: {
    height: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 6,
  },
  levelHint: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});
