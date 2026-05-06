import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Share2,
  QrCode,
  Facebook,
  Twitter,
  Instagram,
  Link,
  Users,
  Award,
  TrendingUp,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function SocialSharingScreen() {
  const navigation = useNavigation();
  const { profile, user } = useAuth();

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my sobriety journey! I'm ${profile?.current_streak} days strong! 💪\n\nJoin me on Mind Fusion: [App Link]`,
        title: 'My Sobriety Journey',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleShareAchievement = async () => {
    try {
      await Share.share({
        message: `🏆 I just reached ${profile?.current_streak} days sober! Every day is a victory! 💪\n\n#SobrietyJourney #MindFusion`,
        title: 'Achievement Unlocked!',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleShareProgress = async () => {
    try {
      await Share.share({
        message: `📊 My Progress:\n✅ ${profile?.current_streak} day streak\n🏆 Level ${profile?.level_id}\n⭐ ${profile?.total_points} points\n\nOne day at a time! 💪\n\n#Recovery #SobrietyJourney`,
        title: 'My Progress',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyProfileLink = () => {
    // TODO: Generate and copy profile link
    Alert.alert('Success', 'Profile link copied to clipboard!');
  };

  const handleShowQRCode = () => {
    // TODO: Generate QR code
    Alert.alert('QR Code', 'QR code feature coming soon!');
  };

  const shareOptions = [
    {
      id: 'profile',
      title: 'Share Profile',
      description: 'Share your journey with friends',
      icon: Share2,
      color: '#667EEA',
      action: handleShareProfile,
    },
    {
      id: 'achievement',
      title: 'Share Achievement',
      description: 'Celebrate your milestones',
      icon: Award,
      color: '#F39C12',
      action: handleShareAchievement,
    },
    {
      id: 'progress',
      title: 'Share Progress',
      description: 'Show your stats and growth',
      icon: TrendingUp,
      color: '#4ECDC4',
      action: handleShareProgress,
    },
  ];

  const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social & Sharing</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.username || 'User'}</Text>
              <Text style={styles.profileStats}>
                {profile?.current_streak} days • Level {profile?.level_id}
              </Text>
            </View>
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCopyProfileLink}>
              <Link size={20} color="#667EEA" />
              <Text style={styles.actionButtonText}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShowQRCode}>
              <QrCode size={20} color="#667EEA" />
              <Text style={styles.actionButtonText}>QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Options */}
        <Text style={styles.sectionTitle}>What to Share</Text>
        {shareOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.shareCard}
            onPress={option.action}
          >
            <View style={[styles.shareIcon, { backgroundColor: option.color + '20' }]}>
              <option.icon size={24} color={option.color} />
            </View>
            <View style={styles.shareContent}>
              <Text style={styles.shareTitle}>{option.title}</Text>
              <Text style={styles.shareDescription}>{option.description}</Text>
            </View>
            <Share2 size={20} color="#95A5A6" />
          </TouchableOpacity>
        ))}

        {/* Social Platforms */}
        <Text style={styles.sectionTitle}>Share To</Text>
        <View style={styles.platformsGrid}>
          {socialPlatforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={styles.platformCard}
              onPress={() => Alert.alert('Coming Soon', `${platform.name} sharing coming soon!`)}
            >
              <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
                <platform.icon size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.platformName}>{platform.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Support Network (Future Feature) */}
        <Text style={styles.sectionTitle}>Support Network</Text>
        <View style={styles.comingSoonCard}>
          <Users size={48} color="#BDC3C7" />
          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            Connect with friends, find accountability partners, and build your support network.
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  profileStats: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  shareCard: {
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
  shareIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  shareContent: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  shareDescription: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  platformsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  platformCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  platformIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  platformName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  comingSoonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
});
