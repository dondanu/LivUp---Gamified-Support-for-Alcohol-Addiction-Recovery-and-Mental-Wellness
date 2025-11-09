import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '@react-navigation/native';
import {
  User,
  LogOut,
  Award,
  Phone,
  Heart,
  Edit,
  Save,
  X,
  Shield,
  Sparkles,
} from 'lucide-react-native';
import { EmergencyContact, HealthyAlternative, UserBadge } from '@/types/database.types';

export default function ProfileScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigation = useNavigation<any>();
  const [username, setUsername] = useState(profile?.username || '');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [alternatives, setAlternatives] = useState<HealthyAlternative[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('');

  useEffect(() => {
    loadProfileData();
  }, [profile]);

  const loadProfileData = async () => {
    if (!profile?.id) return;

    try {
      const { data: contactsData } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', profile.id)
        .order('is_primary', { ascending: false });

      if (contactsData) setContacts(contactsData);

      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', profile.id)
        .order('earned_at', { ascending: false });

      if (badgesData) setBadges(badgesData);

      const { data: alternativesData } = await supabase
        .from('healthy_alternatives')
        .select('*')
        .limit(20);

      if (alternativesData) setAlternatives(alternativesData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', profile.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      await refreshProfile();
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!profile?.id || !newContactName || !newContactPhone) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    try {
      const { error } = await supabase.from('emergency_contacts').insert({
        user_id: profile.id,
        name: newContactName,
        phone: newContactPhone,
        relationship: newContactRelationship,
      });

      if (error) throw error;

      Alert.alert('Success', 'Emergency contact added');
      setNewContactName('');
      setNewContactPhone('');
      setNewContactRelationship('');
      loadProfileData();
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' as never }],
          });
        },
      },
    ]);
  };

  const getLevelProgress = () => {
    const points = profile?.total_points || 0;
    return Math.min(((points % 1000) / 1000) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={['#F093FB', '#F5576C']} style={styles.avatar} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <User size={48} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.avatarBadge}>
              <Sparkles size={16} color="#FFD700" />
              <Text style={styles.avatarBadgeText}>{profile?.avatar_level || 1}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            {editMode ? (
              <TextInput
                style={styles.usernameInput}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor="#FFFFFF"
              />
            ) : (
              <Text style={styles.username}>{profile?.username || 'User'}</Text>
            )}
            <Text style={styles.level}>{profile?.level || 'Beginner'}</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={editMode ? handleUpdateProfile : () => setEditMode(true)}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : editMode ? (
              <Save size={24} color="#FFFFFF" />
            ) : (
              <Edit size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.levelProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${getLevelProgress()}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {profile?.total_points || 0} / {Math.ceil((profile?.total_points || 0) / 1000) * 1000}{' '}
            points
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.current_streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.longest_streak || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuCard} onPress={() => setShowBadgesModal(true)}>
          <View style={styles.menuIconContainer}>
            <Award size={24} color="#4ECDC4" />
          </View>
          <Text style={styles.menuText}>My Badges</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => setShowContactModal(true)}>
          <View style={styles.menuIconContainer}>
            <Phone size={24} color="#F39C12" />
          </View>
          <Text style={styles.menuText}>Emergency Contacts</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => setShowAlternativesModal(true)}>
          <View style={styles.menuIconContainer}>
            <Heart size={24} color="#E74C3C" />
          </View>
          <Text style={styles.menuText}>Healthy Alternatives</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('SOS' as never)}>
          <View style={styles.menuIconContainer}>
            <Shield size={24} color="#9B59B6" />
          </View>
          <Text style={styles.menuText}>SOS Support</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuCard, styles.signOutCard]} onPress={handleSignOut}>
          <View style={styles.menuIconContainer}>
            <LogOut size={24} color="#E74C3C" />
          </View>
          <Text style={[styles.menuText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showBadgesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Badges</Text>
              <TouchableOpacity onPress={() => setShowBadgesModal(false)}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {badges.length === 0 ? (
                <Text style={styles.emptyText}>No badges earned yet. Keep going!</Text>
              ) : (
                <View style={styles.badgesGrid}>
                  {badges.map((userBadge) => (
                    <View key={userBadge.id} style={styles.badgeItem}>
                      <View style={styles.badgeIcon}>
                        <Award size={32} color="#FFD700" />
                      </View>
                      <Text style={styles.badgeName}>{userBadge.badges?.name}</Text>
                      <Text style={styles.badgeDescription} numberOfLines={2}>
                        {userBadge.badges?.description}
                      </Text>
                      <Text style={styles.badgeDate}>
                        {new Date(userBadge.earned_at).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showContactModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Emergency Contacts</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {contacts.map((contact) => (
                <View key={contact.id} style={styles.contactItem}>
                  <Phone size={20} color="#4ECDC4" />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    {contact.relationship && (
                      <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    )}
                  </View>
                </View>
              ))}

              <View style={styles.addContactForm}>
                <Text style={styles.formLabel}>Add New Contact</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#95A5A6"
                  value={newContactName}
                  onChangeText={setNewContactName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#95A5A6"
                  value={newContactPhone}
                  onChangeText={setNewContactPhone}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Relationship (optional)"
                  placeholderTextColor="#95A5A6"
                  value={newContactRelationship}
                  onChangeText={setNewContactRelationship}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
                  <Text style={styles.addButtonText}>Add Contact</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showAlternativesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Healthy Alternatives</Text>
              <TouchableOpacity onPress={() => setShowAlternativesModal(false)}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {alternatives.map((alternative) => (
                <View key={alternative.id} style={styles.alternativeItem}>
                  <Text style={styles.alternativeTitle}>{alternative.title}</Text>
                  <Text style={styles.alternativeDescription}>{alternative.description}</Text>
                  <View style={styles.alternativeFooter}>
                    <Text style={styles.alternativeCategory}>{alternative.category}</Text>
                    <Text style={styles.alternativeDuration}>
                      {alternative.duration_minutes} min
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
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2C3E50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  usernameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
    paddingBottom: 4,
  },
  level: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
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
    marginBottom: 16,
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
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  menuArrow: {
    fontSize: 24,
    color: '#95A5A6',
  },
  signOutCard: {
    marginTop: 24,
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  signOutText: {
    color: '#E74C3C',
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
  modalScroll: {
    maxHeight: 400,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 16,
    paddingVertical: 32,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '48%',
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIcon: {
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDate: {
    fontSize: 10,
    color: '#95A5A6',
  },
  contactItem: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  contactPhone: {
    fontSize: 14,
    color: '#4ECDC4',
    marginTop: 2,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  addContactForm: {
    marginTop: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alternativeItem: {
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  alternativeDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 12,
  },
  alternativeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alternativeCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ECDC4',
    textTransform: 'capitalize',
  },
  alternativeDuration: {
    fontSize: 12,
    color: '#95A5A6',
  },
});
