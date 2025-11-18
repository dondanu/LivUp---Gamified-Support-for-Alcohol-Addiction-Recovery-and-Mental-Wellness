// Script to generate all 25 challenge pages
// Run with: node Front-end/scripts/generate-challenges.js

const fs = require('fs');
const path = require('path');

const challenges = [
  { id: '1', name: 'morning-meditation', title: 'Morning Meditation', desc: 'Start your day with 5 minutes of meditation', diff: 'Easy', points: 15, icon: 'Brain', color: ['#4ECDC4', '#44A08D'] },
  { id: '2', name: 'exercise', title: 'Exercise', desc: 'Do 30 minutes of physical activity', diff: 'Medium', points: 20, icon: 'Activity', color: ['#F39C12', '#E67E22'] },
  { id: '3', name: 'journal-entry', title: 'Journal Entry', desc: 'Write in your recovery journal', diff: 'Easy', points: 10, icon: 'BookOpen', color: ['#4ECDC4', '#44A08D'] },
  { id: '4', name: 'read-recovery-material', title: 'Read Recovery Material', desc: 'Read for 15 minutes about recovery', diff: 'Easy', points: 15, icon: 'Book', color: ['#4ECDC4', '#44A08D'] },
  { id: '5', name: 'call-support', title: 'Call Support', desc: 'Reach out to a support person', diff: 'Medium', points: 25, icon: 'Phone', color: ['#F39C12', '#E67E22'] },
  { id: '6', name: 'healthy-meal', title: 'Healthy Meal', desc: 'Prepare and eat a nutritious meal', diff: 'Easy', points: 10, icon: 'Utensils', color: ['#4ECDC4', '#44A08D'] },
  { id: '7', name: 'gratitude-list', title: 'Gratitude List', desc: 'Write down 3 things you\'re grateful for', diff: 'Easy', points: 10, icon: 'Heart', color: ['#4ECDC4', '#44A08D'] },
  { id: '8', name: 'art-creative-activity', title: 'Art/Creative Activity', desc: 'Engage in creative expression', diff: 'Easy', points: 15, icon: 'Palette', color: ['#4ECDC4', '#44A08D'] },
  { id: '9', name: 'nature-walk', title: 'Nature Walk', desc: 'Spend 20 minutes outdoors', diff: 'Easy', points: 15, icon: 'TreePine', color: ['#4ECDC4', '#44A08D'] },
  { id: '10', name: 'practice-mindfulness', title: 'Practice Mindfulness', desc: 'Do a 10-minute mindfulness exercise', diff: 'Easy', points: 15, icon: 'Brain', color: ['#4ECDC4', '#44A08D'] },
  { id: '11', name: 'help-someone', title: 'Help Someone', desc: 'Do something kind for another person', diff: 'Medium', points: 20, icon: 'HandHeart', color: ['#F39C12', '#E67E22'] },
  { id: '12', name: 'learn-something-new', title: 'Learn Something New', desc: 'Watch a tutorial or read an article', diff: 'Easy', points: 10, icon: 'GraduationCap', color: ['#4ECDC4', '#44A08D'] },
  { id: '13', name: 'music-therapy', title: 'Music Therapy', desc: 'Listen to uplifting music for 30 minutes', diff: 'Easy', points: 10, icon: 'Music', color: ['#4ECDC4', '#44A08D'] },
  { id: '14', name: 'healthy-sleep', title: 'Healthy Sleep', desc: 'Get 7-8 hours of sleep', diff: 'Medium', points: 15, icon: 'Moon', color: ['#F39C12', '#E67E22'] },
  { id: '15', name: 'no-social-media', title: 'No Social Media', desc: 'Take a break from social media', diff: 'Medium', points: 10, icon: 'Smartphone', color: ['#F39C12', '#E67E22'] },
  { id: '16', name: 'stretch-yoga', title: 'Stretch/Yoga', desc: 'Do 15 minutes of stretching or yoga', diff: 'Easy', points: 15, icon: 'Activity', color: ['#4ECDC4', '#44A08D'] },
  { id: '17', name: 'cook-new-recipe', title: 'Cook a New Recipe', desc: 'Try cooking something healthy', diff: 'Medium', points: 15, icon: 'ChefHat', color: ['#F39C12', '#E67E22'] },
  { id: '18', name: 'write-affirmations', title: 'Write Affirmations', desc: 'Write 5 positive affirmations', diff: 'Easy', points: 10, icon: 'PenTool', color: ['#4ECDC4', '#44A08D'] },
  { id: '19', name: 'listen-to-podcast', title: 'Listen to Podcast', desc: 'Listen to a recovery or wellness podcast', diff: 'Easy', points: 15, icon: 'Headphones', color: ['#4ECDC4', '#44A08D'] },
  { id: '20', name: 'deep-breathing', title: 'Deep Breathing', desc: 'Practice 5 minutes of deep breathing', diff: 'Easy', points: 10, icon: 'Wind', color: ['#4ECDC4', '#44A08D'] },
  { id: '21', name: 'complete-5k-run', title: 'Complete a 5K Run', desc: 'Run or walk 5 kilometers', diff: 'Hard', points: 50, icon: 'Activity', color: ['#E74C3C', '#C0392B'] },
  { id: '22', name: 'attend-support-group', title: 'Attend Support Group', desc: 'Join a recovery support group meeting', diff: 'Medium', points: 40, icon: 'Users', color: ['#F39C12', '#E67E22'] },
  { id: '23', name: 'week-long-challenge', title: 'Week-Long Challenge', desc: 'Complete 7 days of daily tasks', diff: 'Hard', points: 100, icon: 'Calendar', color: ['#E74C3C', '#C0392B'] },
  { id: '24', name: 'meditation-marathon', title: 'Meditation Marathon', desc: 'Meditate for 30 minutes straight', diff: 'Hard', points: 45, icon: 'Brain', color: ['#E74C3C', '#C0392B'] },
  { id: '25', name: 'social-connection', title: 'Social Connection', desc: 'Have a meaningful conversation with a friend', diff: 'Easy', points: 20, icon: 'MessageCircle', color: ['#4ECDC4', '#44A08D'] },
];

const template = (challenge) => `import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ArrowLeft, Star, Play, ${challenge.icon} } from 'lucide-react-native';

export default function ${challenge.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Challenge() {
  const navigation = useNavigation<any>();
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const challenge = { id: '${challenge.id}', title: '${challenge.title}', description: '${challenge.desc}', difficulty: '${challenge.diff}', points_reward: ${challenge.points}, category: '${challenge.category || 'wellness'}' };

  const handleStartChallenge = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      await api.acceptChallenge(challenge.id);
      Alert.alert('Challenge Started! 🎉', \`You've accepted "\${challenge.title}". Complete it to earn \${challenge.points_reward} points!\`, [{ text: 'OK', onPress: () => { refreshProfile(); navigation.goBack(); } }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[${challenge.color.map(c => `'${c}'`).join(', ')}]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => navigation.goBack()}><ArrowLeft size={24} color="#FFFFFF" /></TouchableOpacity>
        <View style={styles.headerContent}><${challenge.icon} size={48} color="#FFFFFF" /><Text style={styles.headerTitle}>${challenge.title}</Text><View style={styles.difficultyBadge}><Text style={styles.difficultyText}>${challenge.diff}</Text></View></View>
      </LinearGradient>
      <ScrollView style={styles.content}>
        <View style={styles.pointsCard}><LinearGradient colors={['#FFD700', '#FFA500']} style={styles.pointsGradient}><Star size={32} color="#FFFFFF" /><Text style={styles.pointsValue}>${challenge.points}</Text><Text style={styles.pointsLabel}>Points Reward</Text></LinearGradient></View>
        <View style={styles.descriptionCard}><Text style={styles.sectionTitle}>About This Challenge</Text><Text style={styles.descriptionText}>${challenge.desc}</Text></View>
        <View style={styles.tipsCard}><Text style={styles.sectionTitle}>💡 Tips</Text><Text style={styles.tipText}>• Take your time to complete this challenge</Text><Text style={styles.tipText}>• You can track your progress in the Track tab</Text><Text style={styles.tipText}>• Complete it to earn points and level up!</Text></View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.startButton, loading && styles.startButtonDisabled]} onPress={handleStartChallenge} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <><Play size={24} color="#FFFFFF" /><Text style={styles.startButtonText}>Start Challenge</Text></>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24 },
  backButtonHeader: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16, textAlign: 'center' },
  difficultyBadge: { backgroundColor: 'rgba(255, 255, 255, 0.3)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  difficultyText: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  pointsCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  pointsGradient: { padding: 24, alignItems: 'center' },
  pointsValue: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8 },
  pointsLabel: { fontSize: 16, color: '#FFFFFF', marginTop: 4, opacity: 0.9 },
  descriptionCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  descriptionText: { fontSize: 16, color: '#7F8C8D', lineHeight: 24 },
  tipsCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  tipText: { fontSize: 14, color: '#7F8C8D', lineHeight: 22, marginTop: 8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#E0E0E0', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  startButton: { backgroundColor: '#4ECDC4', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, shadowColor: '#4ECDC4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  startButtonDisabled: { opacity: 0.6 },
  startButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
});
`;

// Create challenges directory if it doesn't exist
const challengesDir = path.join(__dirname, '../app/challenges');
if (!fs.existsSync(challengesDir)) {
  fs.mkdirSync(challengesDir, { recursive: true });
}

// Generate all challenge files
challenges.forEach(challenge => {
  const fileName = `${challenge.name}.tsx`;
  const filePath = path.join(challengesDir, fileName);
  fs.writeFileSync(filePath, template(challenge));
  console.log(`✅ Created ${fileName}`);
});

console.log(`\n✅ Generated ${challenges.length} challenge pages!`);

