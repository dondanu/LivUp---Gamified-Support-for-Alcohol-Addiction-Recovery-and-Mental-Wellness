import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface ChallengeRewardModalProps {
  visible: boolean;
  challengeName: string;
  points: number;
  multiplier: string;
  challengeEmoji?: string; // Add emoji prop
  onClaimReward: () => void;
  onClose: () => void;
}

export default function ChallengeRewardModal({
  visible,
  challengeName,
  points,
  multiplier,
  challengeEmoji = '🎯', // Default emoji
  onClaimReward,
  onClose,
}: ChallengeRewardModalProps) {
  const [showCongrats, setShowCongrats] = useState(false);

  const handleClaimReward = () => {
    setShowCongrats(true);
  };

  const handleClose = () => {
    setShowCongrats(false);
    onClose();
  };

  const handleInviteFriends = () => {
    // Close modal and trigger the actual claim
    onClaimReward();
    handleClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {!showCongrats ? (
          // Step 1: Reward Screen
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.rewardContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            {/* Multiplier Badge */}
            <View style={styles.multiplierBadge}>
              <Text style={styles.multiplierText}>{multiplier} Boost</Text>
            </View>

            {/* Badge with Challenge Emoji */}
            <View style={styles.badgeContainer}>
              {/* Red glow background */}
              <View style={styles.badgeGlow} />
              
              {/* Flags BEHIND the badge - render first with lower z-index */}
              <View style={styles.flagsContainer}>
                <Text style={styles.badgeFlag1}>🏁</Text>
                <Text style={styles.badgeFlag2}>🏁</Text>
              </View>
              
              {/* Stars around badge */}
              <View style={styles.starsContainer}>
                <Text style={styles.badgeStar1}>⭐</Text>
                <Text style={styles.badgeStar2}>⭐</Text>
                <Text style={styles.badgeStar3}>✨</Text>
                <Text style={styles.badgeStar4}>✨</Text>
              </View>
              
              {/* Badge shape - circular medal (on top of flags) */}
              <View style={styles.badgeOuter}>
                <View style={styles.badgeMiddle}>
                  {/* Star-burst scalloped blue circle */}
                  <View style={styles.scallopedCircle}>
                    {/* Create 36 star points around the circle */}
                    {[...Array(36)].map((_, i) => {
                      const angle = (i * 10) * Math.PI / 180;
                      const radius = 42;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      return (
                        <View
                          key={i}
                          style={[
                            styles.starPoint,
                            {
                              left: 55 + x - 5,
                              top: 55 + y - 5,
                              transform: [{ rotate: `${i * 10 + 90}deg` }],
                            }
                          ]}
                        />
                      );
                    })}
                  </View>
                  <View style={styles.badgeInner}>
                    {/* Challenge specific emoji */}
                    <Text style={styles.badgeEmoji}>{challengeEmoji}</Text>
                  </View>
                </View>
              </View>
              
              {/* Badge ribbon with V-notch */}
              <View style={styles.ribbonContainer}>
                <View style={styles.ribbonLeft} />
                <View style={styles.ribbonRight} />
                <View style={styles.ribbonTriangleLeft} />
                <View style={styles.ribbonTriangleRight} />
              </View>
            </View>

            {/* Points Badge */}
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsValue}>{points} 🪙</Text>
            </View>

            {/* Title */}
            <Text style={styles.rewardTitle}>Prize Drawing</Text>

            {/* Claim Button */}
            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleClaimReward}
              activeOpacity={0.8}>
              <Text style={styles.claimButtonText}>Claim Reward</Text>
            </TouchableOpacity>

            {/* Challenge Completed Text */}
            <Text style={styles.completedTitle}>Challenge Completed</Text>
            <Text style={styles.completedSubtitle}>{challengeName}</Text>
          </LinearGradient>
        ) : (
          // Step 2: Congratulations Screen
          <View style={styles.congratsContainer}>
            {/* Confetti */}
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.confetti,
                  {
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#FF8E53'][i % 5],
                    transform: [{ rotate: `${Math.random() * 360}deg` }],
                  },
                ]}
              />
            ))}

            {/* Header */}
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={styles.congratsHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.congratsHeaderTitle}>Congratulations</Text>
              <View style={styles.menuButton}>
                <Text style={styles.menuButtonText}>☰</Text>
              </View>
            </LinearGradient>

            {/* Content */}
            <View style={styles.congratsContent}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                style={styles.congratsCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                {/* Multiplier Badge */}
                <View style={styles.congratsMultiplierBadge}>
                  <Text style={styles.multiplierText}>{multiplier} Boost</Text>
                </View>

                {/* Badge with Challenge Emoji */}
                <View style={styles.congratsBadgeContainer}>
                  {/* Red glow background */}
                  <View style={styles.badgeGlow} />
                  
                  {/* Flags BEHIND the badge - render first with lower z-index */}
                  <View style={styles.flagsContainer}>
                    <Text style={styles.badgeFlag1}>🏁</Text>
                    <Text style={styles.badgeFlag2}>🏁</Text>
                  </View>
                  
                  {/* Stars around badge */}
                  <View style={styles.starsContainer}>
                    <Text style={styles.badgeStar1}>⭐</Text>
                    <Text style={styles.badgeStar2}>⭐</Text>
                    <Text style={styles.badgeStar3}>✨</Text>
                    <Text style={styles.badgeStar4}>✨</Text>
                  </View>
                  
                  {/* Badge shape - on top of flags */}
                  <View style={styles.badgeOuter}>
                    <View style={styles.badgeMiddle}>
                      {/* Star-burst scalloped blue circle */}
                      <View style={styles.scallopedCircle}>
                        {/* Create 36 star points around the circle */}
                        {[...Array(36)].map((_, i) => {
                          const angle = (i * 10) * Math.PI / 180;
                          const radius = 42;
                          const x = Math.cos(angle) * radius;
                          const y = Math.sin(angle) * radius;
                          return (
                            <View
                              key={i}
                              style={[
                                styles.starPoint,
                                {
                                  left: 55 + x - 5,
                                  top: 55 + y - 5,
                                  transform: [{ rotate: `${i * 10 + 90}deg` }],
                                }
                              ]}
                            />
                          );
                        })}
                      </View>
                      <View style={styles.badgeInner}>
                        <Text style={styles.badgeEmoji}>{challengeEmoji}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Badge ribbon with V-notch */}
                  <View style={styles.ribbonContainer}>
                    <View style={styles.ribbonLeft} />
                    <View style={styles.ribbonRight} />
                    <View style={styles.ribbonTriangleLeft} />
                    <View style={styles.ribbonTriangleRight} />
                  </View>
                </View>

                {/* Congratulations Text */}
                <Text style={styles.congratsTitle}>Congratulations!!</Text>
                <Text style={styles.congratsSubtitle}>You've won something cool! ✨</Text>
                <Text style={styles.congratsReward}>{points} points earned</Text>
                <Text style={styles.congratsChallenge}>{challengeName}</Text>
              </LinearGradient>

              {/* Invite Button */}
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={handleInviteFriends}
                activeOpacity={0.8}>
                <Text style={styles.inviteButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Reward Screen Styles
  rewardContainer: {
    width: '90%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  multiplierBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  multiplierText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  // Badge Styles (replaces trophy)
  badgeContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
    position: 'relative',
    height: 200,
    justifyContent: 'center',
  },
  flagsContainer: {
    position: 'absolute',
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  badgeGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#FF4444',
    opacity: 0.25,
    zIndex: 0,
  },
  badgeOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 2,
    borderWidth: 8,
    borderColor: '#C0392B',
  },
  badgeMiddle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F39C12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E67E22',
    position: 'relative',
  },
  scallopedCircle: {
    position: 'absolute',
    width: 110,
    height: 110,
    zIndex: 1,
  },
  starPoint: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#177abcff',
  },
  badgeInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#177abcff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#177abcff',
    zIndex: 2,
  },
  badgeEmoji: {
    fontSize: 40,
    backgroundColor: '#FFFFFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 60,
  },
  ribbonContainer: {
    alignItems: 'center',
    marginTop: -25,
    zIndex: 1,
    width: 42,
    height: 45,
  },
  ribbonLeft: {
    width: 25,
    height: 60,
    backgroundColor: '#4ECDC4',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  ribbonRight: {
    width: 25,
    height: 60,
    backgroundColor: '#4ECDC4',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  ribbonTriangleLeft: {
    position: 'absolute',
    left: 0,
    top: 55,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 0,
    borderRightWidth: 25,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#4ECDC4',
  },
  ribbonTriangleRight: {
    position: 'absolute',
    right: 0,
    top: 55,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 25,
    borderRightWidth: 0,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#4ECDC4',
  },
  badgeFlag1: {
    position: 'absolute',
    left: 15,
    top: 50,
    fontSize: 50,
     transform: [
    { scaleX: -1 },   // horizontal flip
    { rotate: '35deg' },
  ],
  },
  badgeFlag2: {
    position: 'absolute',
    right: 15,
    top: 50,
    fontSize: 50,
    transform: [{ rotate: '35deg' }],
  },
  badgeStar1: {
    position: 'absolute',
    top: -5,
    right: 20,
    fontSize: 32,
  },
  badgeStar2: {
    position: 'absolute',
    bottom: 5,
    left: 20,
    fontSize: 28,
  },
  badgeStar3: {
    position: 'absolute',
    top: 10,
    left: 5,
    fontSize: 24,
  },
  badgeStar4: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    fontSize: 26,
  },
  pointsBadge: {
    backgroundColor: '#3bb46dff',
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: 18,
    marginBottom: 11,
    marginTop:11,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 24,
  },
  claimButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  claimButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  // Congratulations Screen Styles
  congratsContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 20,
    borderRadius: 2,
  },
  congratsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
  congratsHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  congratsContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  congratsCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  congratsMultiplierBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  congratsBadgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    height: 200,
    justifyContent: 'center',
  },
  decorationsContainer: {
    position: 'absolute',
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  congratsSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  congratsReward: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  congratsChallenge: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  inviteButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inviteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
