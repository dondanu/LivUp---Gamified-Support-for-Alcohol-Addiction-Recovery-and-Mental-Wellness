import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Award, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Badge image mapping
const BADGE_IMAGES: { [key: string]: any } = {
  'Surprise Visit': require('@/assets/images/rewards/badges/suprise visit-Photoroom.png'),
  'Trade Your Star': require('@/assets/images/rewards/badges/trade your star-Photoroom.png'),
  'First Fifty Points': require('@/assets/images/rewards/badges/first fifty-Photoroom.png'),
  'Gold Circle Champion': require('@/assets/images/rewards/badges/gold circle-Photoroom.png'),
  'Silver Circle Achiever': require('@/assets/images/rewards/badges/silver circle-Photoroom.png'),
  'Level 2 Warrior': require('@/assets/images/rewards/badges/level 2-Photoroom.png'),
  'Top 10 Performer': require('@/assets/images/rewards/badges/top 10-Photoroom.png'),
  '5 Days Strong': require('@/assets/images/rewards/badges/5 days-Photoroom.png'),
  '3 Star Champion': require('@/assets/images/rewards/badges/3 star-Photoroom.png'),
  'Success Milestone': require('@/assets/images/rewards/rewards/success-Photoroom.png'),
  'Rock Solid Foundation': require('@/assets/images/rewards/rewards/rock-Photoroom.png'),
  'Real Gladiator': require('@/assets/images/rewards/rewards/real gladiator-Photoroom.png'),
  'Really Fast Progress': require('@/assets/images/rewards/rewards/really fast-Photoroom.png'),
  'Moving Fast Forward': require('@/assets/images/rewards/rewards/moving fast-Photoroom.png'),
  'On Fire Streak': require('@/assets/images/rewards/rewards/on fire-Photoroom.png'),
  'Be Smart Choices': require('@/assets/images/rewards/rewards/be smart-Photoroom.png'),
  '24/7 Warrior': require('@/assets/images/rewards/rewards/24by7-Photoroom.png'),
  'Achievement Map Master': require('@/assets/images/rewards/achievements/achevment map-Photoroom.png'),
  'Spending Score Saver': require('@/assets/images/rewards/achievements/spending score-Photoroom.png'),
  'Treasures Collector': require('@/assets/images/rewards/achievements/treasures-Photoroom.png'),
  'Top Shooter': require('@/assets/images/rewards/achievements/top shooter-Photoroom.png'),
  'Quiz Master': require('@/assets/images/rewards/achievements/quiz compleated-Photoroom.png'),
  'Gambler No More': require('@/assets/images/rewards/achievements/gambler-Photoroom.png'),
  'Level Up Master': require('@/assets/images/rewards/achievements/level up-Photoroom.png'),
  'Distance Covered': require('@/assets/images/rewards/achievements/distance covered-Photoroom.png'),
};

interface Achievement {
  achievement_name: string;
  description: string;
  points_reward: number;
}

interface Props {
  visible: boolean;
  achievement: Achievement | null;
  achievementNumber: number; // 1st, 2nd, 3rd, etc.
  onClose: () => void;
}

export default function AchievementUnlockedModal({ visible, achievement, achievementNumber, onClose }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const sparkleLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible && achievement) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      sparkleAnim.setValue(0);

      // Start animations
      const scaleAnimation = Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      });

      const rotateAnimation = Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      });

      sparkleLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      scaleAnimation.start();
      rotateAnimation.start();
      sparkleLoop.current.start();
    }

    // Cleanup function to stop animations when modal closes
    return () => {
      if (sparkleLoop.current) {
        sparkleLoop.current.stop();
      }
      scaleAnim.stopAnimation();
      rotateAnim.stopAnimation();
      sparkleAnim.stopAnimation();
    };
  }, [visible, achievement]);

  if (!achievement) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return num + 'st';
    if (j === 2 && k !== 12) return num + 'nd';
    if (j === 3 && k !== 13) return num + 'rd';
    return num + 'th';
  };

  const badgeImage = BADGE_IMAGES[achievement.achievement_name];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={['#667EEA', '#764BA2', '#F093FB']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Sparkles Background */}
            <Animated.View style={[styles.sparklesContainer, { opacity: sparkleOpacity }]}>
              <Text style={[styles.sparkle, { top: 20, left: 30 }]}>✨</Text>
              <Text style={[styles.sparkle, { top: 40, right: 40 }]}>⭐</Text>
              <Text style={[styles.sparkle, { top: 80, left: 50 }]}>💫</Text>
              <Text style={[styles.sparkle, { top: 100, right: 30 }]}>✨</Text>
              <Text style={[styles.sparkle, { bottom: 120, left: 40 }]}>⭐</Text>
              <Text style={[styles.sparkle, { bottom: 100, right: 50 }]}>💫</Text>
              <Text style={[styles.sparkle, { bottom: 80, left: 60 }]}>✨</Text>
              <Text style={[styles.sparkle, { bottom: 60, right: 60 }]}>⭐</Text>
            </Animated.View>

            {/* Content */}
            <View style={styles.content}>
              {/* Congratulations Text */}
              <Text style={styles.congratsText}>🎉 CONGRATULATIONS! 🎉</Text>
              <Text style={styles.subText}>You've earned your</Text>
              <Text style={styles.achievementNumber}>{getOrdinalSuffix(achievementNumber)}</Text>
              <Text style={styles.badgeTypeText}>Achievement!</Text>

              {/* Badge Image */}
              <Animated.View style={[styles.badgeContainer, { transform: [{ rotate }] }]}>
                {badgeImage ? (
                  <Image source={badgeImage} style={styles.badgeImage} resizeMode="contain" />
                ) : (
                  <View style={styles.defaultBadge}>
                    <Award size={80} color="#FFD700" />
                  </View>
                )}
              </Animated.View>

              {/* Achievement Name */}
              <Text style={styles.achievementName}>{achievement.achievement_name}</Text>

              {/* Description */}
              <Text style={styles.description}>{achievement.description}</Text>

              {/* Points Badge */}
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>+{achievement.points_reward} 🪙</Text>
              </View>

              {/* Claim Button */}
              <TouchableOpacity style={styles.claimButton} onPress={onClose} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500', '#FF8C00']}
                  style={styles.claimGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  <Text style={styles.claimButtonText}>CLAIM IT! 🎁</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  gradient: {
    padding: 30,
    paddingTop: 50,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sparklesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
  },
  content: {
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  achievementNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  badgeTypeText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 20,
  },
  badgeContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  badgeImage: {
    width: 150,
    height: 150,
  },
  defaultBadge: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  pointsBadge: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  claimButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  claimGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  claimButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
