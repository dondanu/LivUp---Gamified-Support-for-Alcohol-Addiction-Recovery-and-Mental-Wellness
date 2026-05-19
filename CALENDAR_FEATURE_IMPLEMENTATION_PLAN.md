# 📅 Calendar Feature Implementation Plan - Tamil

## 🎯 Overview (மொத்த திட்டம்)

Progress tab-la "Keep Going" box-ku mela oru interactive calendar add pannuvom. User anrha date-ah click panna, annaiku log panna drinks, mood, triggers, notes ellam oru popup-la kaatum.

---

## 📋 Feature Requirements (தேவைகள்)

### 1. **Calendar Display**
- Month-wise calendar view (current month by default)
- Previous/Next month navigation arrows
- Today's date highlight
- Visual indicators for each date:
  - 🟢 **Green dot** - Sober day (0 drinks)
  - 🔴 **Red dot** - Drinks logged (1+ drinks)
  - 🏆 **Gold border** - Achievement unlocked that day
  - ⚪ **Gray** - No data logged / Future dates

### 2. **Date Click Popup**
When user clicks a date, show modal with:
- **Date & Day name** (e.g., "May 19, 2026 - Tuesday")
- **Drinks Count** (e.g., "3 drinks logged")
- **Mood** (with emoji and label)
- **Triggers** (if any logged)
- **Notes** (user's notes for that day)
- **Points earned** that day
- **Achievements unlocked** (if any)
- **Streak status** for that day

### 3. **Calendar Position**
- Place between "Daily Tracking" section and "Smart Insights" section
- OR between "Smart Insights" and the stats cards
- Collapsible/Expandable to save space

---

## 🎨 UI Design Suggestions

### Calendar Component Structure:
```
┌─────────────────────────────────────┐
│  📅 Your Journey Calendar           │
│  ◀ May 2026 ▶                       │
│                                     │
│  Su Mo Tu We Th Fr Sa               │
│  ⚪ ⚪ ⚪ ⚪ 🟢 🟢 🔴               │
│  🟢 🟢 🟢 🟢 🟢 🔴 🔴               │
│  🟢 🏆 🟢 🟢 🟢 🟢 🔴               │
│  🟢 🟢 🟢 🟢 🟢 🟢 🟢               │
│  🟢 🟢 ⚪ ⚪ ⚪ ⚪ ⚪               │
└─────────────────────────────────────┘
```

### Date Detail Popup:
```
┌─────────────────────────────────────┐
│  📅 May 19, 2026 - Tuesday      ✕   │
├─────────────────────────────────────┤
│                                     │
│  🍺 Drinks: 2 drinks                │
│  😊 Mood: Happy                     │
│  🎯 Trigger: Social Event           │
│  📝 Notes: "Had a good day..."      │
│  ⭐ Points: +50 points              │
│  🏆 Achievement: Week Warrior       │
│  🔥 Streak: Day 7 of current streak │
│                                     │
│  [Edit Entry] [Close]               │
└─────────────────────────────────────┘
```

---

## 🛠️ Technical Implementation

### 1. **New Component: CalendarView.tsx**

Create: `Front-end/components/CalendarView.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react-native';

interface CalendarDay {
  date: string; // YYYY-MM-DD
  drinkCount: number;
  mood?: string;
  trigger?: string;
  notes?: string;
  points?: number;
  achievements?: string[];
  streakDay?: number;
}

interface CalendarViewProps {
  data: CalendarDay[];
  onDateClick: (date: string) => void;
}

export default function CalendarView({ data, onDateClick }: CalendarViewProps) {
  // Implementation here
}
```

### 2. **Backend API Endpoint**

Create new endpoint: `GET /api/progress/calendar`

**Request:**
```json
{
  "month": "2026-05",
  "userId": 123
}
```

**Response:**
```json
{
  "success": true,
  "calendar": [
    {
      "date": "2026-05-19",
      "drinkCount": 2,
      "mood": "happy",
      "moodNotes": "Good day",
      "trigger": "social",
      "triggerDescription": "Party with friends",
      "notes": "Had a good time",
      "points": 50,
      "achievements": ["Week Warrior"],
      "streakDay": 7,
      "isSober": false
    },
    // ... more days
  ]
}
```

### 3. **Backend Implementation**

File: `Back-end/src/controllers/progressController.js`

Add new function:
```javascript
exports.getCalendarData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query; // Format: YYYY-MM
    
    // Get all logs for the month
    const drinkLogs = await getDrinkLogsForMonth(userId, month);
    const moodLogs = await getMoodLogsForMonth(userId, month);
    const triggerLogs = await getTriggerLogsForMonth(userId, month);
    const achievements = await getAchievementsForMonth(userId, month);
    
    // Combine data by date
    const calendarData = combineDataByDate({
      drinkLogs,
      moodLogs,
      triggerLogs,
      achievements
    });
    
    res.json({
      success: true,
      calendar: calendarData
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
};
```

### 4. **Frontend API Integration**

File: `Front-end/src/api/progress.ts`

Add new function:
```typescript
export const getCalendarData = async (month: string) => {
  const response = await api.get(`/progress/calendar?month=${month}`);
  return response.data;
};
```

### 5. **Integration in Progress Screen**

File: `Front-end/app/(tabs)/progress.tsx`

Add calendar between sections:
```typescript
{/* Calendar Section */}
{!isAnonymous && (
  <View style={styles.calendarSection}>
    <CalendarView 
      data={calendarData}
      onDateClick={handleDateClick}
    />
  </View>
)}
```

---

## 📊 Data Flow

```
User clicks date
    ↓
CalendarView component
    ↓
Fetch date details from backend
    ↓
Show DateDetailModal with:
  - Drink logs
  - Mood logs
  - Trigger logs
  - Notes
  - Points
  - Achievements
  - Streak info
```

---

## 🎯 Implementation Steps (வரிசை)

### Phase 1: Backend Setup
1. ✅ Create calendar API endpoint
2. ✅ Write query functions for each log type
3. ✅ Combine data by date
4. ✅ Test API with Postman

### Phase 2: Frontend Component
1. ✅ Create CalendarView component
2. ✅ Implement month navigation
3. ✅ Add visual indicators (dots, borders)
4. ✅ Create DateDetailModal component

### Phase 3: Integration
1. ✅ Add calendar to Progress screen
2. ✅ Connect to backend API
3. ✅ Handle loading states
4. ✅ Add error handling

### Phase 4: Polish
1. ✅ Add animations
2. ✅ Optimize performance
3. ✅ Test on different screen sizes
4. ✅ Add accessibility features

---

## 🎨 Styling Suggestions

```typescript
const styles = StyleSheet.create({
  calendarSection: {
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 7 days in a week
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  soberDay: {
    backgroundColor: '#10B981',
    borderRadius: 20,
  },
  drinkDay: {
    backgroundColor: '#EF4444',
    borderRadius: 20,
  },
  achievementDay: {
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 20,
  },
  // ... more styles
});
```

---

## 🔥 Advanced Features (Future Enhancements)

1. **Heatmap View** - Color intensity based on drink count
2. **Streak Visualization** - Highlight consecutive sober days
3. **Export Calendar** - Download as PDF/Image
4. **Comparison View** - Compare this month vs last month
5. **Goal Overlay** - Show progress towards monthly goals
6. **Quick Edit** - Edit entries directly from calendar
7. **Swipe Gestures** - Swipe to change months
8. **Week View** - Alternative weekly calendar view

---

## 💡 My Recommendations (என் யோசனை)

### Best Placement:
**Option 1 (Recommended):** Between "Daily Tracking" and "Smart Insights"
- Users can track today, then see their full month
- Natural flow: Track → View Calendar → See Insights

**Option 2:** Between "Smart Insights" and Stats Cards
- Insights first, then detailed calendar
- Good for users who want overview first

### Visual Indicators Priority:
1. **Primary:** Sober (green) vs Drinks (red)
2. **Secondary:** Achievement border (gold)
3. **Tertiary:** Mood emoji overlay (optional)

### Performance Tips:
- Load only current month by default
- Cache previous/next month data
- Use React.memo for day cells
- Lazy load date details on click

---

## 🧪 Testing Checklist

- [ ] Calendar displays current month correctly
- [ ] Navigation arrows work (prev/next month)
- [ ] Visual indicators show correctly
- [ ] Date click opens modal with correct data
- [ ] Modal shows all logged information
- [ ] Works for dates with no data
- [ ] Works for future dates (disabled)
- [ ] Handles month boundaries correctly
- [ ] Performance is smooth (no lag)
- [ ] Works on different screen sizes
- [ ] Anonymous users see locked state

---

## 📝 Notes

- Calendar should be **collapsible** to save space
- Add a **legend** explaining the color codes
- Consider adding **mini calendar** in header for quick navigation
- Add **loading skeleton** while fetching data
- Handle **timezone** issues properly
- Add **empty state** for new users

---

## 🚀 Ready to Implement?

Sollu da, enna pannanum? 

1. Backend API-ah first create pannalama?
2. Frontend component-ah first build pannalama?
3. Full implementation-ah oru shot-la pannalama?

Unakku enna comfortable-ah irukku, adha follow pannuvom! 💪
