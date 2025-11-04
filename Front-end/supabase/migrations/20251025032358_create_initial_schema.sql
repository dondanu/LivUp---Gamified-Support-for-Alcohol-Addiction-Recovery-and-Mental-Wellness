/*
  # Initial Schema for Alcohol Addiction Recovery App

  ## Overview
  This migration creates the complete database schema for a gamified alcohol addiction recovery application.

  ## New Tables

  ### 1. profiles
  Extends Supabase auth.users with additional profile information
  - `id` (uuid, references auth.users): Primary key
  - `username` (text): Display name
  - `avatar_level` (integer): Avatar upgrade level based on progress
  - `is_anonymous` (boolean): Whether user is in anonymous mode
  - `total_points` (integer): Accumulated gamification points
  - `current_streak` (integer): Current consecutive sober days
  - `longest_streak` (integer): Record of longest sober streak
  - `level` (text): User level (Beginner, Fighter, Champion, Hero)
  - `created_at` (timestamptz): Account creation timestamp
  - `updated_at` (timestamptz): Last profile update

  ### 2. drink_logs
  Tracks daily drinking records
  - `id` (uuid): Primary key
  - `user_id` (uuid): References profiles
  - `date` (date): Date of log entry
  - `drinks_count` (integer): Number of drinks consumed
  - `notes` (text): Optional notes about the drinking session
  - `created_at` (timestamptz): Log creation timestamp

  ### 3. mood_logs
  Daily mood tracking with emoji-based selections
  - `id` (uuid): Primary key
  - `user_id` (uuid): References profiles
  - `date` (date): Date of mood log
  - `mood` (text): Mood type (happy, sad, stressed, anxious, calm, energetic)
  - `notes` (text): Optional notes about mood
  - `created_at` (timestamptz): Log creation timestamp

  ### 4. trigger_logs
  Records reasons/triggers for drinking episodes
  - `id` (uuid): Primary key
  - `user_id` (uuid): References profiles
  - `date` (date): Date of trigger event
  - `trigger_type` (text): Category (stress, social, boredom, celebration, sadness, anger, other)
  - `description` (text): Detailed description of trigger
  - `created_at` (timestamptz): Log creation timestamp

  ### 5. challenges
  Master list of available challenges
  - `id` (uuid): Primary key
  - `title` (text): Challenge name
  - `description` (text): Challenge details
  - `points_reward` (integer): Points earned on completion
  - `difficulty` (text): Easy, Medium, Hard
  - `is_active` (boolean): Whether challenge is currently available
  - `created_at` (timestamptz): Challenge creation timestamp

  ### 6. user_challenges
  Tracks user progress on challenges
  - `id` (uuid): Primary key
  - `user_id` (uuid): References profiles
  - `challenge_id` (uuid): References challenges
  - `status` (text): pending, in_progress, completed
  - `completed_at` (timestamptz): Completion timestamp
  - `created_at` (timestamptz): Assignment timestamp

  ### 7. badges
  Master list of achievement badges
  - `id` (uuid): Primary key
  - `name` (text): Badge name
  - `description` (text): Badge requirements
  - `icon` (text): Icon identifier
  - `requirement_type` (text): Type of requirement (streak, days_sober, challenges)
  - `requirement_value` (integer): Threshold to earn badge
  - `created_at` (timestamptz): Badge creation timestamp

  ### 8. user_badges
  Tracks badges earned by users
  - `id` (uuid): Primary key
  - `user_id` (uuid): References profiles
  - `badge_id` (uuid): References badges
  - `earned_at` (timestamptz): When badge was earned
  - `created_at` (timestamptz): Record creation timestamp

  ### 9. healthy_alternatives
  Suggested activities to replace drinking
  - `id` (uuid): Primary key
  - `title` (text): Activity name
  - `description` (text): Activity details
  - `category` (text): exercise, food, creative, social, relaxation
  - `duration_minutes` (integer): Estimated time commitment
  - `created_at` (timestamptz): Record creation timestamp

  ### 10. emergency_contacts
  User's support contacts for crisis situations
  - `id` (uuid): Primary key
  - `user_id` (uuid): References profiles
  - `name` (text): Contact name
  - `phone` (text): Phone number
  - `relationship` (text): Relationship to user
  - `is_primary` (boolean): Whether this is primary emergency contact
  - `created_at` (timestamptz): Record creation timestamp

  ### 11. motivational_quotes
  Daily motivational content
  - `id` (uuid): Primary key
  - `quote` (text): Motivational quote text
  - `author` (text): Quote author
  - `is_active` (boolean): Whether quote is active
  - `created_at` (timestamptz): Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Public read access for master data (challenges, badges, quotes, healthy_alternatives)
  - Authenticated users required for all operations

  ## Important Notes
  1. All tables use UUID primary keys for security
  2. Timestamps are in UTC timezone
  3. RLS policies ensure data isolation between users
  4. Default values prevent null-related issues
  5. Indexes on foreign keys for query performance
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_level integer DEFAULT 1,
  is_anonymous boolean DEFAULT false,
  total_points integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  level text DEFAULT 'Beginner',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create drink_logs table
CREATE TABLE IF NOT EXISTS drink_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  drinks_count integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create mood_logs table
CREATE TABLE IF NOT EXISTS mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  mood text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create trigger_logs table
CREATE TABLE IF NOT EXISTS trigger_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  trigger_type text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points_reward integer DEFAULT 10,
  difficulty text DEFAULT 'Easy',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create healthy_alternatives table
CREATE TABLE IF NOT EXISTS healthy_alternatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  duration_minutes integer DEFAULT 15,
  created_at timestamptz DEFAULT now()
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text DEFAULT '',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create motivational_quotes table
CREATE TABLE IF NOT EXISTS motivational_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  author text DEFAULT 'Anonymous',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_drink_logs_user_date ON drink_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_user_date ON trigger_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON emergency_contacts(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthy_alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivational_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for drink_logs
CREATE POLICY "Users can view own drink logs"
  ON drink_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drink logs"
  ON drink_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drink logs"
  ON drink_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own drink logs"
  ON drink_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for mood_logs
CREATE POLICY "Users can view own mood logs"
  ON mood_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood logs"
  ON mood_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood logs"
  ON mood_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood logs"
  ON mood_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for trigger_logs
CREATE POLICY "Users can view own trigger logs"
  ON trigger_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trigger logs"
  ON trigger_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trigger logs"
  ON trigger_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trigger logs"
  ON trigger_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for challenges (public read, admin write)
CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user_challenges
CREATE POLICY "Users can view own challenges"
  ON user_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON user_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON user_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for healthy_alternatives (public read)
CREATE POLICY "Anyone can view healthy alternatives"
  ON healthy_alternatives FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view own emergency contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for motivational_quotes (public read)
CREATE POLICY "Anyone can view active motivational quotes"
  ON motivational_quotes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at, updated_at)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', 'User'), now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();