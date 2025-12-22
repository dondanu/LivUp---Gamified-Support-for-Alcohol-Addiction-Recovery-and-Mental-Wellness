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
import { useMemo } from 'react';

const { width } = Dimensions.get('window');

function LineChart90Days({
  data,
  lineMode,
  onToggleMode,
  lineTooltip,
  setLineTooltip,
  page,
  pageSize,
  onPageChange,
}: {
  data: { x: string; y: number }[];
  lineMode: 'daily' | 'avg7';
  onToggleMode: () => void;
  lineTooltip: { label: string; value: number; x: number; y: number } | null;
  setLineTooltip: (v: { label: string; value: number; x: number; y: number } | null) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const chartHeight = 180;
  const chartWidth = width - 64;

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const startIndex = clampedPage * pageSize;
  const endIndex = startIndex + pageSize;
  const windowData = data.slice(startIndex, endIndex);

  const processedData = useMemo(() => {
    if (lineMode !== 'avg7') return windowData;
    // 7-day rolling average (includes current day and previous 6)
    const window = 7;
    const res: { x: string; y: number }[] = [];
    for (let i = 0; i < windowData.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = i - (window - 1); j <= i; j++) {
        if (j >= 0 && j < windowData.length) {
          sum += windowData[j].y;
          count++;
        }
      }
      res.push({ x: windowData[i].x, y: count ? sum / count : 0 });
    }
    return res;
  }, [windowData, lineMode]);

  const points = useMemo(() => {
    const maxValue = Math.max(...processedData.map((d) => d.y), 1);
    const stepX = processedData.length > 1 ? chartWidth / (processedData.length - 1) : 0;

    return processedData.map((item, idx) => {
      const yRatio = item.y / maxValue;
      const yPos = chartHeight - yRatio * chartHeight;
      const xPos = idx * stepX;
      return { xPos, yPos, val: item.y, label: item.x };
    });
  }, [processedData, chartHeight, chartWidth]);

  const handleTouch = (evt: any) => {
    const touchX = evt.nativeEvent.locationX;
    if (!points.length) return;
    // find nearest point by x
    let nearest = points[0];
    let minDist = Math.abs(touchX - points[0].xPos);
    for (let i = 1; i < points.length; i++) {
      const d = Math.abs(touchX - points[i].xPos);
      if (d < minDist) {
        minDist = d;
        nearest = points[i];
      }
    }
    setLineTooltip({ label: nearest.label, value: nearest.val, x: nearest.xPos, y: nearest.yPos });
  };

  // Label every ~8–10 slots; always show first/last
  const labelStep = Math.max(1, Math.round(points.length / 10));

  const lineColor = lineMode === 'daily' ? '#44A08D' : '#8CE3DA';
  const lineThickness = lineMode === 'daily' ? 2 : 3;

  return (
    <View>
      <View style={styles.lineToggleRow}>
        <TouchableOpacity style={styles.lineToggle} onPress={onToggleMode}>
          <Text style={styles.lineToggleText}>
            {lineMode === 'daily' ? 'Switch to 7-day Avg' : 'Switch to Daily'}
          </Text>
        </TouchableOpacity>
      </View>
      {/* simple page indicator */}
      <View style={styles.linePageDotsRow}>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.linePageDot,
              idx === clampedPage && styles.linePageDotActive,
            ]}
          />
        ))}
      </View>
      <View
        style={styles.lineChartArea}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handleTouch}>
        {/* Line */}
        {points.map((pt, idx) => {
          if (idx === 0) return null;
          const prev = points[idx - 1];
          const dx = pt.xPos - prev.xPos;
          const dy = pt.yPos - prev.yPos;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View
              key={`line-${idx}`}
              style={[
                styles.lineSegment,
                {
                  left: prev.xPos,
                  top: prev.yPos,
                  width: length,
                  height: lineThickness,
                  backgroundColor: lineColor,
                  transform: [{ rotateZ: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {/* Optional subtle area fill */}
        {points.map((pt, idx) => {
          if (idx === 0) return null;
          const prev = points[idx - 1];
          return (
            <View
              key={`area-${idx}`}
              style={[
                styles.lineAreaFill,
                {
                  left: prev.xPos,
                  width: pt.xPos - prev.xPos,
                  top: Math.min(prev.yPos, pt.yPos),
                  height: chartHeight - Math.min(prev.yPos, pt.yPos),
                  opacity: 0.08,
                  backgroundColor: lineColor,
                },
              ]}
            />
          );
        })}

        {/* Tooltip marker */}
        {lineTooltip && (
          <View
            style={[
              styles.linePointActive,
              { left: lineTooltip.x - 5, top: lineTooltip.y - 5 },
            ]}
          />
        )}

        {/* Tooltip */}
        {lineTooltip && (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.min(
                  Math.max(lineTooltip.x - 40, 0),
                  chartWidth - 80,
                ),
                top: Math.max(lineTooltip.y - 48, 4),
              },
            ]}>
            <Text style={styles.tooltipTitle}>{lineTooltip.label}</Text>
            <Text style={styles.tooltipValue}>{lineTooltip.value.toFixed(1)} drinks</Text>
          </View>
        )}
      </View>

      <View style={styles.xAxisLine} />
      <View style={styles.labelsRow}>
        {points.map((pt, index) => {
          const showLabel =
            points.length <= 10 ||
            index === 0 ||
            index === points.length - 1 ||
            index % labelStep === 0;
          return (
            <View key={`label-${index}`} style={[styles.labelContainer, { left: pt.xPos - 8 }]}>
              <Text style={styles.barLabel} numberOfLines={1}>
                {showLabel ? pt.label : ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [drinkData, setDrinkData] = useState<{ x: string; y: number }[]>([]);
  const [triggerCounts, setTriggerCounts] = useState<{ [key: string]: number }>({});
  const [totalBadges, setTotalBadges] = useState(0);
  const [soberDays, setSoberDays] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [xAxisLabel, setXAxisLabel] = useState('Date');
  const [lineMode, setLineMode] = useState<'daily' | 'avg7'>('daily');
  const [lineTooltip, setLineTooltip] = useState<{ label: string; value: number; x: number; y: number } | null>(null);
  // For 90‑day chart: which 9‑day window is visible (0–9)
  const [ninetyDayPage, setNinetyDayPage] = useState(0);

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
        setXAxisLabel(() => {
          const startLabel = new Date(report.period.startDate).toLocaleDateString('en-US', { month: 'short' });
          return `Date (${startLabel})`;
        });

        console.log('[Progress] Weekly report:', {
          startDate: report.period.startDate,
          endDate: report.period.endDate,
          drinkLogsCount: report.drinkLogs?.length || 0,
          drinkLogs: report.drinkLogs
        });

        // Set drink chart data - fill in all 7 days
        const startDate = new Date(report.period.startDate);
        const endDate = new Date(report.period.endDate);
        const allDays: { x: string; y: number }[] = [];
        
        // Create a map of existing drink logs by date
        const drinkLogsMap = new Map<string, number>();
        if (report.drinkLogs && report.drinkLogs.length > 0) {
          report.drinkLogs.forEach((log: any) => {
            // Handle both log_date (backend) and date (transformed) field names
            const logDate = log.log_date || log.date;
            if (!logDate) {
              console.warn('[Progress] Log missing date:', log);
              return;
            }
            
            // Normalize date to YYYY-MM-DD format
            const dateObj = new Date(logDate);
            if (isNaN(dateObj.getTime())) {
              console.warn('[Progress] Invalid date:', logDate);
              return;
            }
            
            const dateKey = dateObj.toISOString().split('T')[0];
            // Handle both drink_count (backend) and drinks_count (transformed) field names
            const drinkCount = log.drink_count !== undefined ? log.drink_count : (log.drinks_count !== undefined ? log.drinks_count : 0);
            console.log('[Progress] Mapping log:', { dateKey, drinkCount, log });
            drinkLogsMap.set(dateKey, drinkCount);
          });
        }

        // Fill in all days in the period (only from startDate to endDate)
        const currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        
        while (currentDate <= endDateObj) {
          const dateKey = currentDate.toISOString().split('T')[0];
          const drinkCount = drinkLogsMap.get(dateKey) || 0;
          allDays.push({
            x: currentDate.getDate().toString(), // show day number only
            y: drinkCount,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log('[Progress] Final chart data:', { allDaysCount: allDays.length, allDays });
        setDrinkData(allDays.length > 0 ? allDays : []);
        
        // Fallback: If no data from progress endpoint, try fetching directly
        if (allDays.length === 0 || drinkLogsMap.size === 0) {
          console.log('[Progress] No data from progress endpoint, fetching drink logs directly...');
          try {
            const directLogsResponse = await api.getDrinkLogs({
              startDate: report.period.startDate,
              endDate: report.period.endDate,
              limit: 50
            });
            
            if (directLogsResponse.logs && directLogsResponse.logs.length > 0) {
              console.log('[Progress] Direct logs fetched:', directLogsResponse.logs);
              // Rebuild the map and chart data
              const fallbackMap = new Map<string, number>();
              directLogsResponse.logs.forEach((log: any) => {
                const logDate = log.log_date || log.date;
                if (logDate) {
                  const dateObj = new Date(logDate);
                  if (!isNaN(dateObj.getTime())) {
                    const dateKey = dateObj.toISOString().split('T')[0];
                    const drinkCount = log.drink_count !== undefined ? log.drink_count : (log.drinks_count !== undefined ? log.drinks_count : 0);
                    fallbackMap.set(dateKey, drinkCount);
                  }
                }
              });
              
              // Rebuild chart data
              const fallbackDays: { x: string; y: number }[] = [];
              const fallbackStartDate = new Date(report.period.startDate);
              fallbackStartDate.setHours(0, 0, 0, 0);
              const fallbackEndDate = new Date(report.period.endDate);
              fallbackEndDate.setHours(23, 59, 59, 999);
              const fallbackCurrentDate = new Date(fallbackStartDate);
              
              while (fallbackCurrentDate <= fallbackEndDate) {
                const dateKey = fallbackCurrentDate.toISOString().split('T')[0];
                const drinkCount = fallbackMap.get(dateKey) || 0;
                fallbackDays.push({
                  x: fallbackCurrentDate.getDate().toString(), // day number
                  y: drinkCount,
                });
                fallbackCurrentDate.setDate(fallbackCurrentDate.getDate() + 1);
              }
              
              console.log('[Progress] Fallback chart data:', fallbackDays);
              setDrinkData(fallbackDays);
            }
          } catch (fallbackError) {
            console.error('[Progress] Fallback fetch error:', fallbackError);
          }
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
        setXAxisLabel(() => {
          const startLabel = new Date(report.period.startDate).toLocaleDateString('en-US', { month: 'short' });
          return `Date (${startLabel})`;
        });

        // Set drink chart data - fill in all days in the month
        const startDate = new Date(report.period.startDate);
        const endDate = new Date(report.period.endDate);
        const allDays: { x: string; y: number }[] = [];
        
        // Create a map of existing drink logs by date
        const drinkLogsMap = new Map<string, number>();
        if (report.drinkLogs && report.drinkLogs.length > 0) {
          report.drinkLogs.forEach((log: any) => {
            // Handle both log_date (backend) and date (transformed) field names
            const logDate = log.log_date || log.date;
            if (!logDate) return;
            
            // Normalize date to YYYY-MM-DD format
            const dateObj = new Date(logDate);
            if (isNaN(dateObj.getTime())) return;
            
            const dateKey = dateObj.toISOString().split('T')[0];
            // Handle both drink_count (backend) and drinks_count (transformed) field names
            const drinkCount = log.drink_count !== undefined ? log.drink_count : (log.drinks_count !== undefined ? log.drinks_count : 0);
            drinkLogsMap.set(dateKey, drinkCount);
          });
        }

        // Fill in all days in the period (limit to 30 days for chart readability)
        const currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        let dayCount = 0;
        
        while (currentDate <= endDateObj && dayCount < 30) {
          const dateKey = currentDate.toISOString().split('T')[0];
          const drinkCount = drinkLogsMap.get(dateKey) || 0;
          allDays.push({
            x: currentDate.getDate().toString(), // day number
            y: drinkCount,
          });
          currentDate.setDate(currentDate.getDate() + 1);
          dayCount++;
        }
        
        setDrinkData(allDays.length > 0 ? allDays : []);

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
        setXAxisLabel('Date');
        setLineMode('daily');
        setNinetyDayPage(0);

        // Set sober days from overall statistics
        setSoberDays(overall.statistics.soberDays || 0);

        // For 90 days chart, fetch drink logs separately and fill in missing days
        try {
          const drinkLogsResponse = await api.getDrinkLogs();
          // 90-day window: today (inclusive) back to today - 89 days,
          // but never before the user's registration date
          const endDate = new Date();
          endDate.setHours(0, 0, 0, 0);
          const rawStartDate = new Date(endDate);
          rawStartDate.setDate(rawStartDate.getDate() - 89);

          const registrationDate = profile?.created_at ? new Date(profile.created_at) : null;
          if (registrationDate) {
            registrationDate.setHours(0, 0, 0, 0);
          }

          const startDate =
            registrationDate && registrationDate > rawStartDate ? registrationDate : rawStartDate;
          
          // Create a map of existing drink logs by date
          const drinkLogsMap = new Map<string, number>();
          if (drinkLogsResponse.logs) {
            drinkLogsResponse.logs.forEach((log: any) => {
              // Handle both log_date (backend) and date (transformed) field names
              const logDateStr = log.log_date || log.date;
              if (!logDateStr) return;
              
              const logDate = new Date(logDateStr);
              if (isNaN(logDate.getTime())) return;
              
              // Normalize dates for comparison (ignore time)
              logDate.setHours(0, 0, 0, 0);
              const compareStartDate = new Date(startDate);
              compareStartDate.setHours(0, 0, 0, 0);
              const compareEndDate = new Date(endDate);
              compareEndDate.setHours(23, 59, 59, 999);
              
              if (logDate >= compareStartDate && logDate <= compareEndDate) {
                const dateKey = logDate.toISOString().split('T')[0];
                // Handle both drink_count (backend) and drinks_count (transformed) field names
                const drinkCount = log.drink_count !== undefined ? log.drink_count : (log.drinks_count !== undefined ? log.drinks_count : 0);
                drinkLogsMap.set(dateKey, drinkCount);
              }
            });
          }

          // Fill in all 90 days (no sampling) - always include today, even if 0
          const allDays: { x: string; y: number }[] = [];
          const currentDate = new Date(startDate);
          currentDate.setHours(0, 0, 0, 0);
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);

          while (currentDate <= endDateObj) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const drinkCount = drinkLogsMap.get(dateKey) || 0;
            allDays.push({
              x: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              y: drinkCount,
            });
            currentDate.setDate(currentDate.getDate() + 1);
          }

          setDrinkData(allDays);
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
               {/* Y axis: drink count */}
               <View style={styles.chartWithAxis}>
                 <View style={styles.yAxis}>
                   {(() => {
                     // Max drinks in this period, at least 1 so we always render axis
                     const maxValue = Math.max(...drinkData.map((d) => d.y), 1);
                     const maxInt = Math.ceil(maxValue);

                     // Use up to 5 ticks: max -> ... -> 0 (always include 0 at bottom)
                     const ticks: number[] = [];
                     if (maxInt <= 5) {
                       for (let i = maxInt; i >= 0; i--) ticks.push(i);
                     } else {
                       const step = Math.max(1, Math.ceil(maxInt / 4));
                       for (let v = maxInt; v >= 0; v -= step) {
                         ticks.push(v);
                       }
                       if (ticks[ticks.length - 1] !== 0) ticks.push(0);
                     }

                     return ticks.map((value, idx) => (
                       <Text
                         key={`${value}-${idx}`}
                         style={[styles.yAxisLabel, idx === ticks.length - 1 && styles.yAxisZeroLabel]}>
                         {value}
                       </Text>
                     ));
                   })()}
                   <View style={styles.yAxisTitleContainer}>
                     <Text style={styles.yAxisTitle}>Drinks</Text>
                   </View>
                 </View>

                 {/* Chart area: bars for week/month, line for 90 days */}
                 <View style={styles.barsAndLabels}>
                  {selectedPeriod === 'all' ? (
                    <LineChart90Days
                      data={drinkData}
                      lineMode={lineMode}
                      onToggleMode={() => setLineMode((m) => (m === 'daily' ? 'avg7' : 'daily'))}
                      lineTooltip={lineTooltip}
                      setLineTooltip={setLineTooltip}
                      page={ninetyDayPage}
                      pageSize={9}
                      onPageChange={setNinetyDayPage}
                    />
                   ) : (
                     <>
                       <View style={styles.chart}>
                         {drinkData.map((item, index) => {
                           const maxValue = Math.max(...drinkData.map((d) => d.y), 1);
                           const barHeight =
                             maxValue > 0
                               ? Math.max((item.y / maxValue) * 150, item.y > 0 ? 4 : 0)
                               : 0;

                           return (
                             <View key={index} style={styles.barContainer}>
                               <View style={styles.barWrapper}>
                                 <LinearGradient
                                   colors={['#4ECDC4', '#44A08D']}
                                   style={[styles.bar, { height: barHeight || 4 }]}
                                   start={{ x: 0, y: 0 }}
                                   end={{ x: 1, y: 1 }}
                                 />
                               </View>
                             </View>
                           );
                         })}
                       </View>

                       <View style={styles.xAxisLine} />

                       <View style={styles.labelsRow}>
                         {drinkData.map((item, index) => {
                           const labelStep = Math.max(1, Math.ceil(drinkData.length / 8));
                           const showLabel =
                             drinkData.length <= 10 ||
                             index === 0 ||
                             index === drinkData.length - 1 ||
                             index % labelStep === 0;

                           return (
                             <View key={`label-${index}`} style={styles.labelContainer}>
                               <Text style={styles.barLabel} numberOfLines={1}>
                                 {showLabel ? item.x : ''}
                               </Text>
                             </View>
                           );
                         })}
                       </View>
                     </>
                   )}
                 </View>
               </View>
              <Text style={styles.xAxisTitle}>{xAxisLabel}</Text>
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
    paddingHorizontal: 8,
  },
  chartWithAxis: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barsAndLabels: {
    flex: 1,
  },
  lineChartArea: {
    height: 200,
    position: 'relative',
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#44A08D',
    borderRadius: 2,
  },
  linePoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
  },
  linePointActive: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  lineAreaFill: {
    position: 'absolute',
    backgroundColor: '#4ECDC4',
  },
  yAxis: {
    width: 34,
    marginRight: 4,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    paddingTop: 6, // nudge axis start slightly downward
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingRight: 5, // space between labels and axis line
    marginBottom: 21,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  yAxisZeroLabel: {
    marginTop: 0,
    marginBottom: -1,
  },
  yAxisTitleContainer: {
    position: 'absolute',
    left: -8,
    top: '40%',
    transform: [{ rotate: '-90deg' }],
  },
  yAxisTitle: {
    fontSize: 9.5,
    color: '#2C3E50',
    fontWeight: '600',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingHorizontal: 8,
    marginHorizontal: -8, // extend x-axis line slightly beyond bars
    flex: 1,
  },
  xAxisLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: -5,
    marginTop: 8, // nudge line slightly down toward labels
  },
  xAxisTitle: {
    marginTop: 8,
    fontSize: 11,
    color: '#2C3E50',
    fontWeight: '600',
    textAlign: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  lineToggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  lineToggle: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0F4F7',
    borderRadius: 8,
  },
  lineToggleText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  linePageDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  linePageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D2D6DC',
    marginHorizontal: 2,
  },
  linePageDotActive: {
    backgroundColor: '#44A08D',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tooltipTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  tooltipValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  labelContainer: {
    flex: 1,
    alignItems: 'center',
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
