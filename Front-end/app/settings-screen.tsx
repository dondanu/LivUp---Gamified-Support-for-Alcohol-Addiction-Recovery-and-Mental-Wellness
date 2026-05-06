import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Globe,
  Moon,
  Download,
  Trash2,
  ChevronRight,
  X,
  Mail,
  Key,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSettings,
  updateNotifications,
  updateTheme,
  changeEmail,
  changePassword,
  exportData,
  deleteAccount,
} from '@/src/api/settings';
import RNFS from 'react-native-fs';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, signOut, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      setNotificationsEnabled(response.settings.notifications_enabled);
      setDarkMode(response.settings.theme === 'dark');
    } catch (error: any) {
      console.error('[Settings] Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await updateNotifications({ notificationsEnabled: value });
    } catch (error: any) {
      console.error('[Settings] Error updating notifications:', error);
      setNotificationsEnabled(!value); // Revert on error
      Alert.alert('Error', 'Failed to update notifications setting');
    }
  };

  const handleToggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    try {
      await updateTheme({ theme: value ? 'dark' : 'light' });
    } catch (error: any) {
      console.error('[Settings] Error updating theme:', error);
      setDarkMode(!value); // Revert on error
      Alert.alert('Error', 'Failed to update theme');
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) {
      Alert.alert('Error', 'Please enter a new email');
      return;
    }

    try {
      setSubmitting(true);
      await changeEmail({ newEmail });
      // Refresh user data to show new email
      await refreshProfile();
      Alert.alert('Success', 'Email updated successfully');
      setShowEmailModal(false);
      setNewEmail('');
    } catch (error: any) {
      console.error('[Settings] Error changing email:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    try {
      setSubmitting(true);
      await changePassword({ currentPassword, newPassword });
      Alert.alert('Success', 'Password updated successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('[Settings] Error changing password:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Request storage permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to save the export file',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Storage permission is required to export data');
          return;
        }
      }

      Alert.alert(
        'Export Data',
        'Your data will be exported as a JSON file and saved to your Downloads folder.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                // Show loading
                Alert.alert('Exporting...', 'Please wait while we prepare your data');

                const response = await exportData();
                const jsonString = JSON.stringify(response.data, null, 2);

                // Create filename with timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const filename = `MindFusion_Export_${timestamp}.json`;

                // Determine download path based on platform
                const downloadPath = Platform.OS === 'android'
                  ? `${RNFS.DownloadDirectoryPath}/${filename}`
                  : `${RNFS.DocumentDirectoryPath}/${filename}`;

                // Write file
                await RNFS.writeFile(downloadPath, jsonString, 'utf8');

                Alert.alert(
                  'Success!',
                  `Data exported successfully!\n\nFile saved to:\n${Platform.OS === 'android' ? 'Downloads' : 'Documents'}/${filename}`,
                  [{ text: 'OK' }]
                );
              } catch (error: any) {
                console.error('[Settings] Error exporting data:', error);
                Alert.alert('Error', 'Failed to export data: ' + error.message);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[Settings] Error requesting permission:', error);
      Alert.alert('Error', 'Failed to request storage permission');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      setSubmitting(true);
      await deleteAccount({ password: deletePassword });
      Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
      setShowDeleteModal(false);
      // Sign out and navigate to login
      await signOut();
    } catch (error: any) {
      console.error('[Settings] Error deleting account:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to delete account');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => setShowDeleteModal(true),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667EEA" />
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        ) : (
          <>
            {/* Account Settings */}
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingItem} onPress={() => setShowEmailModal(true)}>
                <View style={styles.settingLeft}>
                  <Mail size={20} color="#667EEA" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Email</Text>
                    <Text style={styles.settingValue}>{user?.email || 'Not set'}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#95A5A6" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.settingItem} onPress={() => setShowPasswordModal(true)}>
                <View style={styles.settingLeft}>
                  <Key size={20} color="#667EEA" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Password</Text>
                    <Text style={styles.settingValue}>••••••••</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#95A5A6" />
              </TouchableOpacity>
            </View>

            {/* Notifications */}
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Bell size={20} color="#F39C12" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Push Notifications</Text>
                    <Text style={styles.settingHint}>Get reminders and updates</Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: '#E0E0E0', true: '#667EEA' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Appearance */}
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Moon size={20} color="#9B59B6" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Dark Mode</Text>
                    <Text style={styles.settingHint}>Switch to dark theme</Text>
                  </View>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={handleToggleDarkMode}
                  trackColor={{ false: '#E0E0E0', true: '#667EEA' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Privacy & Data */}
            <Text style={styles.sectionTitle}>Privacy & Data</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
                <View style={styles.settingLeft}>
                  <Download size={20} color="#4ECDC4" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Export Data</Text>
                    <Text style={styles.settingHint}>Download your data</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#95A5A6" />
              </TouchableOpacity>
            </View>

            {/* Danger Zone */}
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <TouchableOpacity style={styles.dangerCard} onPress={confirmDeleteAccount}>
              <Trash2 size={20} color="#E74C3C" />
              <View style={styles.settingText}>
                <Text style={styles.dangerLabel}>Delete Account</Text>
                <Text style={styles.dangerHint}>Permanently delete your account</Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      {/* Change Email Modal */}
      <Modal visible={showEmailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Email</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)} disabled={submitting}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="New Email"
              placeholderTextColor="#95A5A6"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submitting}
            />

            <TouchableOpacity 
              style={[styles.modalButton, submitting && styles.modalButtonDisabled]} 
              onPress={handleChangeEmail}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalButtonText}>Update Email</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)} disabled={submitting}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor="#95A5A6"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              editable={!submitting}
            />

            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#95A5A6"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              editable={!submitting}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#95A5A6"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!submitting}
            />

            <TouchableOpacity 
              style={[styles.modalButton, submitting && styles.modalButtonDisabled]} 
              onPress={handleChangePassword}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)} disabled={submitting}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteWarning}>
              ⚠️ This action cannot be undone. All your data will be permanently deleted.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password to confirm"
              placeholderTextColor="#95A5A6"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              editable={!submitting}
            />

            <TouchableOpacity 
              style={[styles.dangerButton, submitting && styles.modalButtonDisabled]} 
              onPress={handleDeleteAccount}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalButtonText}>Delete My Account</Text>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  settingHint: {
    fontSize: 13,
    color: '#95A5A6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 52,
  },
  dangerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E74C3C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 2,
  },
  dangerHint: {
    fontSize: 13,
    color: '#E74C3C',
    opacity: 0.7,
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
  modalButton: {
    backgroundColor: '#667EEA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  dangerButton: {
    backgroundColor: '#E74C3C',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteWarning: {
    fontSize: 14,
    color: '#E74C3C',
    marginBottom: 16,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
});
