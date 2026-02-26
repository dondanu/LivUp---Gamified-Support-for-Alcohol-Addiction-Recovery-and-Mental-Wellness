# Intro Screen Media Setup Guide

## Overview
The intro screen now supports animated 3D character videos/GIFs as backgrounds for each challenge, similar to the reference screenshots provided.

## How to Add Your Videos/GIFs

### Step 1: Create Assets Folder
Create a folder structure for your media files:
```
Front-end/
  assets/
    videos/
      meditation.mp4
      healthy-meal.mp4
      journal.mp4
      learning.mp4
      social.mp4
      exercise.mp4
      gratitude.mp4
      podcast.mp4
      breathing.mp4
      help.mp4
```

Or for GIFs:
```
Front-end/
  assets/
    gifs/
      meditation.gif
      healthy-meal.gif
      ...etc
```

### Step 2: Update Challenge Configuration
Open `Front-end/app/intro.tsx` and update each challenge:

#### For Videos:
```typescript
{ 
  id: 1, 
  name: 'Morning Meditation', 
  xp: 15, 
  icon: Heart, 
  category: 'Wellness', 
  colors: ['#4ECDC4', '#44A08D'],
  mediaType: 'video', // Change from 'gradient' to 'video'
  mediaSource: require('../assets/videos/meditation.mp4'), // Uncomment and update path
},
```

#### For GIFs:
```typescript
{ 
  id: 2, 
  name: 'Healthy Meal', 
  xp: 10, 
  icon: Activity, 
  category: 'Health', 
  colors: ['#F39C12', '#E67E22'],
  mediaType: 'gif', // Change from 'gradient' to 'gif'
  mediaSource: require('../assets/gifs/healthy-meal.gif'), // Uncomment and update path
},
```

### Step 3: Recommended Video Specifications
For best performance and quality:
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1080x1920 (portrait) or 720x1280
- **Duration**: 3-5 seconds (will loop automatically)
- **File Size**: Keep under 5MB per video
- **Frame Rate**: 30fps
- **Bitrate**: 2-4 Mbps

### Step 4: Challenge Media Suggestions
Based on your 10 challenges, here are suggestions for each:

1. **Morning Meditation** - Character sitting cross-legged, peaceful pose, soft breathing animation
2. **Healthy Meal** - Character preparing/eating healthy food
3. **Journal Entry** - Character writing in a journal/notebook
4. **Learn Something New** - Character reading a book or using tablet
5. **Social Connection** - Character talking/interacting with others
6. **Exercise** - Character doing workout (running, cycling, gym)
7. **Gratitude List** - Character smiling, writing, positive vibes
8. **Listen to Podcast** - Character with headphones, relaxed pose
9. **Deep Breathing** - Character doing breathing exercises
10. **Help Someone** - Character helping/supporting another person

### Step 5: Where to Get 3D Character Animations
- **Mixamo** (free): https://www.mixamo.com - 3D character animations
- **Sketchfab** (free/paid): https://sketchfab.com - Download 3D models
- **Blender** (free): Create custom animations
- **Lottie Files** (free/paid): https://lottiefiles.com - Animated characters
- **Envato Elements** (paid): High-quality 3D character animations

### Step 6: Testing
After adding your media files:
1. Restart the React Native bundler
2. Clear cache: `npm start -- --reset-cache`
3. Rebuild the app if needed
4. Test on both iOS and Android devices

## Current Status
- ✅ Video/GIF support implemented
- ✅ Fallback to gradient backgrounds if no media
- ✅ Auto-looping for videos
- ✅ Smooth transitions between challenges
- ⏳ Waiting for media files to be added

## Notes
- The screen will use gradient backgrounds until you add video/GIF files
- Videos will loop automatically and play muted
- GIFs will loop automatically
- Each challenge transitions every 3 seconds
- Dark overlay ensures text remains readable over any background
