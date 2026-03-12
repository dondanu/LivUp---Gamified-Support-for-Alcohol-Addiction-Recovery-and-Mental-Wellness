import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { DrinkLog, MoodLog, TriggerLog, UserBadge } from '@/types/database.types';
import { TrendingUp, Award, Calendar, Sparkles, AlertTriangle, Plus, Minus, Save, X } from 'lucide-react-native';
import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_SHOWN_KEY = '@intro_shown';
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
  data: { x: string; y: number; fullDate?: string }[];
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
    const res: { x: string; y: number; fullDate?: string }[] = [];
    for (let i = 0; i < windowData.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = i - (window - 1); j <= i; j++) {
        if (j >= 0 && j < windowData.length) {
          sum += windowData[j].y;
          count++;
        }
      }
      res.push({ 
        x: windowData[i].x, 
        y: count ? sum / count : 0,
        fullDate: windowData[i].fullDate 
      });
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
      // Use fullDate for tooltip, x (day number) for X-axis label
      return { xPos, yPos, val: item.y, label: item.x, tooltipLabel: item.fullDate || item.x };
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
    // Use tooltipLabel (full date) for tooltip, but label (day number) for X-axis
    setLineTooltip({ label: nearest.tooltipLabel || nearest.label, value: nearest.val, x: nearest.xPos, y: nearest.yPos });
  };

  // Label every ~8–10 slots; always show first/last
  // Adjust based on chart width to prevent crowding
  const maxLabels = Math.floor(chartWidth / 35); // ~35px per label (28px width + 7px spacing)
  const labelStep = Math.max(1, Math.round(points.length / Math.min(maxLabels, 10)));

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
      <View style={[styles.labelsRow, styles.lineLabelsRow]}>
        {(() => {
          // First, collect all labels that should be shown
          const labelsToShow: Array<{ index: number; xPos: number; label: string }> = [];
          points.forEach((pt, index) => {
            const showLabel =
              points.length <= 10 ||
              index === 0 ||
              index === points.length - 1 ||
              index % labelStep === 0;
            if (showLabel) {
              labelsToShow.push({ index, xPos: pt.xPos, label: pt.label });
            }
          });

          // Calculate positions with proper spacing (build iteratively)
          const labelWidth = 28;
          const minSpacing = 4; // minimum space between labels
          const leftBound = 8; // Account for margin
          // Very conservative rightBound to ensure labels stay within visible area
          // chartWidth is width - 64, labelsRow has marginHorizontal: -8
          // So effective width is chartWidth + 16, but we need to account for container constraints
          // Use a very conservative margin to ensure no overflow
          const rightBound = chartWidth - labelWidth - 20; // Very conservative to prevent any overflow
          const positionedLabels: Array<{ index: number; xPos: number; label: string; left: number }> = [];
          
          // Filter out labels that are too close to the right edge before positioning
          const validLabels = labelsToShow.filter((item, idx) => {
            // Always keep first and last labels
            if (idx === 0 || idx === labelsToShow.length - 1) return true;
            // For middle labels, check if they fit with proper margin
            const idealLeft = item.xPos - labelWidth / 2;
            return idealLeft + labelWidth <= rightBound;
          });
          
          validLabels.forEach((item, idx) => {
            // Start with ideal centered position
            let labelLeft = item.xPos - labelWidth / 2;
            
            // Prevent overlap with previous label
            if (idx > 0) {
              const prevLeft = positionedLabels[idx - 1].left;
              const prevRight = prevLeft + labelWidth;
              if (labelLeft < prevRight + minSpacing) {
                labelLeft = prevRight + minSpacing;
              }
            }
            
            // Ensure left boundary
            labelLeft = Math.max(leftBound, labelLeft);
            
            // Critical: Ensure right boundary - clamp ALL labels to stay within bounds
            // For the last label, be extra conservative
            if (idx === validLabels.length - 1) {
              // Last label: ensure it's fully within bounds
              if (labelLeft + labelWidth > rightBound) {
                labelLeft = rightBound - labelWidth;
              }
              // Double-check: ensure it doesn't go below leftBound
              labelLeft = Math.max(leftBound, labelLeft);
            } else {
              // For other labels, clamp to rightBound
              if (labelLeft + labelWidth > rightBound) {
                labelLeft = rightBound - labelWidth;
              }
            }
            
            // Final safety check: skip middle labels that still don't fit
            if (idx > 0 && idx < validLabels.length - 1) {
              if (labelLeft + labelWidth > rightBound) {
                // Skip this label if it doesn't fit
                return;
              }
            }
            
            positionedLabels.push({ ...item, left: labelLeft });
          });

          return positionedLabels.map((item) => (
            <View
              key={`label-${item.index}`}
              style={[
                styles.lineLabelContainer,
                {
                  left: item.left,
                  width: labelWidth,
                },
              ]}>
              <Text style={styles.barLabel} numberOfLines={1} ellipsizeMode="tail">
                {item.label}
              </Text>
            </View>
          ));
        })()}
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const { profile, isAnonymous, anonymousData, signOut, setPendingNavigation } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [drinkData, setDrinkData] = useState<{ x: string; y: number; fullDate?: string }[]>([]);
  const [triggerCounts, setTriggerCounts] = useState<{ [key: string]: number }>({});
  const [totalBadges, setTotalBadges] = useState(0);
  const [soberDays, setSoberDays] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [xAxisLabel, setXAxisLabel] = useState('Date');
  const [lineMode, setLineMode] = useState<'daily' | 'avg7'>('daily');
  const [lineTooltip, setLineTooltip] = useState<{ label: string; value: number; x: number; y: number } | null>(null);
  // For 90‑day chart: which 9‑day window is visible (0–9)
  const [ninetyDayPage, setNinetyDayPage] = useState(0);

  // Insights state
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Track History state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Tracking states (moved from track tab)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [drinksCount, setDrinksCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState('');
  const [moodNotes, setMoodNotes] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [triggerDescription, setTriggerDescription] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showCravingModal, setShowCravingModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);

  const moods = [
    { value: 'happy', label: 'Happy', icon: '😊', color: '#4ECDC4' },
    { value: 'sad', label: 'Sad', icon: '😢', color: '#95A5A6' },
    { value: 'stressed', label: 'Stressed', icon: '😰', color: '#E74C3C' },
    { value: 'anxious', label: 'Anxious', icon: '😟', color: '#F39C12' },
    { value: 'calm', label: 'Calm', icon: '😌', color: '#3498DB' },
    { value: 'energetic', label: 'Energetic', icon: '🤩', color: '#9B59B6' },
  ];

  const triggers = [
    { value: 'stress', label: 'Stress', color: '#E74C3C' },
    { value: 'social', label: 'Social Event', color: '#3498DB' },
    { value: 'boredom', label: 'Boredom', color: '#95A5A6' },
    { value: 'party', label: 'Party/Celebration', color: '#F39C12' },
    { value: 'anxiety', label: 'Anxiety', color: '#9B59B6' },
    { value: 'other', label: 'Other', color: '#34495E' },
  ];

  const handleCreateAccount = async () => {
    // Set pending navigation to Register
    setPendingNavigation('Register');
    // Mark intro as shown
    await AsyncStorage.setItem(INTRO_SHOWN_KEY, 'true');
    // Sign out to trigger navigation
    await signOut();
  };

  useEffect(() => {
    loadProgressData();
    loadDayData();
    loadInsights();
  }, [profile, isAnonymous, anonymousData, selectedPeriod, selectedDate]);

  const loadInsights = async () => {
    if (!profile?.id || isAnonymous) return;

    setInsightsLoading(true);
    try {
      const response = await api.getSmartInsights();
      setInsights(response.insights);
    } catch (error) {
      console.error('Error loading insights:', error);
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  };

  const loadTrackHistory = async () => {
    if (!profile?.id || isAnonymous) return;

    setHistoryLoading(true);
    try {
      // Get all logs
      const [drinkLogsResponse, moodLogsResponse, triggerLogsResponse] = await Promise.all([
        api.getDrinkLogs(),
        api.getMoodLogs(),
        api.getTriggerLogs(),
      ]);

      // Get user registration date
      const registrationDate = profile?.created_at ? new Date(profile.created_at) : new Date();
      registrationDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create a map for each log type
      const drinkMap = new Map();
      const moodMap = new Map();
      const triggerMap = new Map();

      drinkLogsResponse.logs?.forEach((log: any) => {
        const logDate = log.log_date || log.date;
        if (!logDate) return;
        // Convert to local date string (YYYY-MM-DD)
        const logDateObj = new Date(logDate);
        const localDateStr = `${logDateObj.getFullYear()}-${String(logDateObj.getMonth() + 1).padStart(2, '0')}-${String(logDateObj.getDate()).padStart(2, '0')}`;
        drinkMap.set(localDateStr, log);
      });

      moodLogsResponse.logs?.forEach((log: any) => {
        const logDate = log.log_date || log.date;
        if (!logDate) return;
        // Convert to local date string (YYYY-MM-DD)
        const logDateObj = new Date(logDate);
        const localDateStr = `${logDateObj.getFullYear()}-${String(logDateObj.getMonth() + 1).padStart(2, '0')}-${String(logDateObj.getDate()).padStart(2, '0')}`;
        moodMap.set(localDateStr, log);
      });

      triggerLogsResponse.logs?.forEach((log: any) => {
        const logDate = log.log_date || log.date;
        if (!logDate) return;
        // Convert to local date string (YYYY-MM-DD)
        const logDateObj = new Date(logDate);
        const localDateStr = `${logDateObj.getFullYear()}-${String(logDateObj.getMonth() + 1).padStart(2, '0')}-${String(logDateObj.getDate()).padStart(2, '0')}`;
        triggerMap.set(localDateStr, log);
      });

      // Build history array from registration to today
      const history = [];
      const currentDate = new Date(today);
      
      while (currentDate >= registrationDate) {
        // Use local date string for lookup
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const drinkLog = drinkMap.get(dateKey);
        const moodLog = moodMap.get(dateKey);
        const triggerLog = triggerMap.get(dateKey);

        history.push({
          date: dateKey,
          displayDate: currentDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          drinkCount: drinkLog ? (drinkLog.drink_count ?? drinkLog.drinks_count ?? 'Not entered') : 'Not entered',
          mood: moodLog ? (moodLog.mood_type || moodLog.mood || 'Not entered') : 'Not entered',
          trigger: triggerLog ? (triggerLog.trigger_type || 'Not entered') : 'Not entered',
        });

        currentDate.setDate(currentDate.getDate() - 1);
      }

      setHistoryData(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error loading track history:', error);
      Alert.alert('Error', 'Failed to load track history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadDayData = async () => {
    if (!profile?.id || isAnonymous) return;

    try {
      console.log('[LoadDayData] Selected Date:', selectedDate);
      
      const drinkLogsResponse = await api.getDrinkLogs();
      console.log('[LoadDayData] Drink Logs Response:', drinkLogsResponse);
      
      const drinkLog = drinkLogsResponse.logs?.find((log: any) => {
        const logDate = log.log_date || log.date;
        if (!logDate) return false;
        // Convert log date to local date string (YYYY-MM-DD) to match selectedDate
        const logDateObj = new Date(logDate);
        const localDateStr = `${logDateObj.getFullYear()}-${String(logDateObj.getMonth() + 1).padStart(2, '0')}-${String(logDateObj.getDate()).padStart(2, '0')}`;
        console.log('[LoadDayData] Comparing:', { logDate, localDateStr, selectedDate, match: localDateStr === selectedDate });
        return localDateStr === selectedDate;
      });

      console.log('[LoadDayData] Found Drink Log:', drinkLog);

      if (drinkLog) {
        setDrinksCount(drinkLog.drink_count || drinkLog.drinks_count || 0);
        setNotes(drinkLog.notes || '');
      } else {
        setDrinksCount(0);
        setNotes('');
      }

      const moodLogsResponse = await api.getMoodLogs();
      console.log('[LoadDayData] Mood Logs Response:', moodLogsResponse);
      
      const moodLog = moodLogsResponse.logs?.find((log: any) => {
        const logDate = log.log_date || log.date;
        if (!logDate) return false;
        // Convert log date to local date string (YYYY-MM-DD) to match selectedDate
        const logDateObj = new Date(logDate);
        const localDateStr = `${logDateObj.getFullYear()}-${String(logDateObj.getMonth() + 1).padStart(2, '0')}-${String(logDateObj.getDate()).padStart(2, '0')}`;
        return localDateStr === selectedDate;
      });

      console.log('[LoadDayData] Found Mood Log:', moodLog);

      if (moodLog) {
        setMood(moodLog.mood_type || moodLog.mood);
        setMoodNotes(moodLog.notes || '');
      } else {
        setMood('');
        setMoodNotes('');
      }
    } catch (error) {
      console.error('Error loading day data:', error);
    }
  };

  const saveDrinkLog = async () => {
    if (!profile?.id || isAnonymous) {
      Alert.alert('Authentication Required', 'Please create an account to track your progress.');
      return;
    }

    setTrackingLoading(true);
    try {
      await api.logDrink(drinksCount, selectedDate, notes);
      Alert.alert('Success', 'Drink log saved successfully');
      // Reload progress data to update charts
      loadProgressData();
      loadInsights(); // Reload insights after saving
    } catch (error: any) {
      console.error('Error saving drink log:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save drink log';
      Alert.alert('Error', errorMessage);
    } finally {
      setTrackingLoading(false);
    }
  };

  const saveMoodLog = async (selectedMood: string) => {
    if (!profile?.id || isAnonymous) {
      Alert.alert('Authentication Required', 'Please create an account to track your mood.');
      return;
    }

    try {
      await api.logMood(selectedMood, selectedDate, moodNotes);
      setMood(selectedMood);
      setShowMoodModal(false);
      Alert.alert('Success', 'Mood logged successfully');
    } catch (error: any) {
      console.error('Error saving mood log:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save mood log';
      Alert.alert('Error', errorMessage);
    }
  };

  const saveTriggerLog = async () => {
    if (!profile?.id || isAnonymous) {
      Alert.alert('Authentication Required', 'Please create an account to track triggers.');
      return;
    }

    if (!triggerType) {
      Alert.alert('Missing Information', 'Please select a trigger type.');
      return;
    }

    try {
      await api.logTrigger(triggerType, triggerDescription, selectedDate);
      setTriggerType('');
      setTriggerDescription('');
      setShowTriggerModal(false);
      Alert.alert('Success', 'Trigger logged successfully');
      // Reload progress data to update trigger analysis
      loadProgressData();
      loadInsights(); // Reload insights after saving
    } catch (error: any) {
      console.error('Error saving trigger log:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save trigger log';
      Alert.alert('Error', errorMessage);
      setShowTriggerModal(false);
    }
  };

  const loadProgressData = async () => {
    // In anonymous mode, show anonymous data
    if (isAnonymous && anonymousData) {
      setLoading(true);
      try {
        // Set basic stats from anonymous data
        setSoberDays(0); // Anonymous users don't track sober days yet
        setTotalBadges(0); // Anonymous users don't have badges yet
        setTriggerCounts({}); // Anonymous users don't track triggers yet
        setDrinkData([]); // Anonymous users don't track drinks yet
        
        // You can add more anonymous-specific data here if needed
      } catch (error) {
        console.error('Error loading anonymous progress data:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // For registered users, continue with API calls
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
          const allDays: { x: string; y: number; fullDate?: string }[] = [];
          const currentDate = new Date(startDate);
          currentDate.setHours(0, 0, 0, 0);
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);

          while (currentDate <= endDateObj) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const drinkCount = drinkLogsMap.get(dateKey) || 0;
            allDays.push({
              x: currentDate.getDate().toString(), // show day number only for X-axis
              y: drinkCount,
              fullDate: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // full date for tooltip
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

  // Show message for anonymous users
  if (isAnonymous) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>Track your recovery journey</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                <TrendingUp size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>{anonymousData?.completedTasks?.length || 0}</Text>
                <Text style={styles.statLabel}>Tasks Completed</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient colors={['#F093FB', '#F5576C']} style={styles.statGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                <Award size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>{anonymousData?.totalPoints || 0}</Text>
                <Text style={styles.statLabel}>Points Earned</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.card}>
            <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.milestoneGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Sparkles size={32} color="#FFFFFF" />
              <Text style={styles.milestoneTitle}>Anonymous Mode</Text>
              <Text style={styles.milestoneText}>
                You're currently in anonymous mode. Create an account to unlock full progress tracking, including drink logs, trigger analysis, badges, and more!
              </Text>
            </LinearGradient>
          </View>

          {/* Your Anonymous Journey Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Anonymous Journey</Text>
            <View style={styles.journeyStats}>
              <View style={styles.journeyStat}>
                <Calendar size={24} color="#667EEA" />
                <Text style={styles.journeyStatValue}>
                  {anonymousData?.startDate 
                    ? Math.floor((Date.now() - new Date(anonymousData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                    : 1}
                </Text>
                <Text style={styles.journeyStatLabel}>Days Active</Text>
              </View>
              <View style={styles.journeyStat}>
                <TrendingUp size={24} color="#4ECDC4" />
                <Text style={styles.journeyStatValue}>{anonymousData?.completedTasks?.length || 0}</Text>
                <Text style={styles.journeyStatLabel}>Tasks Done</Text>
              </View>
              <View style={styles.journeyStat}>
                <Award size={24} color="#F093FB" />
                <Text style={styles.journeyStatValue}>{anonymousData?.totalPoints || 0}</Text>
                <Text style={styles.journeyStatLabel}>Points</Text>
              </View>
            </View>

            {/* Locked Badges Preview */}
            <View style={styles.lockedBadgesSection}>
              <Text style={styles.lockedBadgesTitle}>🔒 Unlock Achievements</Text>
              <Text style={styles.lockedBadgesSubtitle}>Create an account to earn these badges and more!</Text>
              
              <View style={styles.lockedBadgesGrid}>
                <View style={styles.lockedBadge}>
                  <View style={styles.lockedBadgeIcon}>
                    <Text style={styles.lockedBadgeEmoji}>🏆</Text>
                  </View>
                  <Text style={styles.lockedBadgeName}>First Week</Text>
                  <Text style={styles.lockedBadgeDesc}>7 days sober</Text>
                </View>

                <View style={styles.lockedBadge}>
                  <View style={styles.lockedBadgeIcon}>
                    <Text style={styles.lockedBadgeEmoji}>🔥</Text>
                  </View>
                  <Text style={styles.lockedBadgeName}>Streak Master</Text>
                  <Text style={styles.lockedBadgeDesc}>30-day streak</Text>
                </View>

                <View style={styles.lockedBadge}>
                  <View style={styles.lockedBadgeIcon}>
                    <Text style={styles.lockedBadgeEmoji}>⭐</Text>
                  </View>
                  <Text style={styles.lockedBadgeName}>Challenge Pro</Text>
                  <Text style={styles.lockedBadgeDesc}>50 tasks done</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.unlockButton} onPress={handleCreateAccount}>
                <Text style={styles.unlockButtonText}>Create Account to Unlock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
        {/* Tracking Section - Moved from Track Tab */}
        {!isAnonymous ? (
          <View style={styles.trackingSection}>
            <View style={styles.trackingHeader}>
              <Text style={styles.trackingSectionTitle}>Daily Tracking</Text>
            </View>
            
            <View style={styles.dateSelector}>
              <View style={styles.dateLeft}>
                <Calendar size={24} color="#188fd4ff" />
                <Text style={styles.dateText}>{new Date(selectedDate).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity 
                style={styles.historyButton}
                onPress={loadTrackHistory}
                disabled={historyLoading}>
                {historyLoading ? (
                  <ActivityIndicator size="small" color="#4ECDC4" />
                ) : (
                  <Text style={styles.historyButtonText}>Track History →</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cravingButton} onPress={() => setShowCravingModal(true)}>
              <AlertTriangle size={24} color="#FFFFFF" />
              <Text style={styles.cravingButtonText}>Having a Craving?</Text>
            </TouchableOpacity>

            <View style={styles.trackingRow}>
              <View style={styles.trackingCard}>
                <Text style={styles.trackingCardTitle}>Drink Count</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setDrinksCount(Math.max(0, drinksCount - 1))}>
                    <Minus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.counterDisplay}>
                    <Text style={styles.counterValue}>{drinksCount}</Text>
                    <Text style={styles.counterLabel}>drinks</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setDrinksCount(drinksCount + 1)}>
                    <Plus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveDrinkLog}
                  disabled={trackingLoading}>
                  {trackingLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Save size={16} color="#FFFFFF" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.trackingCard}>
                <Text style={styles.trackingCardTitle}>Mood</Text>
                {mood ? (
                  <View style={styles.moodSelected}>
                    <Text style={styles.moodEmoji}>
                      {moods.find((m) => m.value === mood)?.icon}
                    </Text>
                    <Text style={styles.moodLabel}>{moods.find((m) => m.value === mood)?.label}</Text>
                  </View>
                ) : null}
                <TouchableOpacity 
                  style={styles.moodButton}
                  onPress={() => setShowMoodModal(true)}>
                  <Text style={styles.moodButtonText}>
                    {mood ? 'Update Mood' : 'Log Mood'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.trackingCard}>
              <Text style={styles.trackingCardTitle}>Trigger Tracking</Text>
              <Text style={styles.trackingCardDescription}>
                Identify what led to drinking to better understand patterns
              </Text>
              <TouchableOpacity 
                style={styles.triggerButton}
                onPress={() => setShowTriggerModal(true)}>
                <Text style={styles.triggerButtonText}>Log a Trigger</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes about today..."
              placeholderTextColor="#95A5A6"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        ) : (
          <View style={styles.trackingSection}>
            <Text style={styles.trackingSectionTitle}>Daily Tracking</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔒 Tracking Locked</Text>
              <Text style={styles.cardDescription}>
                Create an account to unlock daily tracking features including drink counting, mood logging, and trigger analysis.
              </Text>
              <TouchableOpacity style={styles.unlockButton} onPress={handleCreateAccount}>
                <Text style={styles.unlockButtonText}>Create Account to Track</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Smart Insights Section */}
        {!isAnonymous && (
          <View style={styles.insightsSection}>
            {insightsLoading ? (
              <View style={styles.insightsCard}>
                <ActivityIndicator size="large" color="#4ECDC4" />
                <Text style={styles.insightsLoadingText}>Analyzing your progress...</Text>
              </View>
            ) : insights ? (
              <View style={[
                styles.insightsCard,
                insights.type === 'excellent' && styles.insightsExcellent,
                insights.type === 'good' && styles.insightsGood,
                insights.type === 'warning' && styles.insightsWarning,
                insights.type === 'moderate' && styles.insightsModerate,
              ]}>
                <Text style={styles.insightsTitle}>{insights.title}</Text>
                <Text style={styles.insightsMessage}>{insights.message}</Text>
                
                {insights.tips && insights.tips.length > 0 && (
                  <View style={styles.insightsTips}>
                    <Text style={styles.insightsTipsTitle}>💡 Tips:</Text>
                    {insights.tips.map((tip, index) => (
                      <Text key={index} style={styles.insightsTip}>• {tip}</Text>
                    ))}
                  </View>
                )}

                {insights.stats && (
                  <View style={styles.insightsStats}>
                    <View style={styles.insightsStat}>
                      <Text style={styles.insightsStatValue}>{insights.stats.alcoholFreeDays}</Text>
                      <Text style={styles.insightsStatLabel}>Alcohol-free days</Text>
                    </View>
                    {insights.stats.commonMood && (
                      <View style={styles.insightsStat}>
                        <Text style={styles.insightsStatValue}>
                          {insights.stats.commonMood === 'happy' ? '😊' : 
                           insights.stats.commonMood === 'sad' ? '😢' :
                           insights.stats.commonMood === 'stressed' ? '😰' :
                           insights.stats.commonMood === 'anxious' ? '😟' :
                           insights.stats.commonMood === 'calm' ? '😌' : '🤩'}
                        </Text>
                        <Text style={styles.insightsStatLabel}>Common mood</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ) : null}
          </View>
        )}

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

      {/* Modals - Moved from Track Tab */}
      <Modal visible={showCravingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Craving Help</Text>
              <TouchableOpacity onPress={() => setShowCravingModal(false)}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalText}>
              Take a deep breath. You're stronger than this craving.
            </Text>

            <View style={styles.helpTips}>
              <Text style={styles.tipTitle}>Quick Tips:</Text>
              <Text style={styles.tip}>• Drink a glass of water</Text>
              <Text style={styles.tip}>• Take a 5-minute walk</Text>
              <Text style={styles.tip}>• Call a friend or support person</Text>
              <Text style={styles.tip}>• Practice deep breathing</Text>
              <Text style={styles.tip}>• Engage in a hobby or activity</Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCravingModal(false)}>
              <Text style={styles.modalButtonText}>I've Got This</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showMoodModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How are you feeling?</Text>
              <TouchableOpacity onPress={() => setShowMoodModal(false)}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <View style={styles.moodGrid}>
              {moods.map((moodOption) => (
                <TouchableOpacity
                  key={moodOption.value}
                  style={[styles.moodOption, { backgroundColor: moodOption.color }]}
                  onPress={() => saveMoodLog(moodOption.value)}>
                  <Text style={styles.moodOptionEmoji}>{moodOption.icon}</Text>
                  <Text style={styles.moodOptionLabel}>{moodOption.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showTriggerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log a Trigger</Text>
              <TouchableOpacity onPress={() => setShowTriggerModal(false)}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>What triggered you?</Text>
            <View style={styles.triggerGrid}>
              {triggers.map((trigger) => (
                <TouchableOpacity
                  key={trigger.value}
                  style={[
                    styles.triggerOption,
                    { backgroundColor: trigger.color },
                    triggerType === trigger.value && styles.triggerOptionSelected,
                  ]}
                  onPress={() => setTriggerType(trigger.value)}>
                  <Text style={styles.triggerOptionLabel}>{trigger.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Describe the situation..."
              placeholderTextColor="#95A5A6"
              value={triggerDescription}
              onChangeText={setTriggerDescription}
              multiline
            />

            <TouchableOpacity style={styles.modalButton} onPress={saveTriggerLog}>
              <Text style={styles.modalButtonText}>Save Trigger</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Track History Modal */}
      <Modal visible={showHistoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.historyModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Track History</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList}>
              {historyData.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyDate}>{item.displayDate}</Text>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyText}>
                      🍺 {item.drinkCount === 'Not entered' ? 'Not entered' : `${item.drinkCount} drink${item.drinkCount !== 1 ? 's' : ''}`}
                    </Text>
                    <Text style={styles.historySeparator}>|</Text>
                    <Text style={styles.historyText}>
                      {item.mood === 'Not entered' ? 'Not entered' : 
                       item.mood === 'happy' ? '😊 Happy' :
                       item.mood === 'sad' ? '😢 Sad' :
                       item.mood === 'stressed' ? '😰 Stressed' :
                       item.mood === 'anxious' ? '😟 Anxious' :
                       item.mood === 'calm' ? '😌 Calm' :
                       item.mood === 'energetic' ? '🤩 Energetic' : item.mood}
                    </Text>
                    <Text style={styles.historySeparator}>|</Text>
                    <Text style={styles.historyText}>
                      {item.trigger === 'Not entered' ? 'Not entered' : 
                       `🎯 ${item.trigger.charAt(0).toUpperCase() + item.trigger.slice(1)}`}
                    </Text>
                  </View>
                </View>
              ))}
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
  lineLabelsRow: {
    position: 'relative',
    height: 30,
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    marginHorizontal: -8, // Match lineChartArea margin to align widths
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
  lineLabelContainer: {
    position: 'absolute',
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
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
  journeyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  journeyStat: {
    alignItems: 'center',
  },
  journeyStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  journeyStatLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  lockedBadgesSection: {
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  lockedBadgesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  lockedBadgesSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  lockedBadgesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  lockedBadge: {
    alignItems: 'center',
    width: 100,
  },
  lockedBadgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  lockedBadgeEmoji: {
    fontSize: 32,
    opacity: 0.3,
  },
  lockedBadgeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 2,
  },
  lockedBadgeDesc: {
    fontSize: 11,
    color: '#95A5A6',
    textAlign: 'center',
  },
  unlockButton: {
    backgroundColor: '#667EEA',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Tracking Section Styles (moved from track tab)
  trackingSection: {
    marginBottom: 24,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackingSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  historyButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1eeeeff',
    borderRadius: 8,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 12,
  },
  cravingButton: {
    backgroundColor: '#E74C3C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cravingButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  trackingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trackingCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  trackingCardDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 12,
    textAlign: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    backgroundColor: '#4ECDC4',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  counterDisplay: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  counterLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  moodButton: {
    backgroundColor: '#667EEA',
    //padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    marginTop: 1,
    //borderRadius: 8,
    alignItems: 'center',
  },
  moodButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  triggerButton: {
    backgroundColor: '#667EEA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  triggerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 60,
    textAlignVertical: 'top',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    marginTop: 12.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  moodSelected: {
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  // Modal Styles (moved from track tab)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalText: {
    fontSize: 18,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 24,
  },
  helpTips: {
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 8,
  },
  modalButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  moodOptionEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  moodOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  triggerOption: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  triggerOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  triggerOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  // Insights Section Styles
  insightsSection: {
    marginBottom: 24,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  insightsExcellent: {
    borderLeftColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  insightsGood: {
    borderLeftColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  insightsWarning: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  insightsModerate: {
    borderLeftColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  insightsLoadingText: {
    textAlign: 'center',
    color: '#7F8C8D',
    marginTop: 12,
    fontSize: 14,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  insightsMessage: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  insightsTips: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  insightsTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  insightsTip: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  insightsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  insightsStat: {
    alignItems: 'center',
  },
  insightsStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  insightsStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Track History Modal Styles
  historyModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  historyList: {
    maxHeight: 500,
  },
  historyItem: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  historyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  historyText: {
    fontSize: 14,
    color: '#4B5563',
    marginRight: 8,
  },
  historySeparator: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
  },
});
