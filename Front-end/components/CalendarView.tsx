import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { CalendarDay } from '@/src/api/progress';

const { width } = Dimensions.get('window');

interface CalendarViewProps {
  data: CalendarDay[];
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  loading?: boolean;
  registrationMonth?: string | null; // YYYY-MM
  registrationDate?: string | null; // YYYY-MM-DD
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MOOD_EMOJIS: { [key: string]: string } = {
  happy: '😊',
  sad: '😢',
  stressed: '😰',
  anxious: '😟',
  calm: '😌',
  energetic: '🤩',
};

export default function CalendarView({ 
  data, 
  currentMonth, 
  onMonthChange, 
  loading,
  registrationMonth,
  registrationDate 
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<CalendarDay | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [calendarDays, setCalendarDays] = useState<(CalendarDay | null)[]>([]);

  useEffect(() => {
    generateCalendarDays();
  }, [data, currentMonth]);

  const generateCalendarDays = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    // Create a map of data by date for quick lookup
    const dataMap = new Map<string, CalendarDay>();
    data.forEach((day) => {
      dataMap.set(day.date, day);
    });

    // Generate calendar grid
    const days: (CalendarDay | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = dataMap.get(dateStr);
      
      if (dayData) {
        days.push(dayData);
      } else {
        // Create empty day data for days without logs
        days.push({
          date: dateStr,
          drinkCount: null,
          mood: null,
          moodNotes: null,
          triggers: [],
          notes: null,
          achievements: [],
          isSober: null,
        });
      }
    }

    setCalendarDays(days);
  };

  const handlePreviousMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    
    // Don't allow going before registration month
    if (registrationMonth && prevMonthStr < registrationMonth) {
      return;
    }
    
    onMonthChange(prevMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth() + 1;
    const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

    // Don't allow going beyond current month
    if (currentMonth >= currentMonthStr) {
      return;
    }

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    onMonthChange(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  const handleDateClick = (day: CalendarDay | null) => {
    if (!day) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);

    // Don't allow clicking future dates
    if (dayDate > today) return;
    
    // Don't allow clicking dates before registration
    if (registrationDate) {
      const regDate = new Date(registrationDate);
      regDate.setHours(0, 0, 0, 0);
      if (dayDate < regDate) return;
    }

    setSelectedDate(day);
    setShowDetailModal(true);
  };

  const getMonthName = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDayIndicator = (day: CalendarDay | null) => {
    if (!day) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);

    // Before registration date - show as disabled
    if (registrationDate) {
      const regDate = new Date(registrationDate);
      regDate.setHours(0, 0, 0, 0);
      if (dayDate < regDate) {
        return { color: '#F5F5F5', border: false, disabled: true };
      }
    }

    // Future date
    if (dayDate > today) {
      return { color: '#E0E0E0', border: false, disabled: true };
    }

    // Has achievement
    if (day.achievements && day.achievements.length > 0) {
      return { color: day.isSober ? '#10B981' : '#EF4444', border: true, borderColor: '#FFD700', disabled: false };
    }

    // Sober day
    if (day.isSober === true) {
      return { color: '#10B981', border: false, disabled: false };
    }

    // Drink day
    if (day.drinkCount !== null && day.drinkCount > 0) {
      return { color: '#EF4444', border: false, disabled: false };
    }

    // No data
    return { color: '#E0E0E0', border: false, disabled: false };
  };

  const isCurrentMonth = () => {
    const today = new Date();
    const [year, month] = currentMonth.split('-').map(Number);
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth() + 1;
    const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
    return currentMonth >= currentMonthStr;
  };

  const isRegistrationMonth = () => {
    if (!registrationMonth) return false;
    return currentMonth <= registrationMonth;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Calendar size={24} color="#667EEA" />
          <Text style={styles.headerTitle}>Your Journey Calendar</Text>
        </View>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity 
          onPress={handlePreviousMonth} 
          style={[styles.navButton, isRegistrationMonth() && styles.navButtonDisabled]}
          disabled={isRegistrationMonth()}>
          <ChevronLeft size={24} color={isRegistrationMonth() ? '#BDC3C7' : '#2C3E50'} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{getMonthName()}</Text>
        <TouchableOpacity 
          onPress={handleNextMonth} 
          style={[styles.navButton, isCurrentMonth() && styles.navButtonDisabled]}
          disabled={isCurrentMonth()}>
          <ChevronRight size={24} color={isCurrentMonth() ? '#BDC3C7' : '#2C3E50'} />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Sober</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Drinks</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFD700' }]} />
          <Text style={styles.legendText}>Achievement</Text>
        </View>
      </View>

      {/* Calendar Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
        </View>
      ) : (
        <>
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {DAYS_OF_WEEK.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const indicator = getDayIndicator(day);
              const dayNum = day ? new Date(day.date).getDate() : null;
              const isToday = day && day.date === new Date().toISOString().split('T')[0];
              const isFuture = day && new Date(day.date) > new Date();
              const isBeforeRegistration = day && registrationDate && new Date(day.date) < new Date(registrationDate);
              const isDisabled = indicator?.disabled || isFuture || isBeforeRegistration;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell,
                  ]}
                  onPress={() => handleDateClick(day)}
                  disabled={!day || isDisabled}>
                  {day && dayNum && (
                    <View style={styles.dayCellContent}>
                      {/* Mood emoji in top right corner */}
                      {day.mood && !isDisabled && (
                        <View style={styles.moodEmojiCorner}>
                          <Text style={styles.moodEmoji}>{MOOD_EMOJIS[day.mood] || '😐'}</Text>
                        </View>
                      )}
                      
                      {/* Day indicator circle */}
                      <View
                        style={[
                          styles.dayIndicator,
                          { backgroundColor: indicator?.color || '#E0E0E0' },
                          indicator?.border && {
                            borderWidth: 2,
                            borderColor: indicator.borderColor,
                          },
                          isDisabled && styles.disabledDayIndicator,
                        ]}>
                        <Text style={[
                          styles.dayNumber, 
                          isDisabled && styles.disabledDayNumber
                        ]}>
                          {dayNum}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* Date Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate && new Date(selectedDate.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedDate && (
                <>
                  {/* Drinks */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>🍺 Drinks</Text>
                    <Text style={styles.detailValue}>
                      {selectedDate.drinkCount !== null
                        ? `${selectedDate.drinkCount} drink${selectedDate.drinkCount !== 1 ? 's' : ''}`
                        : 'Not logged'}
                    </Text>
                  </View>

                  {/* Mood */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>😊 Mood</Text>
                    <Text style={styles.detailValue}>
                      {selectedDate.mood
                        ? `${MOOD_EMOJIS[selectedDate.mood] || '😐'} ${
                            selectedDate.mood.charAt(0).toUpperCase() + selectedDate.mood.slice(1)
                          }`
                        : 'Not logged'}
                    </Text>
                    {selectedDate.moodNotes && (
                      <Text style={styles.detailNotes}>{selectedDate.moodNotes}</Text>
                    )}
                  </View>

                  {/* Triggers */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>🎯 Triggers</Text>
                    {selectedDate.triggers && selectedDate.triggers.length > 0 ? (
                      selectedDate.triggers.map((trigger, index) => (
                        <View key={index} style={styles.triggerItem}>
                          <Text style={styles.detailValue}>
                            {trigger.type.charAt(0).toUpperCase() + trigger.type.slice(1)}
                          </Text>
                          {trigger.description && (
                            <Text style={styles.detailNotes}>{trigger.description}</Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={styles.detailValue}>No triggers logged</Text>
                    )}
                  </View>

                  {/* Notes */}
                  {selectedDate.notes && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>📝 Notes</Text>
                      <Text style={styles.detailValue}>{selectedDate.notes}</Text>
                    </View>
                  )}

                  {/* Achievements */}
                  {selectedDate.achievements && selectedDate.achievements.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>🏆 Achievements Unlocked</Text>
                      {selectedDate.achievements.map((achievement, index) => (
                        <View key={index} style={styles.achievementItem}>
                          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                          <View style={styles.achievementInfo}>
                            <Text style={styles.achievementName}>{achievement.name}</Text>
                            <Text style={styles.achievementDesc}>{achievement.description}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Empty State */}
                  {!selectedDate.drinkCount &&
                    !selectedDate.mood &&
                    selectedDate.triggers.length === 0 &&
                    !selectedDate.notes &&
                    selectedDate.achievements.length === 0 && (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No data logged for this day</Text>
                      </View>
                    )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCellContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  moodEmojiCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  dayIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  futureDayIndicator: {
    opacity: 0.3,
  },
  disabledDayIndicator: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  futureDayNumber: {
    color: '#94A3B8',
  },
  disabledDayNumber: {
    color: '#94A3B8',
  },
  moodEmoji: {
    fontSize: 14,
  },
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  modalBody: {
    maxHeight: 400,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 4,
  },
  detailNotes: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  triggerItem: {
    marginBottom: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 13,
    color: '#78350F',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#667EEA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
