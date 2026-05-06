import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Award, Share2, Lock } from 'lucide-react-native';
import { api } from '@/lib/api';
import { UserBadge } from '@/types/database.types';

export default function AchievementGalleryScreen() {
  const navigation = useNavigation();
  const [achievements, setAchievements] = useState<UserBadge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'streak', name: 'Streak', icon: '🔥' },
    { id: 'tasks', name: 'Tasks', icon: '✅' },
    { id: 'milestones', name: 'Milestones', icon: '🎯' },
    { id: 'special', name: 'Special', icon: '⭐' },
  ];

  const rarityColors = {
    common: '#95A5A6',
    rare: '#3498DB',
    epic: '#9B59B6',
    legendary: '#F39C12',
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await api.getGamificationProfile();
      if (response?.achievements) {
        setAchievements(response.achievements);
      }
    } catch (error) {
      console.log('[AchievementGallery] Using demo data (Backend API not ready)');
      // Use empty array for now - user will see "No achievements yet"
      setAchievements([]);
    }
  };

  const handleShare = async (achievement: UserBadge) => {
    try {
      await Share.share({
        message: `I just earned the "${achievement.achievement_name || achievement.name}" achievement! 🏆`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getRarityBadge = (rarity: string) => {
    const badges = {
      common: '⚪',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟡',
    };
    return badges[rarity as keyof typeof badges] || '⚪';
  };

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
            <Text style={styles.statValue}>{achievements.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>25</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round((achievements.length / 25) * 100)}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Achievement Grid */}
        <View style={styles.achievementGrid}>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementHeader}>
                <Award size={32} color="#FFD700" />
                <Text style={styles.rarityBadge}>{getRarityBadge('common')}</Text>
              </View>
              <Text style={styles.achievementName}>
                {achievement.achievement_name || achievement.name}
              </Text>
              <Text style={styles.achievementDescription} numberOfLines={2}>
                {achievement.description}
              </Text>
              <Text style={styles.achievementDate}>
                {new Date(achievement.earned_at).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => handleShare(achievement)}
              >
                <Share2 size={16} color="#667EEA" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Locked Achievements */}
          {[...Array(25 - achievements.length)].map((_, index) => (
            <View key={`locked-${index}`} style={[styles.achievementCard, styles.lockedCard]}>
              <View style={styles.achievementHeader}>
                <Lock size={32} color="#95A5A6" />
              </View>
              <Text style={styles.lockedText}>Locked</Text>
              <Text style={styles.lockedHint}>Keep going to unlock!</Text>
            </View>
          ))}
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
  placeholder: {
    width: 40,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: 60,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockedCard: {
    opacity: 0.6,
    backgroundColor: '#F5F7FA',
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rarityBadge: {
    fontSize: 16,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  achievementDate: {
    fontSize: 10,
    color: '#95A5A6',
    marginBottom: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667EEA',
    marginLeft: 4,
  },
  lockedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 8,
  },
  lockedHint: {
    fontSize: 11,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 4,
  },
});
