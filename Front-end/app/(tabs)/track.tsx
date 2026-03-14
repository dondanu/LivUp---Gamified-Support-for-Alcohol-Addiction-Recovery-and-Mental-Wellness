import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
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
        {/* Left Forest - PNG Tree Image */}
        <View style={styles.leftForest}>
          <Image 
            source={require('../../assets/images/tree.png')} 
            style={styles.leftTreeImage}
            resizeMode="stretch"
          />
        </View>

        {/* Right Forest - Better Colorful Trees */}
        <View style={styles.rightForest}>
          {/* Main Tree Trunk */}
          <View style={[styles.treeTrunk, { right: 20, width: 25, height: height * 0.8, backgroundColor: '#8B4513' }]} />
          
          {/* Tree Branches */}
          <View style={[styles.treeBranch, { right: 10, top: height * 0.3, width: 40, height: 8, backgroundColor: '#8B4513' }]} />
          <View style={[styles.treeBranch, { right: 35, top: height * 0.25, width: 35, height: 6, backgroundColor: '#8B4513' }]} />
          <View style={[styles.treeBranch, { right: 5, top: height * 0.4, width: 30, height: 6, backgroundColor: '#8B4513' }]} />
          <View style={[styles.treeBranch, { right: 40, top: height * 0.35, width: 25, height: 5, backgroundColor: '#8B4513' }]} />
          
          {/* Green Leaves Clusters */}
          <View style={[styles.leafCluster, { right: 5, top: height * 0.28, width: 20, height: 20, backgroundColor: '#228B22' }]} />
          <View style={[styles.leafCluster, { right: 15, top: height * 0.32, width: 18, height: 18, backgroundColor: '#32CD32' }]} />
          <View style={[styles.leafCluster, { right: 25, top: height * 0.30, width: 16, height: 16, backgroundColor: '#00FF00' }]} />
          <View style={[styles.leafCluster, { right: 35, top: height * 0.23, width: 22, height: 22, backgroundColor: '#228B22' }]} />
          <View style={[styles.leafCluster, { right: 45, top: height * 0.27, width: 20, height: 20, backgroundColor: '#32CD32' }]} />
          <View style={[styles.leafCluster, { right: 0, top: height * 0.38, width: 18, height: 18, backgroundColor: '#00FF00' }]} />
          <View style={[styles.leafCluster, { right: 40, top: height * 0.33, width: 16, height: 16, backgroundColor: '#228B22' }]} />
          <View style={[styles.leafCluster, { right: 50, top: height * 0.37, width: 15, height: 15, backgroundColor: '#32CD32' }]} />
          
          {/* Colorful Fruits */}
          <View style={[styles.fruit, { right: 12, top: height * 0.31, width: 6, height: 6, backgroundColor: '#FF0000' }]} />
          <View style={[styles.fruit, { right: 22, top: height * 0.29, width: 5, height: 5, backgroundColor: '#FF4500' }]} />
          <View style={[styles.fruit, { right: 38, top: height * 0.26, width: 5, height: 5, backgroundColor: '#FFD700' }]} />
          <View style={[styles.fruit, { right: 48, top: height * 0.30, width: 6, height: 6, backgroundColor: '#FF69B4' }]} />
          <View style={[styles.fruit, { right: 8, top: height * 0.40, width: 5, height: 5, backgroundColor: '#9370DB' }]} />
          <View style={[styles.fruit, { right: 45, top: height * 0.35, width: 5, height: 5, backgroundColor: '#FF0000' }]} />
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
  treeTrunk: {
    position: 'absolute',
    borderRadius: 15,
    opacity: 1,
  },
  leafCluster: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.9,
  },
  fruit: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 1,
  },
  leftTreeImage: {
    position: 'absolute',
    left: -20,
    top: 0,
    width: 160,
    height: height * 0.9,
    zIndex: 1,
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
