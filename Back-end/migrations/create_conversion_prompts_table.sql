-- Migration: Create conversion_prompts table for tracking conversion prompt display
-- Purpose: Track which conversion prompts have been shown to anonymous users to prevent duplicates

CREATE TABLE IF NOT EXISTS conversion_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN (
    'first_achievement',
    'first_challenge',
    'points_150',
    'usage_3_days',
    'usage_7_days'
  )),
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  dismissed BOOLEAN DEFAULT FALSE,
  
  -- Foreign key to users table with cascade delete
  CONSTRAINT fk_conversion_prompts_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate prompts for same milestone
  CONSTRAINT unique_user_milestone 
    UNIQUE (user_id, milestone_type)
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_conversion_prompts_user_id 
  ON conversion_prompts(user_id);

-- Create index for milestone_type queries
CREATE INDEX IF NOT EXISTS idx_conversion_prompts_milestone_type 
  ON conversion_prompts(milestone_type);

-- Add comment to table
COMMENT ON TABLE conversion_prompts IS 'Tracks conversion prompts shown to anonymous users to prevent duplicate prompts for the same milestone';
COMMENT ON COLUMN conversion_prompts.milestone_type IS 'Type of milestone that triggered the prompt: first_achievement, first_challenge, points_150, usage_3_days, usage_7_days';
COMMENT ON COLUMN conversion_prompts.dismissed IS 'Whether the user dismissed the prompt without converting';
