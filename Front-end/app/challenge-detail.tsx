import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ArrowLeft, Target, Star, Zap, Award, Play, Clock, CheckCircle, X } from 'lucide-react-native';
import { Challenge } from '@/types/database.types';
import { getChallengeByTitle, getChallengeById, getChallengeIdFromTitle, ChallengeConfig } from '@/config/challenges';
import { anonymousStorage } from '@/lib/anonymousStorage';
import MilestonePrompt from '@/components/MilestonePrompt';

export default function ChallengeDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { profile, refreshProfile, isAnonymous, refreshAnonymousData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  // Milestone prompt state
  const [showMilestonePrompt, setShowMilestonePrompt] = useState(false);
  const [milestoneType, setMilestoneType] = useState('');
  const [milestoneData, setMilestoneData] = useState<any>(null);
  
  // Get challenge from route params
  const challenge = route.params?.challenge as Challenge;
  
  // Get challenge-specific config by matching title to ID
  const challengeTitle = challenge?.title || challenge?.task_name || '';
  const challengeId = challengeTitle ? getChallengeIdFromTitle(challengeTitle) : undefined;
  const challengeConfig: ChallengeConfig | undefined = challengeId 
    ? getChallengeById(challengeId)
    : challengeTitle
      ? getChallengeByTitle(challengeTitle)
      : undefined;

  // Quiz questions for "Learn Something New" challenge
  const quizQuestions = [
    {
      question: "What topic did you learn about today?",
      placeholder: "e.g., JavaScript programming, cooking techniques, meditation...",
    },
    {
      question: "What was the most interesting thing you discovered?",
      placeholder: "Share the key insight or fact you found fascinating...",
    },
    {
      question: "How can you apply what you learned in your daily life?",
      placeholder: "Describe a practical way to use this knowledge...",
    },
    {
      question: "What resource did you use to learn? (video, article, course, etc.)",
      placeholder: "e.g., YouTube tutorial, blog article, online course...",
    },
    {
      question: "On a scale of 1-10, how valuable was this learning experience and why?",
      placeholder: "Rate and explain what made it valuable or not...",
    },
  ];

  // Check if challenge is already completed today
  useEffect(() => {
    const checkCompletionStatus = async () => {
      if (isAnonymous) {
        // Anonymous mode - check local storage
        const anonData = await anonymousStorage.getData();
        if (anonData && challenge?.id) {
          const isCompleted = anonData.completedTasks.some(
            task => task.taskId === parseInt(challenge.id)
          );
          setIsCompleted(isCompleted);
        }
        setCheckingStatus(false);
        return;
      }
      
      if (!profile?.id || !challenge?.id) {
        setCheckingStatus(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const completedResponse = await api.getCompletedTasks();
        const completedToday = completedResponse.tasks?.some((task: any) => {
          if (!task.completion_date) return false;
          const completionDate = task.completion_date.split('T')[0];
          return task.task_id === parseInt(challenge.id) && completionDate === today;
        });
        setIsCompleted(completedToday || false);
      } catch (error) {
        console.error('Error checking completion status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkCompletionStatus();
  }, [profile, challenge, isAnonymous]);

  // Debug: Log when quiz modal state changes
  useEffect(() => {
    console.log('[Quiz] showQuiz changed to:', showQuiz);
    console.log('[Quiz] currentQuestion:', currentQuestion);
    if (showQuiz && quizQuestions.length > 0) {
      console.log('[Quiz] Current question:', quizQuestions[currentQuestion]);
    }
  }, [showQuiz, currentQuestion]);

  if (!challenge && !challengeConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Challenge not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Use config data if available, otherwise fall back to API challenge data
  const displayChallenge = challengeConfig || challenge;
  const title = challengeConfig?.title || challenge?.title || challenge?.task_name || 'Challenge';
  const description = challengeConfig?.description || challenge?.description || '';
  const difficulty = challengeConfig?.difficulty || challenge?.difficulty || 'Easy';
  const points = challengeConfig?.points || challenge?.points_reward || 0;
  const challengeApiId = challenge?.id || challengeId;

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
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

  const handleStartChallenge = () => {
    // Normalize challenge id from title
    const challengeIdNormalized = challengeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    if (challengeIdNormalized === 'music-therapy' || challengeIdNormalized === 'music therapy') {
      // Navigate to Music Therapy activity page
      navigation.navigate('MusicTherapyChallenge' as never, { challenge } as never);
    } else if (challengeIdNormalized === 'deep-breathing' || challengeIdNormalized === 'deep breathing') {
      // Navigate to Deep Breathing timed challenge
      navigation.navigate('DeepBreathingChallenge' as never, { challenge } as never);
    } else {
      // For other challenges, show instructions and allow completion
      Alert.alert(
        'Start Challenge',
        `Ready to start "${title}"? Follow the instructions and complete the challenge to earn ${points} points!`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start',
            onPress: () => {
              setIsStarted(true);
              Alert.alert(
                'Challenge Started! 🎯',
                'Follow the instructions above to complete this challenge. When finished, tap "Mark as Complete" to earn your points.',
                [{ text: 'Got it!' }]
              );
            },
          },
        ]
      );
    }
  };

  const handleCompleteChallenge = async () => {
    if (!challengeApiId) {
      Alert.alert('Error', 'Challenge ID not found');
      return;
    }

    // Check if this is "Learn Something New" challenge
    const isLearnChallenge = challengeTitle.toLowerCase().includes('learn something new');

    if (isLearnChallenge) {
      // Show quiz for Learn Something New challenge
      console.log('[Quiz] Showing quiz for Learn Something New challenge');
      console.log('[Quiz] Quiz questions:', quizQuestions);
      Alert.alert(
        'Quick Knowledge Check! 🧠',
        'Before earning your points, please answer 5 quick questions about what you learned. This helps reinforce your learning!',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Quiz',
            onPress: () => {
              console.log('[Quiz] Starting quiz...');
              setShowQuiz(true);
              setCurrentQuestion(0);
              setQuizAnswers([]);
              setCurrentAnswer('');
              console.log('[Quiz] Quiz state set, showQuiz:', true);
            },
          },
        ]
      );
    } else {
      // For other challenges, complete directly
      completeDirectly();
    }
  };

  const completeDirectly = async () => {
    if (!challengeApiId) return;

    Alert.alert(
      'Complete Challenge',
      `Have you completed "${title}"? You'll earn ${points} points!`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            setLoading(true);
            try {
              if (isAnonymous) {
                // Anonymous mode - save to local storage
                await anonymousStorage.addCompletedTask(
                  parseInt(challengeApiId.toString()),
                  title,
                  points
                );
                
                console.log('[Challenge Detail] Task added to anonymous storage');
                
                // Check for milestones
                const milestoneCheck = await anonymousStorage.checkMilestones();
                
                console.log('[Challenge Detail] Milestone check result:', milestoneCheck);
                
                setIsCompleted(true);
                setIsStarted(false);
                await refreshAnonymousData();
                
                // Show success alert FIRST, then milestone prompt
                Alert.alert(
                  'Congratulations! 🎉',
                  `You earned ${points} points! Keep up the great work!`,
                  [
                    {
                      text: 'Awesome!',
                      onPress: () => {
                        // After user clicks "Awesome!", show milestone prompt if needed
                        if (milestoneCheck.shouldPrompt) {
                          console.log('[Challenge Detail] Showing milestone prompt after success alert');
                          setMilestoneType(milestoneCheck.milestoneType || '');
                          setMilestoneData(milestoneCheck.milestoneData);
                          setShowMilestonePrompt(true);
                        } else {
                          console.log('[Challenge Detail] No milestone to show, navigating back');
                          navigation.goBack();
                        }
                      },
                    },
                  ]
                );
              } else {
                // Registered user - use API
                await api.completeTask(challengeApiId.toString());
                setIsCompleted(true);
                setIsStarted(false);
                await refreshProfile();
                
                Alert.alert(
                  'Congratulations! 🎉',
                  `You earned ${points} points! Keep up the great work!`,
                  [
                    {
                      text: 'Awesome!',
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              }
            } catch (error: any) {
              console.error('Error completing challenge:', error);
              if (error.response?.status === 409) {
                Alert.alert('Already Completed', 'You have already completed this challenge today!');
                setIsCompleted(true);
                setIsStarted(false);
              } else {
                Alert.alert('Error', error.message || 'Failed to complete challenge. Please try again.');
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleQuizAnswer = (answer: string) => {
    if (!answer.trim()) {
      Alert.alert('Required', 'Please provide an answer to continue.');
      return;
    }

    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);
    setCurrentAnswer(''); // Reset for next question

    if (currentQuestion < quizQuestions.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed, now complete the challenge
      finishQuizAndComplete(newAnswers);
    }
  };

  const finishQuizAndComplete = async (answers: string[]) => {
    if (!challengeApiId) return;

    setShowQuiz(false);
    setLoading(true);

    try {
      if (isAnonymous) {
        // Anonymous mode - save to local storage
        await anonymousStorage.addCompletedTask(
          parseInt(challengeApiId.toString()),
          title,
          points
        );
        
        // Check for milestones
        const milestoneCheck = await anonymousStorage.checkMilestones();
        
        setIsCompleted(true);
        setIsStarted(false);
        await refreshAnonymousData();
        
        // Show success alert FIRST, then milestone prompt
        Alert.alert(
          'Excellent Work! 🎉',
          `You've demonstrated your learning and earned ${points} points!\n\nYour answers show real engagement with the material. Keep learning!`,
          [
            {
              text: 'Awesome!',
              onPress: () => {
                // After user clicks "Awesome!", show milestone prompt if needed
                if (milestoneCheck.shouldPrompt) {
                  setMilestoneType(milestoneCheck.milestoneType || '');
                  setMilestoneData(milestoneCheck.milestoneData);
                  setShowMilestonePrompt(true);
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else {
        // Registered user - use API
        await api.completeTask(challengeApiId.toString());
        setIsCompleted(true);
        setIsStarted(false);
        await refreshProfile();
        
        Alert.alert(
          'Excellent Work! 🎉',
          `You've demonstrated your learning and earned ${points} points!\n\nYour answers show real engagement with the material. Keep learning!`,
          [
            {
              text: 'Awesome!',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error completing challenge:', error);
      if (error.response?.status === 409) {
        Alert.alert('Already Completed', 'You have already completed this challenge today!');
        setIsCompleted(true);
        setIsStarted(false);
      } else {
        Alert.alert('Error', error.message || 'Failed to complete challenge. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getDifficultyColor(difficulty) as [string, string]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Target size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{difficulty}</Text>
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
            <Text style={styles.pointsValue}>{points}</Text>
            <Text style={styles.pointsLabel}>Points Reward</Text>
          </LinearGradient>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>About This Challenge</Text>
          <Text style={styles.descriptionText}>{description || 'No description available'}</Text>
          
          {challengeConfig?.duration && (
            <View style={styles.durationBadge}>
              <Clock size={16} color="#4ECDC4" />
              <Text style={styles.durationText}>{challengeConfig.duration}</Text>
            </View>
          )}
        </View>

        {challengeConfig?.instructions && challengeConfig.instructions.length > 0 && (
          <View style={styles.instructionsCard}>
            <Text style={styles.sectionTitle}>📋 How to Complete</Text>
            {challengeConfig.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Award size={24} color="#4ECDC4" />
              <Text style={styles.infoLabel}>Difficulty</Text>
              <Text style={styles.infoValue}>{difficulty}</Text>
            </View>
            <View style={styles.infoItem}>
              <Zap size={24} color="#F39C12" />
              <Text style={styles.infoLabel}>Points</Text>
              <Text style={styles.infoValue}>{points}</Text>
            </View>
          </View>
        </View>

        {challengeConfig?.tips && challengeConfig.tips.length > 0 && (
          <View style={styles.tipsCard}>
            <Text style={styles.sectionTitle}>💡 Tips for Success</Text>
            {challengeConfig.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <CheckCircle size={16} color="#4ECDC4" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {challengeConfig?.motivation && (
          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>"{challengeConfig.motivation}"</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {checkingStatus ? (
          <View style={styles.startButton}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.startButtonText}>Checking status...</Text>
          </View>
        ) : isCompleted ? (
          <View style={[styles.startButton, styles.completedButton]}>
            <CheckCircle size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Completed Today ✅</Text>
          </View>
        ) : isStarted ? (
          <TouchableOpacity
            style={[styles.startButton, styles.completeButton, loading && styles.startButtonDisabled]}
            onPress={handleCompleteChallenge}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <CheckCircle size={24} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Mark as Complete</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
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
        )}
      </View>

      {/* Quiz Modal */}
      <Modal
        visible={showQuiz}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Alert.alert('Cancel Quiz?', 'Your progress will be lost.', [
            { text: 'Continue Quiz', style: 'cancel' },
            { text: 'Cancel', onPress: () => setShowQuiz(false) },
          ]);
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Knowledge Check 🧠</Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Cancel Quiz?', 'Your progress will be lost.', [
                    { text: 'Continue Quiz', style: 'cancel' },
                    { text: 'Cancel', onPress: () => setShowQuiz(false) },
                  ]);
                }}>
                <X size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <View style={styles.progressBar}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Question {currentQuestion + 1} of {quizQuestions.length}
              </Text>
            </View>

            <ScrollView style={styles.quizContent} contentContainerStyle={styles.quizContentContainer}>
              <Text style={styles.questionText}>{quizQuestions[currentQuestion]?.question || 'Loading question...'}</Text>

              <TextInput
                style={styles.answerInput}
                placeholder={quizQuestions[currentQuestion]?.placeholder || 'Type your answer here...'}
                placeholderTextColor="#95A5A6"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={currentAnswer}
                onChangeText={setCurrentAnswer}
                returnKeyType="done"
                blurOnSubmit={true}
                autoFocus={true}
              />

              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => handleQuizAnswer(currentAnswer)}>
                <Text style={styles.nextButtonText}>
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Submit & Complete'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Milestone Prompt Modal */}
      <MilestonePrompt
        visible={showMilestonePrompt}
        milestoneType={milestoneType}
        milestoneData={milestoneData}
        onDismiss={() => setShowMilestonePrompt(false)}
      />
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
    marginBottom: 12,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
    marginLeft: 6,
  },
  instructionsCard: {
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
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 22,
    marginLeft: 8,
  },
  motivationCard: {
    backgroundColor: '#F5F7FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 100,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  motivationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2C3E50',
    lineHeight: 24,
    textAlign: 'center',
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
  completedButton: {
    backgroundColor: '#27AE60',
  },
  completeButton: {
    backgroundColor: '#F39C12',
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
  // Quiz Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    height: '85%',
    minHeight: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  progressBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
    textAlign: 'center',
  },
  quizContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  quizContentContainer: {
    paddingBottom: 40,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
    lineHeight: 26,
  },
  answerInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 120,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

