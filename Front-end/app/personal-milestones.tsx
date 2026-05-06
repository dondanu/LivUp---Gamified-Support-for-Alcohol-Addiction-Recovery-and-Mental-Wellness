import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, Calendar, Target, X, Trash2 } from 'lucide-react-native';
import {
  getMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  type Milestone as APIMilestone,
} from '@/src/api/milestones';

interface Milestone {
  id: string;
  title: string;
  date: string;
  type: 'sobriety' | 'custom';
  daysUntil: number;
}

export default function PersonalMilestonesScreen() {
  const navigation = useNavigation();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const response = await getMilestones();
      const formattedMilestones = response.milestones.map((m: APIMilestone) => ({
        id: m.id.toString(),
        title: m.title,
        date: m.milestone_date,
        type: m.type,
        daysUntil: calculateDaysUntil(m.milestone_date),
      }));
      setMilestones(formattedMilestones);
    } catch (error: any) {
      console.error('[PersonalMilestones] Error loading milestones:', error);
      Alert.alert('Error', 'Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddMilestone = async () => {
    if (!newTitle || !newDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newDate)) {
      Alert.alert('Error', 'Date must be in format YYYY-MM-DD (e.g., 2024-12-31)');
      return;
    }

    try {
      setSubmitting(true);
      await addMilestone({
        title: newTitle,
        date: newDate,
        type: 'custom',
      });

      setNewTitle('');
      setNewDate('');
      setShowAddModal(false);
      Alert.alert('Success', 'Milestone added!');
      loadMilestones(); // Reload milestones
    } catch (error: any) {
      console.error('[PersonalMilestones] Error adding milestone:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMilestone = (id: string, type: string) => {
    if (type === 'sobriety') {
      Alert.alert('Cannot Delete', 'Sobriety start date cannot be deleted');
      return;
    }

    Alert.alert('Delete Milestone', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMilestone(parseInt(id));
            Alert.alert('Success', 'Milestone deleted');
            loadMilestones(); // Reload milestones
          } catch (error: any) {
            console.error('[PersonalMilestones] Error deleting milestone:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to delete milestone');
          }
        },
      },
    ]);
  };

  const getMilestoneIcon = (daysUntil: number) => {
    if (daysUntil < 0) return '✅';
    if (daysUntil === 0) return '🎉';
    if (daysUntil <= 7) return '🔥';
    return '🎯';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Milestones</Text>
          <View style={styles.addButton} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Loading milestones...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Milestones</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Upcoming Milestones */}
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {milestones.filter((m) => m.daysUntil >= 0).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No upcoming milestones</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first milestone</Text>
          </View>
        ) : (
          milestones
            .filter((m) => m.daysUntil >= 0)
            .sort((a, b) => a.daysUntil - b.daysUntil)
            .map((milestone) => (
              <View key={milestone.id} style={styles.milestoneCard}>
                <View style={styles.milestoneIcon}>
                  <Text style={styles.milestoneEmoji}>{getMilestoneIcon(milestone.daysUntil)}</Text>
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneDate}>
                    {new Date(milestone.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.milestoneDays}>
                    {milestone.daysUntil === 0
                      ? 'Today! 🎉'
                      : `${milestone.daysUntil} days to go`}
                  </Text>
                </View>
                {milestone.type === 'custom' && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMilestone(milestone.id, milestone.type)}
                  >
                    <Trash2 size={20} color="#E74C3C" />
                  </TouchableOpacity>
                )}
              </View>
            ))
        )}

        {/* Past Milestones */}
        {milestones.filter((m) => m.daysUntil < 0).length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Completed</Text>
            {milestones
              .filter((m) => m.daysUntil < 0)
              .sort((a, b) => b.daysUntil - a.daysUntil)
              .map((milestone) => (
                <View key={milestone.id} style={[styles.milestoneCard, styles.completedCard]}>
                  <View style={styles.milestoneIcon}>
                    <Text style={styles.milestoneEmoji}>✅</Text>
                  </View>
                  <View style={styles.milestoneContent}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    <Text style={styles.milestoneDate}>
                      {new Date(milestone.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.completedText}>
                      Completed {Math.abs(milestone.daysUntil)} days ago
                    </Text>
                  </View>
                  {milestone.type === 'custom' && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteMilestone(milestone.id, milestone.type)}
                    >
                      <Trash2 size={20} color="#E74C3C" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
          </>
        )}
      </ScrollView>

      {/* Add Milestone Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Milestone</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Milestone Title"
              placeholderTextColor="#95A5A6"
              value={newTitle}
              onChangeText={setNewTitle}
              editable={!submitting}
            />

            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#95A5A6"
              value={newDate}
              onChangeText={setNewDate}
              editable={!submitting}
            />

            <TouchableOpacity
              style={[styles.addMilestoneButton, submitting && styles.addMilestoneButtonDisabled]}
              onPress={handleAddMilestone}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.addMilestoneButtonText}>Add Milestone</Text>
              )}
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
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  milestoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    opacity: 0.7,
  },
  milestoneIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  milestoneEmoji: {
    fontSize: 24,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  milestoneDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  milestoneDays: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 16,
  },
  addMilestoneButton: {
    backgroundColor: '#667EEA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addMilestoneButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  addMilestoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});
