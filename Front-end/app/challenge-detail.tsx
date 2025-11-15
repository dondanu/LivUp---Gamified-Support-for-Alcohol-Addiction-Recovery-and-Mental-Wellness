import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ArrowLeft, Target, Star, Zap, Award, Play } from 'lucide-react-native';
import { Challenge } from '@/types/database.types';

export default function ChallengeDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Get challenge from route params
  const challenge = route.params?.challenge as Challenge;

  if (!challenge) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Challenge not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return ['#4ECDC4', '#44A08D'];
      case 'medium':
        return ['#F39C12', '#E67E22'];
      case 'hard':
        return ['#E74C3C', '#C0392B'];
      default:
        return ['#95A5A6', '#7F8C8D'];
    }
  };

  const handleStartChallenge = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      await api.acceptChallenge(challenge.id);
      Alert.alert(
        'Challenge Started! 🎉',
        `You've accepted "${challenge.title}". Complete it to earn ${challenge.points_reward} points!`,
        [
          {
            text: 'OK',
            onPress: () => {
              refreshProfile();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error starting challenge:', error);
      Alert.alert('Error', error.message || 'Failed to start challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getDifficultyColor(challenge.difficulty || 'Easy') as [string, string]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Target size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>{challenge.title}</Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{challenge.difficulty || 'Easy'}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.pointsCard}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.pointsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Star size={32} color="#FFFFFF" />
            <Text style={styles.pointsValue}>{challenge.points_reward}</Text>
            <Text style={styles.pointsLabel}>Points Reward</Text>
          </LinearGradient>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>About This Challenge</Text>
          <Text style={styles.descriptionText}>{challenge.description || 'No description available'}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Award size={24} color="#4ECDC4" />
              <Text style={styles.infoLabel}>Difficulty</Text>
              <Text style={styles.infoValue}>{challenge.difficulty || 'Easy'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Zap size={24} color="#F39C12" />
              <Text style={styles.infoLabel}>Points</Text>
              <Text style={styles.infoValue}>{challenge.points_reward}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>💡 Tips</Text>
          <Text style={styles.tipText}>• Take your time to complete this challenge</Text>
          <Text style={styles.tipText}>• You can track your progress in the Track tab</Text>
          <Text style={styles.tipText}>• Complete it to earn points and level up!</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, loading && styles.startButtonDisabled]}
          onPress={handleStartChallenge}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Play size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Challenge</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  pointsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  pointsGradient: {
    padding: 24,
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  pointsLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 4,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 22,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    backgroundColor: '#4ECDC4',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

