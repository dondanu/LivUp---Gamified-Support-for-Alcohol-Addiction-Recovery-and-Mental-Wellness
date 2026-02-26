# HOW TO ADD YOUR ANIMATED GIF/VIDEO FILES

## YOU ARE SEEING COLORS BECAUSE YOU HAVEN'T ADDED THE FILES YET!

Follow these steps EXACTLY:

## Step 1: Create the videos folder
```
Front-end/
  assets/
    videos/          <-- CREATE THIS FOLDER
```

## Step 2: Add your 10 GIF or MP4 files
Put your animated files in `Front-end/assets/videos/`:
- meditation.gif (or .mp4)
- exercise.gif (or .mp4)
- journal.gif (or .mp4)
- learning.gif (or .mp4)
- social.gif (or .mp4)
- healthy-meal.gif (or .mp4)
- gratitude.gif (or .mp4)
- podcast.gif (or .mp4)
- breathing.gif (or .mp4)
- help.gif (or .mp4)

## Step 3: Update intro.tsx
Open `Front-end/app/intro.tsx` and change each challenge:

### BEFORE (showing colors):
```typescript
{ 
  id: 1, 
  name: 'Morning Meditation', 
  xp: 15, 
  icon: Heart, 
  category: 'Wellness', 
  colors: ['#4ECDC4', '#44A08D'],
  mediaType: 'gradient',  // <-- THIS IS WHY YOU SEE COLORS
  // mediaSource: require('../assets/videos/meditation.mp4'),
},
```

### AFTER (showing your GIF/video):
```typescript
{ 
  id: 1, 
  name: 'Morning Meditation', 
  xp: 15, 
  icon: Heart, 
  category: 'Wellness', 
  colors: ['#4ECDC4', '#44A08D'],
  mediaType: 'gif',  // <-- CHANGE TO 'gif' or 'video'
  mediaSource: require('../assets/videos/meditation.gif'),  // <-- UNCOMMENT THIS
},
```

## Step 4: Restart the app
```
npm start -- --reset-cache
```

## WHERE TO GET ANIMATED GIFS:
- https://giphy.com - Search for "3D character exercise", "3D meditation", etc.
- https://lottiefiles.com - Animated characters
- https://www.pexels.com/videos - Free stock videos
- Create your own using Blender or other 3D software

## THAT'S IT!
Once you add the files and update the code, you'll see your animated backgrounds instead of colors.
