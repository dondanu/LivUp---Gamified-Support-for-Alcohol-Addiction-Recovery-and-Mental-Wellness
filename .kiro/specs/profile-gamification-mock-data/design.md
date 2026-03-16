# Design Document: Profile Gamification Mock Data

## Overview

This feature implements a mock data system that provides realistic gamification data for the user profile page. The system will generate consistent, motivating mock data that replaces zero values with meaningful progression states, enabling effective testing and demonstration of the gamification features.

The mock data system will integrate with the existing gamification profile structure, providing realistic values for user levels, points, streaks, and badges while maintaining mathematical consistency between all elements.

## Architecture

The mock data system follows a layered architecture:

1. **Configuration Layer**: Manages mock data enable/disable state
2. **Data Generation Layer**: Creates realistic, consistent mock data
3. **Integration Layer**: Seamlessly integrates with existing profile data flow
4. **Presentation Layer**: Displays mock data through existing UI components

The system will be implemented as a service that can be toggled on/off, allowing developers to switch between real and mock data for testing purposes.

## Components and Interfaces

### MockDataService

The core service responsible for generating and managing mock data:

```typescript
interface MockDataService {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  generateMockProfile(): MockGamificationProfile;
  generateMockAchievements(): MockUserAchievement[];
}
```

### MockGamificationProfile

Extended profile interface that includes mock data:

```typescript
interface MockGamificationProfile extends GamificationProfile {
  isMockData: boolean;
  profile: {
    id: string;
    user_id: string;
    total_points: number;        // 250-8500
    current_streak: number;      // 1-45
    longest_streak: number;      // 5-100
    level_id: number;           // 1-10
    avatar_type: string;
    days_sober: number;
    created_at: string;
    updated_at: string;
  };
  currentLevel: Level;
  nextLevel: Level | null;
  achievements: MockUserAchievement[];
  progressToNextLevel: string;
}
```

### MockUserAchievement

Achievement data with realistic earned dates:

```typescript
interface MockUserAchievement extends UserAchievement {
  id: string;
  user_id: string;
  achievement_id: number;
  earned_at: string;           // Realistic dates based on progression
  achievement: {
    id: number;
    achievement_name: string;  // Realistic achievement names
    description: string;       // Motivating descriptions
    points_required: number;
    icon: string | null;
  };
}
```

### MockDataConfig

Configuration interface for mock data settings:

```typescript
interface MockDataConfig {
  enabled: boolean;
  seed?: number;              // For consistent mock data generation
  profileTemplate?: 'beginner' | 'intermediate' | 'advanced';
}
```

## Data Models

### Mock Data Generation Rules

**Level Progression:**
- Levels 1-10 with corresponding point thresholds
- Level 1: 0-999 points
- Level 2: 1000-1999 points
- Level 3: 2000-2999 points
- And so on...

**Points Distribution:**
- Beginner: 250-1500 points (Levels 1-2)
- Intermediate: 1500-4500 points (Levels 2-5)
- Advanced: 4500-8500 points (Levels 5-9)

**Streak Logic:**
- Current streak: 1-45 days
- Best streak: Always >= current streak
- Best streak range: 5-100 days
- Realistic progression showing growth over time

**Badge Categories:**
- Streak Milestones: "First Week", "Two Weeks Strong", "Month Champion"
- Point Milestones: "Getting Started", "Point Collector", "High Achiever"
- Special Achievements: "Early Bird", "Consistent Logger", "Challenge Master"
- Badge count: 1-12 earned badges

### Mock Achievement Templates

```typescript
const MOCK_ACHIEVEMENTS = [
  {
    achievement_name: "First Steps",
    description: "Started your wellness journey",
    points_required: 0,
    category: "milestone"
  },
  {
    achievement_name: "Week Warrior",
    description: "Maintained a 7-day streak",
    points_required: 100,
    category: "streak"
  },
  {
    achievement_name: "Point Collector",
    description: "Earned your first 1000 points",
    points_required: 1000,
    category: "points"
  },
  {
    achievement_name: "Consistency King",
    description: "Logged progress for 30 days",
    points_required: 500,
    category: "engagement"
  }
];
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Let me analyze the acceptance criteria to determine testable properties:

### Property 1: Mock data value ranges
*For any* generated mock profile, all values should fall within their specified ranges: levels (1-10), points (250-8500), current streaks (1-45), best streaks (5-100), and badge counts (1-12)
**Validates: Requirements 1.1, 2.1, 3.1, 3.2, 4.1**

### Property 2: Level-points mathematical consistency
*For any* generated mock profile, the user level should correspond correctly to the total points using incremental thresholds (Level 1: 0-999, Level 2: 1000-1999, etc.)
**Validates: Requirements 1.3, 2.3, 2.4**

### Property 3: Points progress display format
*For any* mock profile with points, the progress display should contain both current points and next level target in the format "current / target points"
**Validates: Requirements 2.2**

### Property 4: Streak relationship invariant
*For any* generated mock profile, the best streak should always be greater than or equal to the current streak
**Validates: Requirements 3.3**

### Property 5: Badge variety requirement
*For any* generated mock badge collection, it should include multiple achievement types (streak milestones, point milestones, special achievements)
**Validates: Requirements 4.3**

### Property 6: Badge earned dates consistency
*For any* generated mock badges, the earned dates should be in chronological order and align with realistic user progression timelines
**Validates: Requirements 4.4**

### Property 7: No zero values in mock data
*For any* generated mock profile when mock data is active, all gamification values (points, streaks, badges, level) should be non-zero
**Validates: Requirements 5.3**

### Property 8: Immediate data availability
*For any* system load with mock data enabled, mock profile data should be available immediately without requiring user interaction
**Validates: Requirements 5.4**

### Property 9: Mock data toggle consistency
*For any* mock data session, toggling mock mode on should return mock values, toggling off should return real values, and multiple calls within a session should return consistent mock data
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

## Error Handling

The mock data system will handle the following error scenarios:

### Configuration Errors
- Invalid mock data configuration will fall back to default settings
- Missing configuration will default to mock data disabled

### Data Generation Errors
- Failed mock data generation will return fallback mock values
- Invalid ranges or constraints will use safe default ranges

### Integration Errors
- If real profile data is unavailable when mock data is disabled, return empty state
- API failures will not affect mock data generation

### Graceful Degradation
- System continues to function with real data if mock data system fails
- Mock data errors are logged but don't break the user experience

## Testing Strategy

The testing approach combines unit tests for specific scenarios with property-based tests for comprehensive validation:

### Unit Testing
- Test specific mock data generation scenarios
- Test configuration enable/disable functionality
- Test integration with existing profile components
- Test error handling and edge cases
- Test UI display of mock data values

### Property-Based Testing
- Use **fast-check** library for TypeScript property-based testing
- Configure each property test to run minimum 100 iterations
- Each property test references its corresponding design document property
- Tag format: **Feature: profile-gamification-mock-data, Property {number}: {property_text}**

**Property Test Configuration:**
- Generate random mock profiles and validate all properties hold
- Test mathematical relationships between gamification elements
- Verify range constraints across all generated values
- Test consistency of mock data across multiple generations
- Validate toggle behavior with random state changes

**Unit Test Focus Areas:**
- Specific mock data templates and scenarios
- Integration points with existing gamification API
- Configuration management and persistence
- Error conditions and fallback behaviors
- UI component rendering with mock data

The dual testing approach ensures both concrete scenarios work correctly and universal properties hold across all possible mock data generations.