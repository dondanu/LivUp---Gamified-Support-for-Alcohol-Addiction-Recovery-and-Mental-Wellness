import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ArrowLeft, Music, Play, Pause, CheckCircle, Clock, ExternalLink } from 'lucide-react-native';
// @ts-ignore - react-native-sound-player doesn't have types
import SoundPlayer from 'react-native-sound-player';

export default function MusicTherapyChallenge() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { profile, refreshProfile } = useAuth();
  const challenge = route.params?.challenge;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  const targetDuration = 30 * 60; // 30 minutes in seconds
  const progress = Math.min((timeElapsed / targetDuration) * 100, 100);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1;
          // Auto-complete when target duration is reached
          if (newTime >= targetDuration) {
            setIsPlaying(false);
            setIsCompleted(true);
            return targetDuration;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isCompleted, targetDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Try to play music in-app
  const playMusicInApp = async () => {
    try {
      setAudioError(false);
      
      // Try multiple music sources - first try local file, then URL
      const musicSources = [
        // Try local file first (if you've added music files to the app)
        // File name should match exactly (without extension in code)
        { type: 'file', name: 'peaceful_music', ext: 'mp3' },
        { type: 'file', name: 'calming_sounds', ext: 'mp3' },
        { type: 'file', name: 'meditation_music', ext: 'mp3' },
        // Fallback to online music
        { type: 'url', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { type: 'url', url: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3' },
      ];
      
      let musicPlayed = false;
      let lastError: any = null;
      
      // Try each music source until one works
      for (const source of musicSources) {
        try {
          if (source.type === 'file') {
            // Try to play local file from res/raw folder
            // Note: File must be in android/app/src/main/res/raw/ folder
            // And app must be REBUILT after adding files
            console.log(`Attempting to play local file: ${source.name}.${source.ext}`);
            
            // For Android, try both with and without extension
            try {
              // Method 1: With extension (standard way)
              SoundPlayer.playSoundFile(source.name, source.ext);
              setMusicPlaying(true);
              musicPlayed = true;
              console.log(`✅ Music started playing: ${source.name}.${source.ext}`);
              break;
            } catch (extError) {
              // Method 2: Try without extension (some versions need this)
              try {
                console.log(`Trying without extension...`);
                SoundPlayer.playSoundFile(source.name, '');
                setMusicPlaying(true);
                musicPlayed = true;
                console.log(`✅ Music started playing: ${source.name}`);
                break;
              } catch (noExtError) {
                // Method 3: Try with just the filename
                try {
                  console.log(`Trying with full filename...`);
                  SoundPlayer.playSoundFile(`${source.name}.${source.ext}`, '');
                  setMusicPlaying(true);
                  musicPlayed = true;
                  console.log(`✅ Music started playing: ${source.name}.${source.ext}`);
                  break;
                } catch (fullNameError) {
                  throw extError; // Throw original error
                }
              }
            }
          } else if (source.type === 'url') {
            // Try to play from URL
            console.log(`Attempting to play from URL: ${source.url}`);
            SoundPlayer.playUrl(source.url);
            setMusicPlaying(true);
            musicPlayed = true;
            console.log(`✅ Music started playing from URL: ${source.url}`);
            break;
          }
        } catch (sourceError: any) {
          lastError = sourceError;
          console.log(`❌ Failed to play ${source.type === 'file' ? `${source.name}.${source.ext}` : source.url}:`, sourceError?.message || sourceError);
          // Try next source
          continue;
        }
      }
      
      if (!musicPlayed) {
        // All sources failed
        setAudioError(true);
        setMusicPlaying(false);
        const errorMsg = lastError?.message || 'Unknown error';
        console.error('All music sources failed. Last error:', errorMsg);
        
        Alert.alert(
          'Could Not Play Music in App',
          `Unable to play music directly in the app.\n\n${errorMsg.includes('not found') || errorMsg.includes('No such file') ? '⚠️ Make sure you REBUILT the app after adding music files to the raw folder!' : ''}\n\nWould you like to open your music player instead?`,
          [
            {
              text: 'Open Music Player',
              onPress: () => openMusicApp(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error playing music:', error);
      setAudioError(true);
      setMusicPlaying(false);
      Alert.alert(
        'Error',
        'Could not play music. Would you like to open your music player instead?',
        [
          {
            text: 'Open Music Player',
            onPress: () => openMusicApp(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const openMusicApp = () => {
    const musicUrls = Platform.select({
      ios: ['music://', 'spotify://'],
      android: ['spotify://', 'com.spotify.music'],
    }) || ['spotify://'];
    
    Linking.canOpenURL(musicUrls[0]).then((supported) => {
      if (supported) {
        Linking.openURL(musicUrls[0]);
      } else {
        Alert.alert(
          'Music App',
          'Please open your favorite music app manually and start playing music.',
          [{ text: 'OK' }]
        );
      }
    });
  };

  const handleTogglePlay = () => {
    if (isCompleted) return;
    
    if (!isPlaying) {
      // Show dialog asking user to choose
      Alert.alert(
        'Start Listening',
        'How would you like to play music?',
        [
          {
            text: 'Play via App',
            onPress: () => {
              // Try to play music in-app
              playMusicInApp();
              // Start the timer
              setIsPlaying(true);
            },
          },
          {
            text: 'Open Music Player',
            onPress: () => {
              // Open external music app
              openMusicApp();
              // Start the timer
              setIsPlaying(true);
              setAudioError(true); // Show fallback button
            },
            style: 'default',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      // Pause the timer and music
      setIsPlaying(false);
      try {
        SoundPlayer.pause();
        setMusicPlaying(false);
      } catch (error) {
        console.log('Error pausing music:', error);
      }
    }
  };
  
  // Stop music when component unmounts
  useEffect(() => {
    return () => {
      try {
        SoundPlayer.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
    };
  }, []);

  const handleCompleteChallenge = async () => {
    if (!profile?.id || !challenge?.id) {
      Alert.alert('Error', 'Unable to complete challenge. Please try again.');
      return;
    }

    // Check if they've listened for at least 5 minutes (300 seconds)
    if (timeElapsed < 300) {
      Alert.alert(
        'Not Enough Time',
        'Please listen to music for at least 5 minutes before completing this challenge.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      await api.acceptChallenge(challenge.id.toString());
      setIsCompleted(true);
      setIsPlaying(false);
      
      Alert.alert(
        'Challenge Completed! 🎉',
        `Congratulations! You've completed the Music Therapy challenge and earned ${challenge.points_reward || 10} points!`,
        [
          {
            text: 'OK',
            onPress: async () => {
              await refreshProfile();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error completing challenge:', error);
      
      if (error.response?.status === 409) {
        Alert.alert(
          'Already Completed',
          'You\'ve already completed this challenge today! Great job! 🎉',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', error.response?.data?.error || error.message || 'Failed to complete challenge');
      }
    } finally {
      setLoading(false);
    }
  };

  const title = challenge?.title || 'Music Therapy';
  const points = challenge?.points_reward || 10;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Music size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>Listen to uplifting music for 30 minutes</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.pointsRow}>
            <Text style={styles.infoLabel}>Points Reward:</Text>
            <Text style={styles.pointsValue}>{points} points</Text>
          </View>
          <View style={styles.pointsRow}>
            <Text style={styles.infoLabel}>Target Duration:</Text>
            <Text style={styles.infoValue}>30 minutes</Text>
          </View>
        </View>

        <View style={styles.playerCard}>
          <View style={styles.timerContainer}>
            <Clock size={32} color="#667EEA" />
            <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
            <Text style={styles.timerLabel}>/ {formatTime(targetDuration)}</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
          </View>

          <TouchableOpacity
            style={[styles.playButton, isCompleted && styles.playButtonDisabled]}
            onPress={handleTogglePlay}
            disabled={isCompleted}>
            {isPlaying ? (
              <>
                <Pause size={32} color="#FFFFFF" />
                <Text style={styles.playButtonText}>Pause Timer</Text>
              </>
            ) : (
              <>
                <Play size={32} color="#FFFFFF" />
                <Text style={styles.playButtonText}>
                  {timeElapsed === 0 ? 'Start Listening' : 'Resume Timer'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {isPlaying && (
            <View style={styles.playingIndicator}>
              <Music size={16} color={musicPlaying ? "#27AE60" : "#667EEA"} />
              <Text style={styles.playingText}>
                {musicPlaying 
                  ? "Music is playing - Timer is running!" 
                  : "Timer is running - Make sure music is playing!"}
              </Text>
            </View>
          )}
          
          {audioError && (
            <TouchableOpacity
              style={styles.fallbackButton}
              onPress={openMusicApp}>
              <ExternalLink size={18} color="#E74C3C" />
              <Text style={styles.fallbackButtonText}>
                Open Music App (Music couldn't play in-app)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>How to Complete</Text>
          <Text style={styles.instructionText}>
            1. Press "Start Listening" to begin the timer{'\n'}
            2. Open your music app (Spotify, Apple Music, etc.){'\n'}
            3. Play uplifting music from your playlist{'\n'}
            4. Listen for at least 5 minutes (30 minutes recommended){'\n'}
            5. Press "Complete Challenge" when finished
          </Text>
          
          {!isPlaying && (
            <TouchableOpacity
              style={styles.musicAppButton}
              onPress={() => {
                // Try to open music apps
                const urls = Platform.select({
                  ios: ['music://', 'spotify://'],
                  android: ['spotify://', 'com.spotify.music'],
                }) || ['spotify://'];
                
                Linking.canOpenURL(urls[0]).then((supported) => {
                  if (supported) {
                    Linking.openURL(urls[0]);
                  } else {
                    Alert.alert(
                      'Music App',
                      'Please open your favorite music app manually and start playing music.',
                      [{ text: 'OK' }]
                    );
                  }
                }).catch(() => {
                  Alert.alert(
                    'Music App',
                    'Please open your favorite music app manually and start playing music.',
                    [{ text: 'OK' }]
                  );
                });
              }}>
              <ExternalLink size={18} color="#667EEA" />
              <Text style={styles.musicAppButtonText}>Open Music App</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            (loading || isCompleted || timeElapsed < 300) && styles.completeButtonDisabled,
          ]}
          onPress={handleCompleteChallenge}
          disabled={loading || isCompleted || timeElapsed < 300}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : isCompleted ? (
            <>
              <CheckCircle size={24} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Completed!</Text>
            </>
          ) : (
            <>
              <CheckCircle size={24} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>
                {timeElapsed < 300
                  ? `Listen for ${Math.ceil((300 - timeElapsed) / 60)} more minutes`
                  : 'Complete Challenge'}
              </Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
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
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 12,
  },
  timerLabel: {
    fontSize: 18,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
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
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667EEA',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 22,
    marginBottom: 12,
  },
  musicAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667EEA',
    marginTop: 8,
  },
  musicAppButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
    marginLeft: 8,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E8EAF6',
    borderRadius: 20,
  },
  playingText: {
    fontSize: 12,
    color: '#667EEA',
    fontWeight: '600',
    marginLeft: 6,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  completeButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

