# How to Rebuild App After Adding Music Files

## ⚠️ IMPORTANT: You MUST rebuild the app after adding music files!

When you add music files to `android/app/src/main/res/raw/`, the app needs to be rebuilt for the files to be included in the app bundle.

## Steps to Rebuild:

### Option 1: Using Command Line
```bash
cd Front-end

# For Android
npm run android

# For iOS (if applicable)
npm run ios
```

### Option 2: Using Android Studio
1. Open Android Studio
2. Open the project: `Front-end/android`
3. Click "Build" → "Rebuild Project"
4. Run the app

### Option 3: Clean and Rebuild
```bash
cd Front-end/android
./gradlew clean
cd ..
npm run android
```

## Verify Music File is Added:

1. File location: `Front-end/android/app/src/main/res/raw/peaceful_music.mp3`
2. File name: Use lowercase with underscores (no spaces, no special characters)
3. File format: MP3 format recommended

## After Rebuilding:

1. The app will include the music file in the bundle
2. When you click "Play via App", it should play the music
3. Check the console logs for: `✅ Music started playing: peaceful_music.mp3`

## Troubleshooting:

- **Still showing error?** Make sure:
  - File is in the correct folder: `android/app/src/main/res/raw/`
  - File name matches exactly: `peaceful_music.mp3` (lowercase, underscore)
  - App was fully rebuilt (not just reloaded)
  - Check console for specific error messages

