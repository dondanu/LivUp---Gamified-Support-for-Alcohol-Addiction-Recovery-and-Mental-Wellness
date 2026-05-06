import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Save } from 'lucide-react-native';

export default function CustomizeProfileScreen() {
  const navigation = useNavigation();
  const [bio, setBio] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('purple');
  const [selectedFrame, setSelectedFrame] = useState('none');

  const themes = [
    { id: 'purple', name: 'Purple Dream', colors: ['#667EEA', '#764BA2'] },
    { id: 'blue', name: 'Ocean Blue', colors: ['#2193b0', '#6dd5ed'] },
    { id: 'green', name: 'Forest Green', colors: ['#11998e', '#38ef7d'] },
    { id: 'orange', name: 'Sunset Orange', colors: ['#f46b45', '#eea849'] },
    { id: 'pink', name: 'Pink Blossom', colors: ['#F093FB', '#F5576C'] },
    { id: 'dark', name: 'Dark Mode', colors: ['#232526', '#414345'] },
  ];

  const frames = [
    { id: 'none', name: 'No Frame', unlocked: true },
    { id: 'gold', name: 'Gold Frame', unlocked: true },
    { id: 'silver', name: 'Silver Frame', unlocked: false, requirement: 'Level 5' },
    { id: 'diamond', name: 'Diamond Frame', unlocked: false, requirement: 'Level 10' },
  ];

  const handleSave = () => {
    // TODO: Backend API not ready yet
    console.log('[CustomizeProfile] Saved:', { bio, theme: selectedTheme, frame: selectedFrame });
    Alert.alert('Success', 'Profile customization saved!\n\n(Backend API coming soon)');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customize Profile</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio / Tagline</Text>
          <TextInput
            style={styles.bioInput}
            placeholder="e.g., '90 days strong!', 'One day at a time'"
            placeholderTextColor="#95A5A6"
            value={bio}
            onChangeText={setBio}
            maxLength={100}
            multiline
          />
          <Text style={styles.charCount}>{bio.length}/100</Text>
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Theme</Text>
          <View style={styles.themeGrid}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  selectedTheme === theme.id && styles.themeCardSelected,
                ]}
                onPress={() => setSelectedTheme(theme.id)}
              >
                <LinearGradient
                  colors={theme.colors}
                  style={styles.themePreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.themeName}>{theme.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Avatar Frame Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avatar Frame</Text>
          <View style={styles.frameGrid}>
            {frames.map((frame) => (
              <TouchableOpacity
                key={frame.id}
                style={[
                  styles.frameCard,
                  selectedFrame === frame.id && styles.frameCardSelected,
                  !frame.unlocked && styles.frameCardLocked,
                ]}
                onPress={() => frame.unlocked && setSelectedFrame(frame.id)}
                disabled={!frame.unlocked}
              >
                <View
                  style={[
                    styles.framePreview,
                    frame.id === 'gold' && styles.frameGold,
                    frame.id === 'silver' && styles.frameSilver,
                    frame.id === 'diamond' && styles.frameDiamond,
                  ]}
                >
                  <Text style={styles.frameEmoji}>👤</Text>
                </View>
                <Text style={styles.frameName}>{frame.name}</Text>
                {!frame.unlocked && (
                  <Text style={styles.frameRequirement}>🔒 {frame.requirement}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
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
  saveButton: {
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  bioInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  charCount: {
    textAlign: 'right',
    color: '#95A5A6',
    fontSize: 12,
    marginTop: 8,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    borderColor: '#667EEA',
  },
  themePreview: {
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  frameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  frameCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  frameCardSelected: {
    borderColor: '#667EEA',
  },
  frameCardLocked: {
    opacity: 0.5,
  },
  framePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 4,
    borderColor: '#E0E0E0',
  },
  frameGold: {
    borderColor: '#FFD700',
  },
  frameSilver: {
    borderColor: '#C0C0C0',
  },
  frameDiamond: {
    borderColor: '#B9F2FF',
  },
  frameEmoji: {
    fontSize: 40,
  },
  frameName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  frameRequirement: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
  },
});
