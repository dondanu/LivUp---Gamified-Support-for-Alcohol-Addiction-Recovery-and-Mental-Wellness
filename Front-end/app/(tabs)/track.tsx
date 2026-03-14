import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Ellipse, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Lock } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function JourneyScreen() {
  const { profile, isAnonymous } = useAuth();
  const [userStats, setUserStats] = useState({ alcoholFreeDays: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [profile]);

  const loadUserStats = async () => {
    if (!profile?.id || isAnonymous) {
      setLoading(false);
      return;
    }

    try {
      const currentStreak = profile?.current_streak || 0;
      setUserStats({ alcoholFreeDays: currentStreak });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageStatus = (stageIndex: number) => {
    // Only "The Hidden Cave" (stage 4, index 3) is unlocked/completed
    if (stageIndex === 3) {
      return 'completed';
    }
    return 'locked';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background}>
          <Text style={styles.loadingText}>Loading...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#1a1a2e', '#16213e', '#0f3460']} 
        style={styles.background}
        start={{x: 0, y: 0}} 
        end={{x: 1, y: 1}}
      >
        {/* Left Forest - Colorful Trees with Fruits & Leaves */}
        <View style={styles.leftForest}>
          <Svg width="140" height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
            {/* Tree Trunk - Brown */}
            <Path
              d={`M 50 ${height}
                  L 52 ${height * 0.8}
                  L 54 ${height * 0.6}
                  L 56 ${height * 0.4}
                  L 58 ${height * 0.2}
                  L 60 0
                  L 65 0
                  L 67 ${height * 0.2}
                  L 69 ${height * 0.4}
                  L 71 ${height * 0.6}
                  L 73 ${height * 0.8}
                  L 75 ${height}
                  Z`}
              fill="#8B4513"
              opacity="1"
            />
            
            {/* Main Branch - Brown */}
            <Path
              d={`M 58 ${height * 0.4}
                  L 45 ${height * 0.38}
                  L 30 ${height * 0.35}
                  L 15 ${height * 0.32}
                  L 17 ${height * 0.34}
                  L 32 ${height * 0.37}
                  L 47 ${height * 0.40}
                  L 60 ${height * 0.42}
                  Z`}
              fill="#8B4513"
              opacity="1"
            />
            
            {/* Right Branch - Brown */}
            <Path
              d={`M 67 ${height * 0.6}
                  L 80 ${height * 0.58}
                  L 95 ${height * 0.55}
                  L 110 ${height * 0.52}
                  L 125 ${height * 0.50}
                  L 123 ${height * 0.52}
                  L 108 ${height * 0.54}
                  L 93 ${height * 0.57}
                  L 78 ${height * 0.60}
                  L 65 ${height * 0.62}
                  Z`}
              fill="#8B4513"
              opacity="1"
            />
            
            {/* Green Leaves Clusters */}
            <Circle cx="25" cy={height * 0.30} r="15" fill="#228B22" opacity="0.9" />
            <Circle cx="35" cy={height * 0.28} r="12" fill="#32CD32" opacity="0.9" />
            <Circle cx="45" cy={height * 0.32} r="10" fill="#00FF00" opacity="0.8" />
            
            <Circle cx="115" cy={height * 0.48} r="18" fill="#228B22" opacity="0.9" />
            <Circle cx="125" cy={height * 0.45} r="14" fill="#32CD32" opacity="0.9" />
            <Circle cx="105" cy={height * 0.52} r="12" fill="#00FF00" opacity="0.8" />
            
            <Circle cx="70" cy={height * 0.15} r="20" fill="#228B22" opacity="0.9" />
            <Circle cx="80" cy={height * 0.12} r="16" fill="#32CD32" opacity="0.9" />
            <Circle cx="60" cy={height * 0.18} r="14" fill="#00FF00" opacity="0.8" />
            
            {/* Colorful Fruits */}
            <Circle cx="30" cy={height * 0.32} r="4" fill="#FF0000" opacity="1" /> {/* Red Apple */}
            <Circle cx="40" cy={height * 0.29} r="3" fill="#FF4500" opacity="1" /> {/* Orange */}
            <Circle cx="50" cy={height * 0.34} r="3" fill="#FFD700" opacity="1" /> {/* Yellow Fruit */}
            
            <Circle cx="120" cy={height * 0.50} r="4" fill="#FF0000" opacity="1" /> {/* Red Apple */}
            <Circle cx="110" cy={height * 0.47} r="3" fill="#FF69B4" opacity="1" /> {/* Pink Fruit */}
            <Circle cx="130" cy={height * 0.52} r="3" fill="#FF4500" opacity="1" /> {/* Orange */}
            
            <Circle cx="75" cy={height * 0.17} r="4" fill="#FF0000" opacity="1" /> {/* Red Apple */}
            <Circle cx="65" cy={height * 0.14} r="3" fill="#9370DB" opacity="1" /> {/* Purple Fruit */}
            <Circle cx="85" cy={height * 0.20} r="3" fill="#FFD700" opacity="1" /> {/* Yellow Fruit */}
          </Svg>
        </View>

        {/* Right Forest - Colorful Trees with Fruits & Leaves */}
        <View style={styles.rightForest}>
          <Svg width="140" height={height} style={{ position: 'absolute', right: 0, top: 0 }}>
            {/* Tree Trunk - Brown */}
            <Path
              d={`M 65 ${height}
                  L 67 ${height * 0.8}
                  L 69 ${height * 0.6}
                  L 71 ${height * 0.4}
                  L 73 ${height * 0.2}
                  L 75 0
                  L 80 0
                  L 82 ${height * 0.2}
                  L 84 ${height * 0.4}
                  L 86 ${height * 0.6}
                  L 88 ${height * 0.8}
                  L 90 ${height}
                  Z`}
              fill="#8B4513"
              opacity="1"
            />
            
            {/* Left Branch - Brown */}
            <Path
              d={`M 73 ${height * 0.4}
                  L 60 ${height * 0.38}
                  L 45 ${height * 0.35}
                  L 30 ${height * 0.32}
                  L 15 ${height * 0.30}
                  L 17 ${height * 0.32}
                  L 32 ${height * 0.34}
                  L 47 ${height * 0.37}
                  L 62 ${height * 0.40}
                  L 75 ${height * 0.42}
                  Z`}
              fill="#8B4513"
              opacity="1"
            />
            
            {/* Right Branch - Brown */}
            <Path
              d={`M 82 ${height * 0.6}
                  L 95 ${height * 0.58}
                  L 110 ${height * 0.55}
                  L 125 ${height * 0.52}
                  L 127 ${height * 0.54}
                  L 112 ${height * 0.57}
                  L 97 ${height * 0.60}
                  L 80 ${height * 0.62}
                  Z`}
              fill="#8B4513"
              opacity="1"
            />
            
            {/* Green Leaves Clusters */}
            <Circle cx="25" cy={height * 0.28} r="16" fill="#228B22" opacity="0.9" />
            <Circle cx="35" cy={height * 0.32} r="13" fill="#32CD32" opacity="0.9" />
            <Circle cx="15" cy={height * 0.35} r="11" fill="#00FF00" opacity="0.8" />
            
            <Circle cx="115" cy={height * 0.50} r="17" fill="#228B22" opacity="0.9" />
            <Circle cx="125" cy={height * 0.47} r="15" fill="#32CD32" opacity="0.9" />
            <Circle cx="105" cy={height * 0.53} r="13" fill="#00FF00" opacity="0.8" />
            
            <Circle cx="85" cy={height * 0.15} r="19" fill="#228B22" opacity="0.9" />
            <Circle cx="95" cy={height * 0.18} r="16" fill="#32CD32" opacity="0.9" />
            <Circle cx="75" cy={height * 0.12} r="14" fill="#00FF00" opacity="0.8" />
            
            {/* Colorful Fruits */}
            <Circle cx="30" cy={height * 0.30} r="4" fill="#FF0000" opacity="1" /> {/* Red Apple */}
            <Circle cx="20" cy={height * 0.33} r="3" fill="#FF4500" opacity="1" /> {/* Orange */}
            <Circle cx="40" cy={height * 0.35} r="3" fill="#FFD700" opacity="1" /> {/* Yellow Fruit */}
            
            <Circle cx="120" cy={height * 0.52} r="4" fill="#FF0000" opacity="1" /> {/* Red Apple */}
            <Circle cx="110" cy={height * 0.49} r="3" fill="#FF69B4" opacity="1" /> {/* Pink Fruit */}
            <Circle cx="130" cy={height * 0.55} r="3" fill="#9370DB" opacity="1" /> {/* Purple Fruit */}
            
            <Circle cx="90" cy={height * 0.17} r="4" fill="#FF0000" opacity="1" /> {/* Red Apple */}
            <Circle cx="80" cy={height * 0.14} r="3" fill="#FFD700" opacity="1" /> {/* Yellow Fruit */}
            <Circle cx="100" cy={height * 0.20} r="3" fill="#FF4500" opacity="1" /> {/* Orange */}
          </Svg>
        </View>

        {/* Hanging Icicles */}
        <View style={styles.icicleContainer}>
          {Array.from({ length: 12 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.icicle,
                {
                  left: 40 + (index * (width - 80) / 11),
                  height: 60 + Math.random() * 100,
                  width: 3 + Math.random() * 4,
                }
              ]}
            />
          ))}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* MASSIVE 3D LANDSCAPE TERRAIN - Full width like original */}
          <Svg height={height * 1.2} width={width} style={styles.pathSvg}>
            <Defs>
              {/* Deep Terrain Shadow */}
              <SvgLinearGradient id="terrainShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#2D1B69" stopOpacity="1" />
                <Stop offset="100%" stopColor="#1A0F4D" stopOpacity="0.9" />
              </SvgLinearGradient>
              
              {/* Main Terrain Surface */}
              <SvgLinearGradient id="terrainSurface" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
                <Stop offset="50%" stopColor="#7C3AED" stopOpacity="0.9" />
                <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
              </SvgLinearGradient>
              
              {/* Terrain Highlight */}
              <SvgLinearGradient id="terrainHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#C084FC" stopOpacity="0.9" />
                <Stop offset="50%" stopColor="#A855F7" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.7" />
              </SvgLinearGradient>
            </Defs>
            
            {/* MASSIVE TERRAIN SHADOW - Full width landscape */}
            <Path
              d={`M 0 ${height * 0.98}
                  Q ${width * 0.1} ${height * 0.88} ${width * 0.15} ${height * 0.78}
                  Q ${width * 0.85} ${height * 0.68} ${width * 0.2} ${height * 0.58}
                  Q ${width * 0.1} ${height * 0.48} ${width * 0.25} ${height * 0.38}
                  Q ${width * 0.9} ${height * 0.28} ${width * 0.3} ${height * 0.02}
                  L ${width * 0.7} ${height * 0.02}
                  Q ${width * 1.1} ${height * 0.28} ${width * 0.75} ${height * 0.38}
                  Q ${width * 0.9} ${height * 0.48} ${width * 0.8} ${height * 0.58}
                  Q ${width * 1.15} ${height * 0.68} ${width * 0.85} ${height * 0.78}
                  Q ${width * 0.9} ${height * 0.88} ${width} ${height * 0.98}
                  L 0 ${height * 0.98}
                  Z`}
              fill="url(#terrainShadow)"
              opacity="1"
            />
            
            {/* MASSIVE TERRAIN SURFACE - Main 3D landscape */}
            <Path
              d={`M ${width * 0.05} ${height * 0.95}
                  Q ${width * 0.15} ${height * 0.85} ${width * 0.2} ${height * 0.75}
                  Q ${width * 0.8} ${height * 0.65} ${width * 0.25} ${height * 0.55}
                  Q ${width * 0.15} ${height * 0.45} ${width * 0.3} ${height * 0.35}
                  Q ${width * 0.85} ${height * 0.25} ${width * 0.35} ${height * 0.05}
                  L ${width * 0.65} ${height * 0.05}
                  Q ${width * 1.05} ${height * 0.25} ${width * 0.7} ${height * 0.35}
                  Q ${width * 0.85} ${height * 0.45} ${width * 0.75} ${height * 0.55}
                  Q ${width * 1.1} ${height * 0.65} ${width * 0.8} ${height * 0.75}
                  Q ${width * 0.85} ${height * 0.85} ${width * 0.95} ${height * 0.95}
                  L ${width * 0.05} ${height * 0.95}
                  Z`}
              fill="url(#terrainSurface)"
              opacity="1"
            />
            
            {/* MASSIVE TERRAIN HIGHLIGHT - Top surface */}
            <Path
              d={`M ${width * 0.1} ${height * 0.92}
                  Q ${width * 0.2} ${height * 0.82} ${width * 0.25} ${height * 0.72}
                  Q ${width * 0.75} ${height * 0.62} ${width * 0.3} ${height * 0.52}
                  Q ${width * 0.2} ${height * 0.42} ${width * 0.35} ${height * 0.32}
                  Q ${width * 0.8} ${height * 0.22} ${width * 0.4} ${height * 0.08}
                  L ${width * 0.6} ${height * 0.08}
                  Q ${width * 1.0} ${height * 0.22} ${width * 0.65} ${height * 0.32}
                  Q ${width * 0.8} ${height * 0.42} ${width * 0.7} ${height * 0.52}
                  Q ${width * 1.05} ${height * 0.62} ${width * 0.75} ${height * 0.72}
                  Q ${width * 0.8} ${height * 0.82} ${width * 0.9} ${height * 0.92}
                  L ${width * 0.1} ${height * 0.92}
                  Z`}
              fill="url(#terrainHighlight)"
              opacity="1"
            />
            
            {/* 4 CAVE OPENINGS ONLY */}
            
            {/* Cave 1 - The Shadow Within */}
            <Ellipse
              cx={width * 0.68}
              cy={height * 0.15}
              rx="60"
              ry="27"
              fill="#1A0F4D"
              opacity="0.9"
            />
            
            {/* Cave 2 - Mastering Magics */}
            <Ellipse
              cx={width * 0.50}
              cy={height * 0.35}
              rx="64"
              ry="29"
              fill="#1A0F4D"
              opacity="0.9"
            />
            
            {/* Cave 3 - Agonia's Path */}
            <Ellipse
              cx={width * 0.65}
              cy={height * 0.55}
              rx="70"
              ry="33"
              fill="#1A0F4D"
              opacity="0.9"
            />
            
            {/* Cave 4 - The Hidden Cave */}
            <Ellipse
              cx={width * 0.5}
              cy={height * 0.75}
              rx="80"
              ry="38"
              fill="#1A0F4D"
              opacity="0.9"
            />
          </Svg>

          {/* Journey Stages - OVAL shaped like reference */}
          <View style={styles.journeyContainer}>
            
            {/* The Shadow Within - Stage 1 - SVG ELLIPSE BUTTON */}
            <TouchableOpacity 
              style={[styles.stageContainer, { 
                top: height * 0.08, 
                left: width * 0.7 - 90 
              }]}
            >
              <View style={{ position: 'relative', marginBottom: 16, marginTop: 52, marginRight:18 }}>
                <Svg width="90" height="40">
                  <Ellipse
                    cx="44"
                    cy="18"
                    rx="44"
                    ry="18"
                    fill={getStageStatus(0) === 'completed' ? '#DC2626' : '#b6c2d6ff'}
                  />
                </Svg>
                <View style={{ position: 'absolute', top: 7, left: 34, zIndex: 10 }}>
                  {getStageStatus(0) === 'completed' ? (
                    <Check size={28} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Lock size={23} color="#192336ff" strokeWidth={3} />
                  )}
                </View>
              </View>
              <Text style={styles.stageTitle}>The Shadow Within</Text>
            </TouchableOpacity>

            {/* Mastering Magics - Stage 2 - SVG ELLIPSE BUTTON */}
            <TouchableOpacity 
              style={[styles.stageContainer, { 
                top: height * 0.28, 
                left: width * 0.53 - 90 
              }]}
            >
              <View style={{ position: 'relative', marginBottom: 16, marginTop: 47.5, marginRight: 27 }}>
                <Svg width="95" height="44">
                  <Ellipse
                    cx="47"
                    cy="21"
                    rx="47"
                    ry="21"
                    fill={getStageStatus(1) === 'completed' ? '#DC2626' : '#9ba5b8ff'}
                  />
                </Svg>
                <View style={{ position: 'absolute', top: 10.5, left: 35, zIndex: 10 }}>
                  {getStageStatus(1) === 'completed' ? (
                    <Check size={28} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Lock size={24} color="#192336ff" strokeWidth={3} />
                  )}
                </View>
              </View>
              <Text style={styles.stageTitle}>Mastering Magics</Text>
            </TouchableOpacity>

            {/* Agonia's Path - Stage 3 - SVG ELLIPSE BUTTON */}
            <TouchableOpacity 
              style={[styles.stageContainer, { 
                top: height * 0.48, 
                left: width * 0.65 - 80 
              }]}
            >
              <View style={{ position: 'relative', marginBottom: 16, marginTop: 45, marginRight: 4 }}>
                <Svg width="120" height="56">
                  <Ellipse
                    cx="52"
                    cy="24"
                    rx="52"
                    ry="24"
                    fill={getStageStatus(2) === 'completed' ? '#DC2626' : '#929cadff'}
                  />
                </Svg>
                <View style={{ position: 'absolute', top: 11, left: 40, zIndex: 10 }}>
                  {getStageStatus(2) === 'completed' ? (
                    <Check size={26} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Lock size={27} color="#192336ff" strokeWidth={3} />
                  )}
                </View>
              </View>
              <Text style={styles.stageTitle}>Agonia's Path</Text>
            </TouchableOpacity>

            {/* The Hidden Cave - Stage 4 - SVG ELLIPSE BUTTON */}
            <TouchableOpacity 
              style={[styles.stageContainer, { 
                top: height * 0.68, 
                left: width * 0.5 - 80 
              }]}
            >
              <View style={{ position: 'relative', marginBottom: 16, marginTop: 40, marginRight: 17 }}>
                <Svg width="120" height="56">
                  <Ellipse
                    cx="60"
                    cy="28"
                    rx="60"
                    ry="28"
                    fill={getStageStatus(3) === 'completed' ? '#DC2626' : '#2D3748'}
                  />
                </Svg>
                <View style={{ position: 'absolute', top: 14, left: 46, zIndex: 10 }}>
                  {getStageStatus(3) === 'completed' ? (
                    <Check size={28} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Lock size={28} color="#6B7280" strokeWidth={3} />
                  )}
                </View>
              </View>
              <Text style={styles.stageTitle}>The Hidden Cave</Text>
            </TouchableOpacity>

          </View>

          {/* Magical Particles */}
          {Array.from({ length: 15 }).map((_, index) => (
            <View
              key={`particle-${index}`}
              style={[
                styles.magicalParticle,
                {
                  left: 60 + Math.random() * (width - 120),
                  top: 120 + Math.random() * (height * 0.7),
                  opacity: 0.4 + Math.random() * 0.4,
                }
              ]}
            />
          ))}

          <View style={{ height: 200 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  leftForest: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 140,
    height: height,
    zIndex: 1,
  },
  rightForest: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 140,
    height: height,
    zIndex: 1,
  },
  mainTree: {
    position: 'absolute',
    backgroundColor: '#4747e6ff',
    opacity: 0.95,
    borderRadius: 30,
  },
  treeBranch: {
    position: 'absolute',
    backgroundColor: '#322441ff',
    opacity: 0.8,
    borderRadius: 20,
  },
  icicleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: 2,
  },
  icicle: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
    zIndex: 3,
  },
  pathSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: height * 0.4,
  },
  journeyContainer: {
    flex: 1,
    paddingTop: 40,
    zIndex: 4,
  },
  stageContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 180,
  },
  stageContainerSmall: {
    position: 'absolute',
    alignItems: 'center',
    width: 140,
  },
  stage3DButton: {
    width: 120,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop:35,
    marginRight:15,
  },
  stageSmall3DButton: {
    width: 140,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    // THICK 3D LAYERED EFFECT - smaller
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 15,
    // 3D BORDERS for thickness
    borderWidth: 2,
    borderBottomWidth: 8,  // THICK bottom for 3D depth
    borderRightWidth: 6,   // THICK right for 3D depth
    borderLeftWidth: 2,
    borderTopWidth: 2,
  },
  lockedStage: {
    backgroundColor: '#354052ff',
    borderColor: '#1A202C',        // Dark border
    borderBottomColor: '#0D1117',  // Darker bottom for depth
    borderRightColor: '#0D1117',   // Darker right for depth
  },
  lockedStageSmall: {
    backgroundColor: '#2D3748',
    borderColor: '#1A202C',
    borderBottomColor: '#0D1117',
    borderRightColor: '#0D1117',
  },
  activeStage: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',        // Red border
    borderBottomColor: '#991B1B',  // Darker red bottom for depth
    borderRightColor: '#991B1B',   // Darker red right for depth
    shadowColor: '#DC2626',
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 25,
  },
  activeStageSmall: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
    borderBottomColor: '#991B1B',
    borderRightColor: '#991B1B',
    shadowColor: '#DC2626',
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 20,
  },
  completedStage: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
    borderBottomColor: '#991B1B',
    borderRightColor: '#991B1B',
    shadowColor: '#DC2626',
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 25,
  },
  completedStageSmall: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
    borderBottomColor: '#991B1B',
    borderRightColor: '#991B1B',
    shadowColor: '#DC2626',
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 20,
  },
  stageTitleSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    paddingHorizontal: 4,
    letterSpacing: 0.3,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    paddingHorizontal: 8,
    letterSpacing: 0.5,
  },
  magicalParticle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 8,
  },
});
