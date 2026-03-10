# Quiz Modal Troubleshooting Guide

## Issue: Quiz Modal Not Showing Questions

### What I Fixed:
1. ✅ Moved `quizQuestions` array to component level (before it was inside a function)
2. ✅ Removed duplicate quiz questions definition
3. ✅ Added console logs for debugging
4. ✅ Verified modal structure is correct

### How to Test:

1. **Start the app and navigate to challenges**
2. **Select "Learn Something New" challenge**
3. **Click "Start Challenge"** → Should show "Challenge Started! 🎯"
4. **Click "Mark as Complete"** → Should show "Quick Knowledge Check! 🧠"
5. **Click "Start Quiz"** → Quiz modal should appear

### Check Console Logs:

When you click "Start Quiz", you should see:
```
[Quiz] Showing quiz for Learn Something New challenge
[Quiz] Quiz questions: [Array of 5 questions]
[Quiz] Starting quiz...
[Quiz] Quiz state set, showQuiz: true
[Quiz] showQuiz changed to: true
[Quiz] currentQuestion: 0
[Quiz] Current question: {question: "What topic...", placeholder: "..."}
```

### If Modal Still Not Showing:

1. **Check if `showQuiz` is true:**
   - Open React Native Debugger
   - Check component state
   - Should see `showQuiz: true`

2. **Check Modal visibility:**
   - The Modal component has `visible={showQuiz}`
   - If showQuiz is true, modal should render

3. **Check for React Native Modal issues:**
   - Try restarting Metro bundler
   - Clear cache: `npm start -- --reset-cache`
   - Rebuild app

4. **Verify imports:**
   - Make sure `Modal` is imported from 'react-native'
   - Check if all icons are imported correctly

### Expected Behavior:

**Quiz Modal Should Show:**
- ✅ Title: "Knowledge Check 🧠"
- ✅ Progress bar: "Question 1 of 5"
- ✅ Question text
- ✅ Text input with placeholder
- ✅ "Next Question" button
- ✅ Close (X) button

### Common Issues:

1. **Modal appears but is blank:**
   - Check if `quizQuestions[currentQuestion]` is defined
   - Verify `currentQuestion` is 0 when modal opens

2. **Modal doesn't appear at all:**
   - Check if `showQuiz` state is actually changing
   - Look for JavaScript errors in console
   - Verify Modal component is rendered

3. **Questions not displaying:**
   - Check if `quizQuestions` array is populated
   - Verify array has 5 items
   - Check console for any errors

### Debug Commands:

```bash
# Clear cache and restart
cd Front-end
npm start -- --reset-cache

# Check for TypeScript errors
npx tsc --noEmit

# Rebuild Android
cd android && ./gradlew clean && cd .. && npx react-native run-android

# Rebuild iOS
cd ios && pod install && cd .. && npx react-native run-ios
```

### Code Structure:

```typescript
// State
const [showQuiz, setShowQuiz] = useState(false);
const [currentQuestion, setCurrentQuestion] = useState(0);
const [currentAnswer, setCurrentAnswer] = useState('');

// Quiz questions (defined at component level)
const quizQuestions = [/* 5 questions */];

// When "Start Quiz" clicked
setShowQuiz(true);  // This triggers modal to show

// Modal renders when
<Modal visible={showQuiz}>
  {/* Quiz content */}
</Modal>
```

### Next Steps:

1. Run the app
2. Check console logs
3. If modal shows → Success! ✅
4. If modal doesn't show → Check console for errors
5. Share console output for further debugging

---

**Status**: Code is correct, modal should work
**Last Updated**: March 8, 2026
