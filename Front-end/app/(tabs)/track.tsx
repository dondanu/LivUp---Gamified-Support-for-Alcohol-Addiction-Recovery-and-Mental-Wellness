import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Calendar,
  Plus,
  Minus,
  Save,
  X,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
} from 'lucide-react-native';

export default function TrackScreen() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [drinksCount, setDrinksCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState('');
  const [moodNotes, setMoodNotes] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [triggerDescription, setTriggerDescription] = useState('');
  const [loading, setLoading] = useState(false);
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
    { value: 'celebration', label: 'Celebration', color: '#F39C12' },
    { value: 'sadness', label: 'Sadness', color: '#9B59B6' },
    { value: 'anger', label: 'Anger', color: '#E67E22' },
    { value: 'other', label: 'Other', color: '#34495E' },
  ];

  useEffect(() => {
    loadDayData();
  }, [selectedDate, profile]);

  const loadDayData = async () => {
    if (!profile?.id) return;

    try {
      const { data: drinkLog } = await supabase
        .from('drink_logs')
        .select('*')
        .eq('user_id', profile.id)
        .eq('date', selectedDate)
        .maybeSingle();

      if (drinkLog) {
        setDrinksCount(drinkLog.drinks_count);
        setNotes(drinkLog.notes);
      } else {
        setDrinksCount(0);
        setNotes('');
      }

      const { data: moodLog } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', profile.id)
        .eq('date', selectedDate)
        .maybeSingle();

      if (moodLog) {
        setMood(moodLog.mood);
        setMoodNotes(moodLog.notes);
      } else {
        setMood('');
        setMoodNotes('');
      }
    } catch (error) {
      console.error('Error loading day data:', error);
    }
  };

  const saveDrinkLog = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('drink_logs').upsert(
        {
          user_id: profile.id,
          date: selectedDate,
          drinks_count: drinksCount,
          notes: notes,
        },
        { onConflict: 'user_id,date' }
      );

      if (error) throw error;
      Alert.alert('Success', 'Drink log saved successfully');
    } catch (error) {
      console.error('Error saving drink log:', error);
      Alert.alert('Error', 'Failed to save drink log');
    } finally {
      setLoading(false);
    }
  };

  const saveMoodLog = async (selectedMood: string) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase.from('mood_logs').upsert(
        {
          user_id: profile.id,
          date: selectedDate,
          mood: selectedMood,
          notes: moodNotes,
        },
        { onConflict: 'user_id,date' }
      );

      if (error) throw error;
      setMood(selectedMood);
      setShowMoodModal(false);
      Alert.alert('Success', 'Mood logged successfully');
    } catch (error) {
      console.error('Error saving mood log:', error);
      Alert.alert('Error', 'Failed to save mood log');
    }
  };

  const saveTriggerLog = async () => {
    if (!profile?.id || !triggerType) return;

    try {
      const { error } = await supabase.from('trigger_logs').insert({
        user_id: profile.id,
        date: selectedDate,
        trigger_type: triggerType,
        description: triggerDescription,
      });

      if (error) throw error;
      setTriggerType('');
      setTriggerDescription('');
      setShowTriggerModal(false);
      Alert.alert('Success', 'Trigger logged successfully');
    } catch (error) {
      console.error('Error saving trigger log:', error);
      Alert.alert('Error', 'Failed to save trigger log');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.header} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <Text style={styles.headerTitle}>Track Your Progress</Text>
        <Text style={styles.headerSubtitle}>Every entry counts towards recovery</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.dateSelector}>
          <Calendar size={24} color="#4ECDC4" />
          <Text style={styles.dateText}>{new Date(selectedDate).toLocaleDateString()}</Text>
        </View>

        <TouchableOpacity style={styles.cravingButton} onPress={() => setShowCravingModal(true)}>
          <AlertTriangle size={24} color="#FFFFFF" />
          <Text style={styles.cravingButtonText}>Having a Craving?</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Drink Count</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setDrinksCount(Math.max(0, drinksCount - 1))}>
              <Minus size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.counterDisplay}>
              <Text style={styles.counterValue}>{drinksCount}</Text>
              <Text style={styles.counterLabel}>drinks</Text>
            </View>

            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setDrinksCount(drinksCount + 1)}>
              <Plus size={24} color="#FFFFFF" />
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

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveDrinkLog}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Drink Log</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling?</Text>
          {mood ? (
            <View style={styles.moodSelected}>
              <Text style={styles.moodEmoji}>
                {moods.find((m) => m.value === mood)?.icon}
              </Text>
              <Text style={styles.moodLabel}>{moods.find((m) => m.value === mood)?.label}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowMoodModal(true)}>
            <Text style={styles.secondaryButtonText}>
              {mood ? 'Update Mood' : 'Log Your Mood'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trigger Tracking</Text>
          <Text style={styles.cardDescription}>
            Identify what led to drinking to better understand patterns
          </Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowTriggerModal(true)}>
            <Text style={styles.secondaryButtonText}>Log a Trigger</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
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
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  counterButton: {
    backgroundColor: '#4ECDC4',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  counterDisplay: {
    alignItems: 'center',
    marginHorizontal: 40,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  counterLabel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  notesInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#667EEA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  moodSelected: {
    alignItems: 'center',
    marginBottom: 16,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
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
});
