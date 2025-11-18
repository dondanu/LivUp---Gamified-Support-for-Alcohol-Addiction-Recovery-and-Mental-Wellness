export interface Profile {
  id: string;
  user_id?: string;
  username: string | null;
  avatar_level: number;
  is_anonymous: boolean;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  level: string;
  created_at: string;
  updated_at: string;
}

export interface DrinkLog {
  id: string;
  user_id: string;
  date: string;
  drinks_count: number;
  notes: string;
  created_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  date: string;
  mood: string;
  notes: string;
  created_at: string;
}

export interface TriggerLog {
  id: string;
  user_id: string;
  date: string;
  trigger_type: string;
  description: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points_reward: number;
  difficulty: string;
  is_active: boolean;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  completed_at: string | null;
  created_at: string;
  challenges?: Challenge;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  created_at: string;
  badges?: Badge;
}

export interface HealthyAlternative {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
}

export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  is_active: boolean;
  created_at: string;
}
