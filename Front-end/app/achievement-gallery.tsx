import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Image,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Award, Share2, Lock } from 'lucide-react-native';
import { api } from '@/lib/api';
import { UserBadge } from '@/types/database.types';

// Import badge images with PERFECT backend matching
// Each badge now has exact backend achievement name for 100% accurate matching
const BADGE_IMAGES = [
  { id: 1, name: 'Surprise Visit', image: require('@/assets/images/rewards/badges/suprise visit-Photoroom.png'), category: 'tasks', locked: true, backendName: 'Surprise Visit' },
  { id: 2, name: 'Trade Your Star', image: require('@/assets/images/rewards/badges/trade your star-Photoroom.png'), category: 'tasks', locked: true, backendName: 'Trade Your Star' },
  { id: 3, name: 'First Fifty', image: require('@/assets/images/rewards/badges/first fifty-Photoroom.png'), category: 'milestones', locked: true, backendName: 'First Fifty Points' },
  { id: 4, name: 'Gold Circle', image: require('@/assets/images/rewards/badges/gold circle-Photoroom.png'), category: 'milestones', locked: true, backendName: 'Gold Circle Champion' },
  { id: 5, name: 'Silver Circle', image: require('@/assets/images/rewards/badges/silver circle-Photoroom.png'), category: 'milestones', locked: true, backendName: 'Silver Circle Achiever' },
  { id: 6, name: 'Level 2', image: require('@/assets/images/rewards/badges/level 2-Photoroom.png'), category: 'milestones', locked: true, backendName: 'Level 2 Warrior' },
  { id: 7, name: 'Top 10', image: require('@/assets/images/rewards/badges/top 10-Photoroom.png'), category: 'special', locked: true, backendName: 'Top 10 Performer' },
  { id: 8, name: '5 Days Strong', image: require('@/assets/images/rewards/badges/5 days-Photoroom.png'), category: 'streak', locked: true, backendName: '5 Days Strong' },
  { id: 9, name: '3 Star Champion', image: require('@/assets/images/rewards/badges/3 star-Photoroom.png'), category: 'tasks', locked: true, backendName: '3 Star Champion' },
  { id: 10, name: 'Success', image: require('@/assets/images/rewards/rewards/success-Photoroom.png'), category: 'tasks', locked: true, backendName: 'Success Milestone' },
  { id: 11, name: 'Rock Solid', image: require('@/assets/images/rewards/rewards/rock-Photoroom.png'), category: 'streak', locked: true, backendName: 'Rock Solid Foundation' },
  { id: 12, name: 'Real Gladiator', image: require('@/assets/images/rewards/rewards/real gladiator-Photoroom.png'), category: 'tasks', locked: true, backendName: 'Real Gladiator' },
  { id: 13, name: 'Really Fast', image: require('@/assets/images/rewards/rewards/really fast-Photoroom.png'), category: 'tasks', locked: true, backendName: 'Really Fast Progress' },
  { id: 14, name: 'Moving Fast', image: require('@/assets/images/rewards/rewards/moving fast-Photoroom.png'), category: 'tasks', locked: true, backendName: 'Moving Fast Forward' },
  { id: 15, name: 'On Fire', image: require('@/assets/images/rewards/rewards/on fire-Photoroom.png'), category: 'streak', locked: true, backendName: 'On Fire Streak' },
  { id: 16, name: 'Be Smart', image: require('@/assets/images/rewards/rewards/be smart-Photoroom.png'), category: 'tasks', locked: true, backendName: 'Be Smart Choices' },
  { id: 17, name: '24/7 Warrior', image: require('@/assets/images/rewards/rewards/24by7-Photoroom.png'), category: 'streak', locked: true, backendName: '24/7 Warrior' },
  { id: 18, name: 'Achievement Map', image: require('@/assets/images/rewards/achievements/achevment map-Photoroom.png'), category: 'special', locked: true, backendName: 'Achievement Map Master' },
  { id: 19, name: 'Spending Score', image: require('@/assets/images/rewards/achievements/spending score-Photoroom.png'), category: 'special', locked: true, backendName: 'Spending Score Saver' },
  { id: 20, name: 'Treasures', image: require('@/assets/images/rewards/achievements/treasures-Photoroom.png'), category: 'milestones', locked: true, backendName: 'Treasures Collector' },
  { id: 21, name: 'Top Shooter', image: require('@/assets/images/rewards/achievements/top shooter-Photoroom.png'), category: 'tasks', locked: true, backendName: 'Top Shooter' },
  { id: 22, name: 'Quiz Master', image: require('@/assets/images/rewards/achievements/quiz compleated-Photoroom.png'), category: 'tasks', locked: true, backendName: 'Quiz Master' },
  { id: 23, name: 'Gambler No More', image: require('@/assets/images/rewards/achievements/gambler-Photoroom.png'), category: 'special', locked: true, backendName: 'Gambler No More' },
  { id: 24, name: 'Level Up Master', image: require('@/assets/images/rewards/achievements/level up-Photoroom.png'), category: 'milestones', locked: true, backendName: 'Level Up Master' },
  { id: 25, name: 'Distance Covered', image: require('@/assets/images/rewards/achievements/distance covered-Photoroom.png'), category: 'streak', locked: true, backendName: 'Distance Covered' },
];

export default function AchievementGalleryScreen() {
  const navigation = useNavigation();
  const [backendAchievements, setBackendAchievements] = useState<UserBadge[]>([]);
  const [allBackendAchievements, setAllBackendAchievements] = useState<any[]>([]); // All achievements (earned + locked)
  const [frontendBadges, setFrontendBadges] = useState(BADGE_IMAGES);
  const [unmatchedBackendAchievements, setUnmatchedBackendAchievements] = useState<UserBadge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'streak', name: 'Streak', icon: '🔥' },
    { id: 'tasks', name: 'Tasks', icon: '✅' },
    { id: 'milestones', name: 'Milestones', icon: '🎯' },
    { id: 'special', name: 'Special', icon: '⭐' },
  ];

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      // Fetch user's earned achievements
      const profileResponse = await api.getGamificationProfile();
      
      // Fetch ALL achievements (earned + locked) for unlock conditions
      const allAchievementsResponse = await api.getAchievements();
      
      if (profileResponse?.achievements) {
        setBackendAchievements(profileResponse.achievements);
      }
      
      if (allAchievementsResponse?.achievements) {
        setAllBackendAchievements(allAchievementsResponse.achievements);
        
        // Create a copy of frontend badges to update
        const updatedBadges = BADGE_IMAGES.map(badge => ({ ...badge }));
        const matchedBackendIds = new Set<number>();
        
        // PERFECT MATCHING: Match by exact backend achievement name
        profileResponse.achievements.forEach((achievement: UserBadge) => {
          const achievementName = (achievement.achievement_name || achievement.name || '').trim();
          
          // Check if this backend achievement has earned_at date (unlocked)
          const isUnlocked = achievement.earned_at != null;
          
          // Match backend achievements to frontend badges by EXACT name
          updatedBadges.forEach(badge => {
            if (badge.backendName === achievementName && isUnlocked) {
              badge.locked = false;
              matchedBackendIds.add(achievement.id);
            }
          });
        });
        
        // Find backend achievements that don't match any frontend badge
        // (This should be ZERO if SQL migration was run correctly)
        const unmatched = profileResponse.achievements.filter(
          (achievement: UserBadge) => !matchedBackendIds.has(achievement.id)
        );
        
        setFrontendBadges(updatedBadges);
        setUnmatchedBackendAchievements(unmatched);
      }
    } catch (error) {
      console.log('[AchievementGallery] Backend API not ready, using frontend badges only');
      setBackendAchievements([]);
      setAllBackendAchievements([]);
      setUnmatchedBackendAchievements([]);
    }
  };

  const getFilteredBadges = () => {
    let filtered = frontendBadges;
    
    if (selectedCategory !== 'all') {
      filtered = frontendBadges.filter(badge => badge.category === selectedCategory);
    }
    
    // Sort: Unlocked badges first, then locked badges
    return filtered.sort((a, b) => {
      if (a.locked === b.locked) return 0; // Same status, keep original order
      return a.locked ? 1 : -1; // Unlocked (false) comes first
    });
  };

  const getFilteredUnmatchedAchievements = () => {
    // Unmatched backend achievements are shown in 'all' and 'special' categories
    let unmatched = [];
    
    if (selectedCategory === 'all' || selectedCategory === 'special') {
      unmatched = unmatchedBackendAchievements;
    }
    
    // Sort: Unlocked achievements first, then locked
    return unmatched.sort((a, b) => {
      const aLocked = a.earned_at == null;
      const bLocked = b.earned_at == null;
      if (aLocked === bLocked) return 0;
      return aLocked ? 1 : -1; // Unlocked comes first
    });
  };

  const getUnlockCondition = (requirement_type: string, requirement_value: number) => {
    switch (requirement_type) {
      case 'points':
        return `Earn ${requirement_value} total points`;
      case 'tasks_completed':
        return `Complete ${requirement_value} challenges`;
      case 'streak':
        return `Maintain ${requirement_value} consecutive days with 0 drinks`;
      case 'days_sober':
        return `Log ${requirement_value} total days with 0 drinks`;
      default:
        return 'Complete the requirement to unlock';
    }
  };

  const unlockedCount = frontendBadges.filter(b => !b.locked).length + unmatchedBackendAchievements.filter(a => a.earned_at != null).length;
  const totalCount = frontendBadges.length + unmatchedBackendAchievements.length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievement Gallery</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipSelected,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round((unlockedCount / totalCount) * 100)}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(unlockedCount / totalCount) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{unlockedCount} of {totalCount} unlocked</Text>
        </View>

        {/* Achievement Grid */}
        <View style={styles.achievementGrid}>
          {/* Frontend Badges (with images) */}
          {getFilteredBadges().map((badge) => (
            <TouchableOpacity
              key={`frontend-${badge.id}`}
              style={styles.achievementCard}
              onPress={() => {
                // Get backend achievement data for unlock conditions
                // First try to find in earned achievements, then in all achievements
                const earnedAch = backendAchievements.find(
                  a => (a.achievement_name || a.name) === badge.backendName
                );
                const allAch = allBackendAchievements.find(
                  a => (a.achievement_name || a.name) === badge.backendName
                );
                
                // Use earned achievement data if available, otherwise use all achievements data
                const backendAch = earnedAch || allAch;
                
                setSelectedBadge({
                  ...badge,
                  description: backendAch?.description || (badge.locked 
                    ? 'Complete challenges and tasks to unlock this badge!' 
                    : 'Congratulations! You have unlocked this badge!'),
                  requirement_type: backendAch?.requirement_type,
                  requirement_value: backendAch?.requirement_value,
                  points_reward: backendAch?.points_reward,
                  earnedDate: earnedAch?.earned_at, // Only show earned date if actually earned
                });
                setShowDetailModal(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.imageContainer}>
                {badge.locked && (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}
                <Image 
                  source={badge.image} 
                  style={[styles.badgeImage, badge.locked && styles.badgeImageLocked]} 
                  resizeMode="contain" 
                />
              </View>
              <Text style={styles.badgeName} numberOfLines={2}>{badge.name}</Text>
              {!badge.locked && <Text style={styles.earnedBadge}>✅ Unlocked</Text>}
            </TouchableOpacity>
          ))}

          {/* Unmatched Backend Achievements (from API) */}
          {getFilteredUnmatchedAchievements().map((achievement) => {
            const isLocked = achievement.earned_at == null;
            return (
              <TouchableOpacity
                key={`backend-${achievement.id}`}
                style={styles.achievementCard}
                onPress={() => {
                  // Find full achievement data from all achievements
                  const fullAchData = allBackendAchievements.find(
                    a => a.id === achievement.id
                  );
                  
                  setSelectedBadge({
                    id: achievement.id,
                    name: achievement.achievement_name || achievement.name,
                    image: null, // No image for backend achievements
                    locked: isLocked,
                    category: 'special',
                    description: fullAchData?.description || achievement.description || (isLocked ? 'Keep working to unlock this achievement!' : 'You have earned this achievement!'),
                    requirement_type: fullAchData?.requirement_type,
                    requirement_value: fullAchData?.requirement_value,
                    points_reward: fullAchData?.points_reward,
                    earnedDate: achievement.earned_at,
                  });
                  setShowDetailModal(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.imageContainer}>
                  {isLocked && (
                    <View style={styles.lockBadge}>
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  )}
                  <View style={[styles.backendBadgeIcon, isLocked && styles.badgeImageLocked]}>
                    <Text style={styles.backendBadgeEmoji}>🏆</Text>
                  </View>
                </View>
                <Text style={styles.badgeName} numberOfLines={2}>
                  {achievement.achievement_name || achievement.name}
                </Text>
                {!isLocked && <Text style={styles.earnedBadge}>✅ Unlocked</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={showDetailModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {selectedBadge && (
              <>
                <View style={styles.modalImageContainer}>
                  {selectedBadge.locked && (
                    <View style={styles.modalLockOverlay}>
                      <Text style={styles.modalLockIcon}>🔒</Text>
                    </View>
                  )}
                  {selectedBadge.image ? (
                    <Image 
                      source={selectedBadge.image} 
                      style={[styles.modalImage, selectedBadge.locked && styles.badgeImageLocked]} 
                      resizeMode="contain" 
                    />
                  ) : (
                    <View style={styles.backendBadgeIconLarge}>
                      <Text style={styles.backendBadgeEmojiLarge}>🏆</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.modalTitle}>{selectedBadge.name}</Text>
                
                <View style={[styles.statusBadge, selectedBadge.locked ? styles.statusLocked : styles.statusUnlocked]}>
                  <Text style={styles.statusText}>
                    {selectedBadge.locked ? '🔒 Locked' : '✅ Unlocked'}
                  </Text>
                </View>

                {selectedBadge.description && (
                  <Text style={styles.modalDescription}>{selectedBadge.description}</Text>
                )}

                {/* Show unlock condition for locked badges */}
                {selectedBadge.locked && selectedBadge.requirement_type && (
                  <View style={styles.unlockSection}>
                    <Text style={styles.unlockTitle}>How to Unlock:</Text>
                    <Text style={styles.unlockCondition}>
                      {getUnlockCondition(selectedBadge.requirement_type, selectedBadge.requirement_value)}
                    </Text>
                    {selectedBadge.points_reward && (
                      <Text style={styles.rewardText}>
                        Reward: +{selectedBadge.points_reward} points 🪙
                      </Text>
                    )}
                  </View>
                )}

                {selectedBadge.earnedDate && (
                  <Text style={styles.earnedDate}>
                    Earned: {new Date(selectedBadge.earnedDate).toLocaleDateString()}
                  </Text>
                )}

                {selectedBadge.category && (
                  <Text style={styles.modalCategory}>Category: {selectedBadge.category}</Text>
                )}

                {selectedBadge.locked && (
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
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  categoryChipSelected: {
    backgroundColor: '#667EEA',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
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
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
    zIndex: 1,
  },
  lockIcon: {
    fontSize: 16,
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
  badgeImageLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  earnedBadge: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: 'bold',
    marginTop: 4,
  },
  backendBadgeIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#FFD700',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backendBadgeEmoji: {
    fontSize: 40,
  },
  backendBadgeIconLarge: {
    width: 120,
    height: 120,
    backgroundColor: '#FFD700',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backendBadgeEmojiLarge: {
    fontSize: 60,
  },
  earnedDate: {
    fontSize: 12,
    color: '#27AE60',
    marginBottom: 12,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667EEA',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
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
    width: 120,
    height: 120,
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
    fontSize: 40,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontSize: 20,
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
  modalCategory: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
    textTransform: 'capitalize',
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
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: 'bold',
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
