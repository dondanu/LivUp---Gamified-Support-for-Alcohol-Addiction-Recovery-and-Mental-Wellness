import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Import images
const BADGES = [
  { id: 1, name: 'Surprise Visit', image: require('@/assets/images/rewards/badges/suprise visit-Photoroom.png') },
  { id: 2, name: 'Trade Your Star', image: require('@/assets/images/rewards/badges/trade your star-Photoroom.png') },
  { id: 3, name: 'First Fifty', image: require('@/assets/images/rewards/badges/first fifty-Photoroom.png') },
  { id: 4, name: 'Gold Circle', image: require('@/assets/images/rewards/badges/gold circle-Photoroom.png') },
  { id: 5, name: 'Silver Circle', image: require('@/assets/images/rewards/badges/silver circle-Photoroom.png') },
  { id: 6, name: 'Level 2', image: require('@/assets/images/rewards/badges/level 2-Photoroom.png') },
  { id: 7, name: 'Top 10', image: require('@/assets/images/rewards/badges/top 10-Photoroom.png') },
  { id: 8, name: '5 Days', image: require('@/assets/images/rewards/badges/5 days-Photoroom.png') },
  { id: 9, name: '3 Star', image: require('@/assets/images/rewards/badges/3 star-Photoroom.png') },
];

const REWARDS = [
  { id: 1, name: 'Success', image: require('@/assets/images/rewards/rewards/success-Photoroom.png') },
  { id: 2, name: 'Rock', image: require('@/assets/images/rewards/rewards/rock-Photoroom.png') },
  { id: 3, name: 'Real Gladiator', image: require('@/assets/images/rewards/rewards/real gladiator-Photoroom.png') },
  { id: 4, name: 'Really Fast', image: require('@/assets/images/rewards/rewards/really fast-Photoroom.png') },
  { id: 5, name: 'Moving Fast', image: require('@/assets/images/rewards/rewards/moving fast-Photoroom.png') },
  { id: 6, name: 'On Fire', image: require('@/assets/images/rewards/rewards/on fire-Photoroom.png') },
  { id: 7, name: 'Be Smart', image: require('@/assets/images/rewards/rewards/be smart-Photoroom.png') },
  { id: 8, name: '24/7', image: require('@/assets/images/rewards/rewards/24by7-Photoroom.png') },
];

const ACHIEVEMENTS = [
  { id: 1, name: 'Achievement Map', image: require('@/assets/images/rewards/achievements/achevment map-Photoroom.png') },
  { id: 2, name: 'Spending Score', image: require('@/assets/images/rewards/achievements/spending score-Photoroom.png') },
  { id: 3, name: 'Treasures', image: require('@/assets/images/rewards/achievements/treasures-Photoroom.png') },
  { id: 4, name: 'Top Shooter', image: require('@/assets/images/rewards/achievements/top shooter-Photoroom.png') },
  { id: 5, name: 'Quiz Completed', image: require('@/assets/images/rewards/achievements/quiz compleated-Photoroom.png') },
  { id: 6, name: 'Gambler', image: require('@/assets/images/rewards/achievements/gambler-Photoroom.png') },
  { id: 7, name: 'Level Up', image: require('@/assets/images/rewards/achievements/level up-Photoroom.png') },
  { id: 8, name: 'Distance Covered', image: require('@/assets/images/rewards/achievements/distance covered-Photoroom.png') },
  { id: 9, name: 'Friends Invited', image: require('@/assets/images/rewards/achievements/friends invited-Photoroom.png') },
  { id: 10, name: 'Time Online', image: require('@/assets/images/rewards/achievements/time online-Photoroom.png') },
  { id: 11, name: 'Game Points', image: require('@/assets/images/rewards/achievements/game points-Photoroom.png') },
];

export default function RewardsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'badges' | 'rewards' | 'achievements'>('badges');

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
            <View key={item.id} style={styles.card}>
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.image} resizeMode="contain" />
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
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
});
