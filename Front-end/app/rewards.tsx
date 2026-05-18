import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Import images
const BADGES = [
  { 
    id: 1, 
    name: 'Surprise Visit', 
    image: require('@/assets/images/rewards/badges/suprise visit-Photoroom.png'),
    description: 'A pleasant surprise awaits those who stay consistent!',
    unlockCondition: 'Log in for 3 consecutive days',
    locked: true,
  },
  { 
    id: 2, 
    name: 'Trade Your Star', 
    image: require('@/assets/images/rewards/badges/trade your star-Photoroom.png'),
    description: 'Share your success and inspire others on their journey.',
    unlockCondition: 'Share your progress on social media',
    locked: true,
  },
  { 
    id: 3, 
    name: 'First Fifty', 
    image: require('@/assets/images/rewards/badges/first fifty-Photoroom.png'),
    description: 'Your first milestone! Every journey begins with a single step.',
    unlockCondition: 'Earn your first 50 points',
    locked: true,
  },
  { 
    id: 4, 
    name: 'Gold Circle', 
    image: require('@/assets/images/rewards/badges/gold circle-Photoroom.png'),
    description: 'You\'ve reached the golden standard of excellence!',
    unlockCondition: 'Complete 25 challenges',
    locked: true,
  },
  { 
    id: 5, 
    name: 'Silver Circle', 
    image: require('@/assets/images/rewards/badges/silver circle-Photoroom.png'),
    description: 'Shining bright on your path to recovery!',
    unlockCondition: 'Complete 10 challenges',
    locked: true,
  },
  { 
    id: 6, 
    name: 'Level 2', 
    image: require('@/assets/images/rewards/badges/level 2-Photoroom.png'),
    description: 'You\'ve leveled up! Your dedication is paying off.',
    unlockCondition: 'Reach Level 2 (500 points)',
    locked: true,
  },
  { 
    id: 7, 
    name: 'Top 10', 
    image: require('@/assets/images/rewards/badges/top 10-Photoroom.png'),
    description: 'You\'re among the best! Keep pushing forward.',
    unlockCondition: 'Rank in the top 10 on the leaderboard',
    locked: true,
  },
  { 
    id: 8, 
    name: '5 Days Strong', 
    image: require('@/assets/images/rewards/badges/5 days-Photoroom.png'),
    description: 'Five days of commitment! You\'re building a powerful habit.',
    unlockCondition: 'Maintain a 5-day streak',
    locked: true,
  },
  { 
    id: 9, 
    name: '3 Star Champion', 
    image: require('@/assets/images/rewards/badges/3 star-Photoroom.png'),
    description: 'Triple excellence! You\'re mastering your challenges.',
    unlockCondition: 'Complete 3 hard difficulty challenges',
    locked: true,
  },
];

const REWARDS = [
  { 
    id: 1, 
    name: 'Success', 
    image: require('@/assets/images/rewards/rewards/success-Photoroom.png'),
    description: 'True success is measured by the progress you make each day.',
    unlockCondition: 'Complete your first challenge',
    locked: true,
  },
  { 
    id: 2, 
    name: 'Rock Solid', 
    image: require('@/assets/images/rewards/rewards/rock-Photoroom.png'),
    description: 'You\'re as solid as a rock! Nothing can shake your determination.',
    unlockCondition: 'Complete 7 challenges without missing a day',
    locked: true,
  },
  { 
    id: 3, 
    name: 'Real Gladiator', 
    image: require('@/assets/images/rewards/rewards/real gladiator-Photoroom.png'),
    description: 'A true warrior in the battle for a better life!',
    unlockCondition: 'Complete 50 challenges total',
    locked: true,
  },
  { 
    id: 4, 
    name: 'Really Fast', 
    image: require('@/assets/images/rewards/rewards/really fast-Photoroom.png'),
    description: 'Speed and efficiency! You\'re making rapid progress.',
    unlockCondition: 'Complete 5 challenges in one day',
    locked: true,
  },
  { 
    id: 5, 
    name: 'Moving Fast', 
    image: require('@/assets/images/rewards/rewards/moving fast-Photoroom.png'),
    description: 'You\'re on a roll! Keep up the momentum.',
    unlockCondition: 'Complete 3 challenges in one day',
    locked: true,
  },
  { 
    id: 6, 
    name: 'On Fire', 
    image: require('@/assets/images/rewards/rewards/on fire-Photoroom.png'),
    description: 'You\'re unstoppable! Your passion is burning bright.',
    unlockCondition: 'Maintain a 10-day streak',
    locked: true,
  },
  { 
    id: 7, 
    name: 'Be Smart', 
    image: require('@/assets/images/rewards/rewards/be smart-Photoroom.png'),
    description: 'Wisdom comes from making the right choices consistently.',
    unlockCondition: 'Complete all daily challenges for 3 days',
    locked: true,
  },
  { 
    id: 8, 
    name: '24/7 Warrior', 
    image: require('@/assets/images/rewards/rewards/24by7-Photoroom.png'),
    description: 'Round-the-clock dedication! You never give up.',
    unlockCondition: 'Log in every day for 30 days',
    locked: true,
  },
];

const ACHIEVEMENTS = [
  { 
    id: 1, 
    name: 'Achievement Map', 
    image: require('@/assets/images/rewards/achievements/achevment map-Photoroom.png'),
    description: 'You\'ve charted your course to success! Every achievement tells your story.',
    unlockCondition: 'Unlock 5 different badges',
    locked: true,
  },
  { 
    id: 2, 
    name: 'Spending Score', 
    image: require('@/assets/images/rewards/achievements/spending score-Photoroom.png'),
    description: 'Smart choices lead to better outcomes. Track your progress wisely.',
    unlockCondition: 'Log your expenses for 7 consecutive days',
    locked: true,
  },
  { 
    id: 3, 
    name: 'Treasures', 
    image: require('@/assets/images/rewards/achievements/treasures-Photoroom.png'),
    description: 'The real treasure is the person you\'re becoming!',
    unlockCondition: 'Earn 1000 total points',
    locked: true,
  },
  { 
    id: 4, 
    name: 'Top Shooter', 
    image: require('@/assets/images/rewards/achievements/top shooter-Photoroom.png'),
    description: 'Aim high and hit your targets! You\'re a sharpshooter.',
    unlockCondition: 'Complete 20 challenges with perfect scores',
    locked: true,
  },
  { 
    id: 5, 
    name: 'Quiz Master', 
    image: require('@/assets/images/rewards/achievements/quiz compleated-Photoroom.png'),
    description: 'Knowledge is power! You\'ve mastered the fundamentals.',
    unlockCondition: 'Complete all educational quizzes',
    locked: true,
  },
  { 
    id: 6, 
    name: 'Gambler No More', 
    image: require('@/assets/images/rewards/achievements/gambler-Photoroom.png'),
    description: 'You\'ve broken free from risky behaviors. True strength!',
    unlockCondition: 'Avoid triggers for 14 consecutive days',
    locked: true,
  },
  { 
    id: 7, 
    name: 'Level Up Master', 
    image: require('@/assets/images/rewards/achievements/level up-Photoroom.png'),
    description: 'Continuous growth! You\'re always improving.',
    unlockCondition: 'Reach Level 5 (2500 points)',
    locked: true,
  },
  { 
    id: 8, 
    name: 'Distance Covered', 
    image: require('@/assets/images/rewards/achievements/distance covered-Photoroom.png'),
    description: 'Look how far you\'ve come! Every step counts.',
    unlockCondition: 'Be active in the app for 60 days',
    locked: true,
  },
  { 
    id: 9, 
    name: 'Friends Invited', 
    image: require('@/assets/images/rewards/achievements/friends invited-Photoroom.png'),
    description: 'Helping others helps yourself. You\'re building a support network!',
    unlockCondition: 'Invite 3 friends to join the app',
    locked: true,
  },
  { 
    id: 10, 
    name: 'Time Online Champion', 
    image: require('@/assets/images/rewards/achievements/time online-Photoroom.png'),
    description: 'Consistent engagement leads to lasting change!',
    unlockCondition: 'Spend 10 hours total in the app',
    locked: true,
  },
  { 
    id: 11, 
    name: 'Game Points Legend', 
    image: require('@/assets/images/rewards/achievements/game points-Photoroom.png'),
    description: 'You\'re a legend! Your dedication is truly inspiring.',
    unlockCondition: 'Earn 5000 total points',
    locked: true,
  },
];

export default function RewardsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'badges' | 'rewards' | 'achievements'>('badges');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'badges':
        return BADGES;
      case 'rewards':
        return REWARDS;
      case 'achievements':
        return ACHIEVEMENTS;
      default:
        return BADGES;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F093FB', '#F5576C']} style={styles.header} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rewards & Achievements</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'badges' && styles.tabActive]}
            onPress={() => setActiveTab('badges')}
            activeOpacity={0.7}>
            <Text style={[styles.tabText, activeTab === 'badges' && styles.tabTextActive]}>
              Badges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rewards' && styles.tabActive]}
            onPress={() => setActiveTab('rewards')}
            activeOpacity={0.7}>
            <Text style={[styles.tabText, activeTab === 'rewards' && styles.tabTextActive]}>
              Rewards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
            onPress={() => setActiveTab('achievements')}
            activeOpacity={0.7}>
            <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {getCurrentData().map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => {
                setSelectedItem(item);
                setShowDetailModal(true);
              }}
              activeOpacity={0.8}>
              <View style={styles.imageContainer}>
                {item.locked && (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}
                <Image source={item.image} style={[styles.image, item.locked && styles.imageLocked]} resizeMode="contain" />
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {selectedItem && (
              <>
                <View style={styles.modalImageContainer}>
                  {selectedItem.locked && (
                    <View style={styles.modalLockOverlay}>
                      <Text style={styles.modalLockIcon}>🔒</Text>
                    </View>
                  )}
                  <Image 
                    source={selectedItem.image} 
                    style={[styles.modalImage, selectedItem.locked && styles.imageLocked]} 
                    resizeMode="contain" 
                  />
                </View>

                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                
                <View style={[styles.statusBadge, selectedItem.locked ? styles.statusLocked : styles.statusUnlocked]}>
                  <Text style={styles.statusText}>
                    {selectedItem.locked ? '🔒 Locked' : '✅ Unlocked'}
                  </Text>
                </View>

                <Text style={styles.modalDescription}>{selectedItem.description}</Text>

                <View style={styles.unlockSection}>
                  <Text style={styles.unlockTitle}>
                    {selectedItem.locked ? 'How to Unlock:' : 'You unlocked this by:'}
                  </Text>
                  <Text style={styles.unlockCondition}>{selectedItem.unlockCondition}</Text>
                </View>

                {selectedItem.locked && (
                  <TouchableOpacity 
                    style={styles.motivationButton} 
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowDetailModal(false);
                      navigation.goBack();
                    }}>
                    <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.motivationGradient} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
                      <Text style={styles.motivationButtonText}>Start Working Towards This! 💪</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </>
            )}
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  tabTextActive: {
    opacity: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
    zIndex: 1,
  },
  lockIcon: {
    fontSize: 20,
  },
  imageLocked: {
    opacity: 0.6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  modalImageContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
    position: 'relative',
  },
  modalLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    zIndex: 1,
  },
  modalLockIcon: {
    fontSize: 48,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusLocked: {
    backgroundColor: '#E74C3C',
  },
  statusUnlocked: {
    backgroundColor: '#27AE60',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  unlockSection: {
    width: '100%',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  unlockTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  unlockCondition: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  motivationButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  motivationGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  motivationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
