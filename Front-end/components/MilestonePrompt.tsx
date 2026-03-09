import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Trophy, Star } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_SHOWN_KEY = '@intro_shown';

interface MilestonePromptProps {
  visible: boolean;
  milestoneType: string;
  milestoneData: any;
  onDismiss: () => void;
}

const MilestonePrompt: React.FC<MilestonePromptProps> = ({
  visible,
  milestoneType,
  milestoneData,
  onDismiss,
}) => {
  const { signOut, setPendingNavigation } = useAuth();

  const getMilestoneContent = () => {
    const taskCount = milestoneData?.completedTasks || 0;
    
    switch (milestoneType) {
      case 'first_task':
        if (taskCount === 1) {
          return {
            icon: <Trophy size={64} color="#FFD700" />,
            title: '🎉 First Task Complete!',
            message: 'Amazing! You completed your first task!',
            subtitle: `You've earned ${milestoneData?.totalPoints || 0} points!`,
          };
        } else if (taskCount === 3) {
          return {
            icon: <Trophy size={64} color="#FF6B6B" />,
            title: '🔥 3 Tasks Complete!',
            message: 'You\'re on fire! Trial limit reached.',
            subtitle: `You've earned ${milestoneData?.totalPoints || 0} points total!`,
          };
        } else if (taskCount % 3 === 0) {
          return {
            icon: <Trophy size={64} color="#9B59B6" />,
            title: `🎯 ${taskCount} Tasks Complete!`,
            message: 'Incredible dedication!',
            subtitle: `You've earned ${milestoneData?.totalPoints || 0} points total!`,
          };
        }
        return {
          icon: <Trophy size={64} color="#FFD700" />,
          title: '🎉 Task Complete!',
          message: 'Great work!',
          subtitle: `You've earned ${milestoneData?.totalPoints || 0} points!`,
        };
      case 'points_150':
        return {
          icon: <Star size={64} color="#FF6B6B" />,
          title: '⭐ 150 Points Reached!',
          message: 'Incredible progress!',
          subtitle: `You've earned ${milestoneData?.totalPoints || 0} points!`,
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
  
  // Check if user has completed 3 or more tasks - if so, they MUST sign up or exit
  const completedTasks = milestoneData?.completedTasks || 0;
  const mustSignUp = completedTasks >= 3;

  const handleSignUp = async () => {
    onDismiss();
    setPendingNavigation('Register');
    await AsyncStorage.setItem(INTRO_SHOWN_KEY, 'true');
    await signOut();
  };

  const handleLogin = async () => {
    onDismiss();
    setPendingNavigation('Login');
    await AsyncStorage.setItem(INTRO_SHOWN_KEY, 'true');
    await signOut();
  };
  
  const handleExit = async () => {
    onDismiss();
    await signOut();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={mustSignUp ? undefined : onDismiss}
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

          {/* Call to Action */}
          <Text style={styles.ctaTitle}>
            {mustSignUp ? 'Trial Limit Reached!' : 'Save Your Progress!'}
          </Text>
          <Text style={styles.ctaText}>
            {mustSignUp 
              ? 'You\'ve completed 3 tasks! Create an account to continue using the app and save all your progress.'
              : 'Create an account to save your progress and never lose your achievements!'}
          </Text>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignUp}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>I Have an Account</Text>
          </TouchableOpacity>

          {mustSignUp ? (
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleExit}
            >
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
            >
              <Text style={styles.dismissButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          )}
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
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  signupButton: {
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
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  loginButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dismissButton: {
    paddingVertical: 12,
  },
  dismissButtonText: {
    color: '#95A5A6',
    fontSize: 16,
  },
  exitButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  exitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MilestonePrompt;
