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
import { ArrowLeft, Plus, BookOpen, Heart, Sparkles, X, Trash2, Edit } from 'lucide-react-native';
import {
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalStats,
  type JournalEntry as APIJournalEntry,
  type JournalEntryType,
} from '@/src/api/journal';

interface JournalEntry {
  id: string;
  type: 'note' | 'gratitude' | 'reason' | 'mantra';
  content: string;
  date: string;
}

export default function PersonalJournalScreen() {
  const navigation = useNavigation();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, gratitude: 0, reason: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'note' | 'gratitude' | 'reason' | 'mantra'>('note');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    loadJournalData();
  }, []);

  const loadJournalData = async () => {
    try {
      setLoading(true);
      
      // Load entries
      const entriesResponse = await getJournalEntries();
      const formattedEntries = entriesResponse.entries.map((e: APIJournalEntry) => ({
        id: e.id.toString(),
        type: e.type,
        content: e.content,
        date: e.entry_date,
      }));
      setEntries(formattedEntries);

      // Load stats
      const statsResponse = await getJournalStats();
      setStats({
        total: statsResponse.total,
        gratitude: statsResponse.byType.gratitude,
        reason: statsResponse.byType.reason,
      });
    } catch (error: any) {
      console.error('[PersonalJournal] Error loading data:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const entryTypes = [
    { id: 'note', name: 'Note', icon: '📝', color: '#667EEA' },
    { id: 'gratitude', name: 'Gratitude', icon: '🙏', color: '#F093FB' },
    { id: 'reason', name: 'Reason', icon: '💪', color: '#4ECDC4' },
    { id: 'mantra', name: 'Mantra', icon: '✨', color: '#F39C12' },
  ];

  const handleAddEntry = async () => {
    if (!newContent.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    try {
      setSubmitting(true);
      await addJournalEntry({
        type: selectedType as JournalEntryType,
        content: newContent.trim(),
      });

      setNewContent('');
      setShowAddModal(false);
      Alert.alert('Success', 'Entry added!');
      loadJournalData(); // Reload data
    } catch (error: any) {
      console.error('[PersonalJournal] Error adding entry:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setNewContent(entry.content);
    setSelectedType(entry.type);
    setShowEditModal(true);
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !newContent.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    try {
      setSubmitting(true);
      await updateJournalEntry(parseInt(editingEntry.id), {
        content: newContent.trim(),
      });

      setNewContent('');
      setEditingEntry(null);
      setShowEditModal(false);
      Alert.alert('Success', 'Entry updated!');
      loadJournalData(); // Reload data
    } catch (error: any) {
      console.error('[PersonalJournal] Error updating entry:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteJournalEntry(parseInt(id));
            Alert.alert('Success', 'Entry deleted');
            loadJournalData(); // Reload data
          } catch (error: any) {
            console.error('[PersonalJournal] Error deleting entry:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to delete entry');
          }
        },
      },
    ]);
  };

  const getTypeInfo = (type: string) => {
    return entryTypes.find((t) => t.id === type) || entryTypes[0];
  };

  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.type]) {
      acc[entry.type] = [];
    }
    acc[entry.type].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Journal</Text>
          <View style={styles.addButton} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Loading journal...</Text>
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
        <Text style={styles.headerTitle}>Personal Journal</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.gratitude}</Text>
            <Text style={styles.statLabel}>Gratitudes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.reason}</Text>
            <Text style={styles.statLabel}>Reasons</Text>
          </View>
        </View>

        {/* Entries by Type */}
        {entryTypes.map((type) => {
          const typeEntries = groupedEntries[type.id] || [];
          if (typeEntries.length === 0) return null;

          return (
            <View key={type.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>{type.icon}</Text>
                <Text style={styles.sectionTitle}>{type.name}</Text>
                <Text style={styles.sectionCount}>({typeEntries.length})</Text>
              </View>

              {typeEntries.map((entry) => (
                <View key={entry.id} style={[styles.entryCard, { borderLeftColor: type.color }]}>
                  <View style={styles.entryContent}>
                    <Text style={styles.entryText}>{entry.content}</Text>
                    <Text style={styles.entryDate}>
                      {new Date(entry.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.entryActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditEntry(entry)}
                    >
                      <Edit size={18} color="#667EEA" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 size={18} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <BookOpen size={64} color="#BDC3C7" />
            <Text style={styles.emptyText}>No entries yet</Text>
            <Text style={styles.emptyHint}>Tap + to add your first entry</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Entry Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Entry</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            {/* Type Selection */}
            <Text style={styles.label}>Entry Type</Text>
            <View style={styles.typeGrid}>
              {entryTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    selectedType === type.id && { backgroundColor: type.color },
                  ]}
                  onPress={() => setSelectedType(type.id as any)}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.typeName,
                      selectedType === type.id && styles.typeNameSelected,
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content Input */}
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={styles.textArea}
              placeholder={`Write your ${getTypeInfo(selectedType).name.toLowerCase()}...`}
              placeholderTextColor="#95A5A6"
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!submitting}
              maxLength={5000}
            />
            <Text style={styles.charCount}>{newContent.length}/5000</Text>

            <TouchableOpacity
              style={[styles.addEntryButton, submitting && styles.addEntryButtonDisabled]}
              onPress={handleAddEntry}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.addEntryButtonText}>Add Entry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Entry Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Entry</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEditModal(false);
                  setEditingEntry(null);
                  setNewContent('');
                }}
              >
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            {/* Show Entry Type (Read-only) */}
            <Text style={styles.label}>Entry Type</Text>
            <View style={styles.typeDisplayContainer}>
              <Text style={styles.typeDisplayIcon}>{getTypeInfo(selectedType).icon}</Text>
              <Text style={styles.typeDisplayName}>{getTypeInfo(selectedType).name}</Text>
            </View>

            {/* Content Input */}
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={styles.textArea}
              placeholder={`Edit your ${getTypeInfo(selectedType).name.toLowerCase()}...`}
              placeholderTextColor="#95A5A6"
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!submitting}
              maxLength={5000}
            />
            <Text style={styles.charCount}>{newContent.length}/5000</Text>

            <TouchableOpacity
              style={[styles.addEntryButton, submitting && styles.addEntryButtonDisabled]}
              onPress={handleUpdateEntry}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.addEntryButtonText}>Update Entry</Text>
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
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  sectionCount: {
    fontSize: 14,
    color: '#95A5A6',
    marginLeft: 8,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryContent: {
    flex: 1,
  },
  entryText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 22,
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 12,
    color: '#95A5A6',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#95A5A6',
    marginTop: 8,
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
    minHeight: 500,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    marginRight: 12,
    marginBottom: 12,
  },
  typeIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  typeNameSelected: {
    color: '#FFFFFF',
  },
  textArea: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 150,
    marginBottom: 24,
  },
  addEntryButton: {
    backgroundColor: '#667EEA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addEntryButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  addEntryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  charCount: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'right',
    marginBottom: 16,
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
  typeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  typeDisplayIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  typeDisplayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
});
