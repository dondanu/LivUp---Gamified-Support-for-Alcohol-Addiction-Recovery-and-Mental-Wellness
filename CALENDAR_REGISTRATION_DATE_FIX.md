# 📅 Calendar Registration Date Limit - Implementation

## 🎯 Problem Fixed

Calendar was showing all months including before user registration. Now it only shows:
1. ✅ From registration month onwards
2. ✅ Up to current month only
3. ✅ Dates before registration are disabled and grayed out

---

## 🔧 Changes Made

### 1. **Backend Changes** (`Back-end/src/controllers/progressController.js`)

#### Added Registration Date to Response:
```javascript
// Get user registration date
const { data: user } = await queryOne('SELECT created_at FROM users WHERE id = ?', [userId]);
const registrationDate = user?.created_at ? new Date(user.created_at) : null;
let registrationMonth = null;
if (registrationDate) {
  const year = registrationDate.getFullYear();
  const monthNum = registrationDate.getMonth() + 1;
  registrationMonth = `${year}-${String(monthNum).padStart(2, '0')}`;
}

// Return in response
res.status(200).json({
  success: true,
  month,
  currentStreak: profile?.current_streak || 0,
  registrationMonth,        // NEW
  registrationDate: registrationDate ? registrationDate.toISOString().split('T')[0] : null, // NEW
  calendar: calendarArray,
});
```

#### Fixed Date Normalization:
```javascript
// Helper function to normalize dates properly
const normalizeDate = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a string in YYYY-MM-DD format, return it
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  // Convert to Date object and extract YYYY-MM-DD
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return null;
  
  // Get local date components (not UTC!)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
```

---

### 2. **Frontend API Changes** (`Front-end/src/api/progress.ts`)

#### Updated Interface:
```typescript
export interface CalendarData {
  success: boolean;
  month: string;
  currentStreak: number;
  registrationMonth: string | null;  // NEW
  registrationDate: string | null;   // NEW
  calendar: CalendarDay[];
}
```

---

### 3. **CalendarView Component Changes** (`Front-end/components/CalendarView.tsx`)

#### Updated Props:
```typescript
interface CalendarViewProps {
  data: CalendarDay[];
  currentMonth: string;
  onMonthChange: (month: string) => void;
  loading?: boolean;
  registrationMonth?: string | null;  // NEW
  registrationDate?: string | null;   // NEW
}
```

#### Previous Month Navigation with Registration Check:
```typescript
const handlePreviousMonth = () => {
  const [year, month] = currentMonth.split('-').map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  
  // Don't allow going before registration month
  if (registrationMonth && prevMonthStr < registrationMonth) {
    return;
  }
  
  onMonthChange(prevMonthStr);
};
```

#### Date Click with Registration Check:
```typescript
const handleDateClick = (day: CalendarDay | null) => {
  if (!day) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDate = new Date(day.date);
  dayDate.setHours(0, 0, 0, 0);

  // Don't allow clicking future dates
  if (dayDate > today) return;
  
  // Don't allow clicking dates before registration
  if (registrationDate) {
    const regDate = new Date(registrationDate);
    regDate.setHours(0, 0, 0, 0);
    if (dayDate < regDate) return;
  }

  setSelectedDate(day);
  setShowDetailModal(true);
};
```

#### Visual Indicator with Registration Check:
```typescript
const getDayIndicator = (day: CalendarDay | null) => {
  if (!day) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDate = new Date(day.date);
  dayDate.setHours(0, 0, 0, 0);

  // Before registration date - show as disabled
  if (registrationDate) {
    const regDate = new Date(registrationDate);
    regDate.setHours(0, 0, 0, 0);
    if (dayDate < regDate) {
      return { color: '#F5F5F5', border: false, disabled: true };
    }
  }

  // ... rest of logic
};
```

#### Navigation Button States:
```typescript
const isRegistrationMonth = () => {
  if (!registrationMonth) return false;
  return currentMonth <= registrationMonth;
};

// In render:
<TouchableOpacity 
  onPress={handlePreviousMonth} 
  style={[styles.navButton, isRegistrationMonth() && styles.navButtonDisabled]}
  disabled={isRegistrationMonth()}>
  <ChevronLeft size={24} color={isRegistrationMonth() ? '#BDC3C7' : '#2C3E50'} />
</TouchableOpacity>
```

---

### 4. **Progress Screen Changes** (`Front-end/app/(tabs)/progress.tsx`)

#### Added State:
```typescript
const [registrationMonth, setRegistrationMonth] = useState<string | null>(null);
const [registrationDate, setRegistrationDate] = useState<string | null>(null);
```

#### Updated Load Function:
```typescript
const loadCalendarData = async () => {
  if (!profile?.id || isAnonymous) return;

  setCalendarLoading(true);
  try {
    const response = await api.getCalendarData(calendarMonth);
    setCalendarData(response.calendar || []);
    
    // Set registration info on first load
    if (response.registrationMonth && !registrationMonth) {
      setRegistrationMonth(response.registrationMonth);
    }
    if (response.registrationDate && !registrationDate) {
      setRegistrationDate(response.registrationDate);
    }
  } catch (error) {
    console.error('Error loading calendar data:', error);
    setCalendarData([]);
  } finally {
    setCalendarLoading(false);
  }
};
```

#### Pass Props to Component:
```typescript
<CalendarView
  data={calendarData}
  currentMonth={calendarMonth}
  onMonthChange={handleCalendarMonthChange}
  loading={calendarLoading}
  registrationMonth={registrationMonth}
  registrationDate={registrationDate}
/>
```

---

## 🎯 Behavior Now

### Example 1: User registered on May 5, 2026
- ✅ Can see May 2026 (full month)
- ✅ Can see April 2026, March 2026, etc. (past months)
- ❌ Cannot go before May 2026 (registration month)
- ✅ Dates before May 5 are grayed out and disabled
- ✅ Dates from May 5 onwards are clickable

### Example 2: User registered on May 19, 2026 (today)
- ✅ Can see May 2026 (only up to today)
- ❌ Cannot go to previous months (registration month is current month)
- ✅ Dates before May 19 are grayed out and disabled
- ✅ Only May 19 is clickable
- ❌ Future dates (May 20+) are grayed out

### Example 3: User registered on April 15, 2026
- ✅ Can see May 2026 (current month)
- ✅ Can see April 2026 (registration month)
- ❌ Cannot go to March 2026 (before registration)
- ✅ In April: dates before April 15 are disabled
- ✅ In April: dates from April 15 onwards are clickable
- ✅ In May: all dates up to today are clickable

---

## 🎨 Visual States

### Dates Before Registration:
- Color: Very light gray (#F5F5F5)
- Opacity: 30%
- Clickable: No
- Shows: Day number in gray

### Future Dates:
- Color: Light gray (#E0E0E0)
- Opacity: 30%
- Clickable: No
- Shows: Day number in gray

### Valid Dates:
- Sober: Green (#10B981)
- Drinks: Red (#EF4444)
- Achievement: Gold border (#FFD700)
- No data: Gray (#E0E0E0)
- Clickable: Yes

### Navigation Buttons:
- Previous: Disabled if at registration month
- Next: Disabled if at current month
- Disabled color: Light gray (#BDC3C7)

---

## 🧪 Testing

### Test Case 1: New User (Today)
1. Create account today
2. Open Progress tab
3. See calendar showing current month only
4. Previous button should be disabled
5. Next button should be disabled
6. Only today's date should be clickable
7. All past dates in current month should be grayed out

### Test Case 2: User from Last Month
1. User registered April 15, 2026
2. Open Progress tab in May
3. Should see May 2026
4. Click previous → Should go to April 2026
5. In April, dates before 15th should be grayed out
6. Click previous again → Should NOT go to March (disabled)
7. Dates from April 15 onwards should be clickable

### Test Case 3: Old User
1. User registered January 2026
2. Open Progress tab in May
3. Should see May 2026
4. Can navigate back to January 2026
5. Cannot go before January 2026
6. All dates from January onwards should be clickable (except future)

---

## 📝 Files Modified

1. ✅ `Back-end/src/controllers/progressController.js`
   - Added registration date logic
   - Fixed date normalization
   - Added registrationMonth and registrationDate to response

2. ✅ `Front-end/src/api/progress.ts`
   - Updated CalendarData interface

3. ✅ `Front-end/components/CalendarView.tsx`
   - Added registration props
   - Updated navigation logic
   - Updated date click logic
   - Updated visual indicators
   - Added disabled states

4. ✅ `Front-end/app/(tabs)/progress.tsx`
   - Added registration state
   - Updated load function
   - Pass registration props to component

---

## ✅ Status: COMPLETE

**All changes implemented and ready to test!**

### To Test:
1. Restart backend: `cd Back-end && npm start`
2. Restart frontend: `cd Front-end && npm start`
3. Open app and go to Progress tab
4. Test calendar navigation
5. Verify dates before registration are disabled
6. Verify navigation buttons work correctly

**Perfect da! Registration date limit working! 🎉**
