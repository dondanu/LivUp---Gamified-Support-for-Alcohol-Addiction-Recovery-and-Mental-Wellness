import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Award, Star, Trophy, Calendar } from 'lucide-react-native';

interface ConversionPromptProps {
  visible: boolean;
  milestoneType: 'first_achievement' | 'first_challenge' | 'points_150' | 'usage_3_days' | 'usage_7_days';
  milestoneData: {
    achievementName?: string;
    challengeName?: string;
    pointsEarned?: number;
    totalPoints?: number;
    daysUsed?: number;
  };
  onDismiss: () => void;
  onConvert: () => void;
}

const ConversionPrompt: React.FC<ConversionPromptProps> = ({
  visible,
  milestoneType,
  milestoneData,
  onDismiss,
  onConvert,
}) => {
  const getMilestoneContent = () => {
    switch (milestoneType) {
      case 'first_achievement':
        return {
          icon: <Trophy size={64} color="#FFD700" />,
          title: '🎉 First Achievement Unlocked!',
          message: `You just earned "${milestoneData.achievementName}"!`,
          subtitle: `+${milestoneData.pointsEarned} points`,
        };
      case 'first_challenge':
        return {
          icon: <Award size={64} color="#4ECDC4" />,
          title: '💪 First Challenge Complete!',
          message: `You completed "${milestoneData.challengeName}"!`,
          subtitle: `+${milestoneData.pointsEarned} points`,
        };
      case 'points_150':
        return {
          icon: <Star size={64} color="#FF6B6B" />,
          title: '⭐ Amazing Progress!',
          message: `You've earned ${milestoneData.totalPoints} points!`,
          subtitle: 'You\'re on fire!',
        };
      case 'usage_3_days':
        return {
          icon: <Calendar size={64} color="#45B7D1" />,
          title: '🔥 3-Day Streak!',
          message: 'You\'ve been using the app for 3 days!',
          subtitle: 'Keep up the momentum!',
        };
      case 'usage_7_days':
        return {
          icon: <Calendar size={64} color="#9B59B6" />,
          title: '🚀 7-Day Streak!',
          message: 'A whole week of progress!',
          subtitle: 'You\'re building a habit!',
        };
      default:
        return {
          icon: <Star size={64} color="#FFD700" />,
          title: '🎊 Milestone Reached!',
          message: 'You\'re making great progress!',
          subtitle: 'Keep going!',
        };
    }
  };

  const content = getMilestoneContent();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            {content.icon}
          </View>

          {/* Title */}
          <Text style={styles.title}>{content.title}</Text>

          {/* Message */}
          <Text style={styles.message}>{content.message}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Benefits */}
          <Text style={styles.benefitsTitle}>Don't Lose Your Progress!</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefit}>✓ Save your progress</Text>
            <Text style={styles.benefit}>✓ Backup your data</Text>
            <Text style={styles.benefit}>✓ Sync across devices</Text>
            <Text style={styles.benefit}>✓ Never lose your streak</Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.convertButton}
            onPress={onConvert}
          >
            <Text style={styles.convertButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={styles.dismissButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#ECF0F1',
    marginVertical: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 25,
  },
  benefit: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 8,
    paddingLeft: 10,
  },
  convertButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  convertButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dismissButton: {
    paddingVertical: 12,
  },
  dismissButtonText: {
    color: '#95A5A6',
    fontSize: 16,
  },
});

export default ConversionPrompt;
