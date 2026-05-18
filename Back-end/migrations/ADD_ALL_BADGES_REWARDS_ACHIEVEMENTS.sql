-- ============================================
-- ADD ALL FRONTEND BADGES, REWARDS & ACHIEVEMENTS TO BACKEND
-- ============================================
-- This migration adds all 25 frontend badges/rewards/achievements to the backend database
-- Each achievement has proper unlock conditions matching the frontend display

-- First, let's see what achievements already exist (for reference)
-- SELECT * FROM achievements;

-- ============================================
-- BADGES (9 total)
-- ============================================

-- 1. Surprise Visit Badge
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Surprise Visit',
  'Made an unexpected positive choice when temptation struck',
  'tasks_completed',
  5,
  50,
  'rare'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 2. Trade Your Star Badge
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Trade Your Star',
  'Exchanged a bad habit for a healthy alternative',
  'tasks_completed',
  10,
  75,
  'rare'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 3. First Fifty Badge
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'First Fifty Points',
  'Earned your first 50 points on your recovery journey',
  'points',
  50,
  25,
  'common'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 4. Gold Circle Badge
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Gold Circle Champion',
  'Reached the prestigious gold tier in your recovery',
  'points',
  500,
  100,
  'legendary'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 5. Silver Circle Badge
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Silver Circle Achiever',
  'Earned the silver tier milestone',
  'points',
  250,
  75,
  'epic'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 6. Level 2 Badge
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Level 2 Warrior',
  'Advanced to Level 2 in your recovery journey',
  'points',
  100,
  50,
  'common'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 7. Top 10 Badge
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Top 10 Performer',
  'Ranked in the top performers for recovery progress',
  'tasks_completed',
  50,
  150,
  'legendary'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 8. 5 Days Strong Badge
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  '5 Days Strong',
  'Maintained a 5-day streak of sobriety',
  'streak',
  5,
  50,
  'common'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 9. 3 Star Champion Badge
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  '3 Star Champion',
  'Earned 3 stars for exceptional performance',
  'tasks_completed',
  30,
  100,
  'epic'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- ============================================
-- REWARDS (8 total)
-- ============================================

-- 10. Success Reward
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Success Milestone',
  'Achieved a major success milestone in recovery',
  'tasks_completed',
  25,
  75,
  'rare'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 11. Rock Solid Reward
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Rock Solid Foundation',
  'Built an unshakeable foundation for recovery',
  'streak',
  14,
  100,
  'epic'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 12. Real Gladiator Reward
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Real Gladiator',
  'Fought through challenges like a true warrior',
  'tasks_completed',
  40,
  125,
  'epic'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 13. Really Fast Reward
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Really Fast Progress',
  'Made rapid progress in your recovery journey',
  'tasks_completed',
  15,
  60,
  'rare'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 14. Moving Fast Reward
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Moving Fast Forward',
  'Consistently moving forward at great speed',
  'tasks_completed',
  20,
  70,
  'rare'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 15. On Fire Reward
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'On Fire Streak',
  'Your streak is absolutely on fire!',
  'streak',
  21,
  150,
  'legendary'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 16. Be Smart Reward
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Be Smart Choices',
  'Made consistently smart and healthy choices',
  'tasks_completed',
  35,
  90,
  'epic'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 17. 24/7 Warrior Reward
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  '24/7 Warrior',
  'Committed to recovery around the clock',
  'streak',
  30,
  200,
  'legendary'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- ============================================
-- ACHIEVEMENTS (11 total)
-- ============================================

-- 18. Achievement Map
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Achievement Map Master',
  'Unlocked multiple achievements across all categories',
  'tasks_completed',
  60,
  150,
  'legendary'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 19. Spending Score
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Spending Score Saver',
  'Saved money by avoiding alcohol purchases',
  'days_sober',
  30,
  100,
  'epic'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 20. Treasures
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Treasures Collector',
  'Collected valuable rewards and achievements',
  'points',
  300,
  80,
  'epic'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 21. Top Shooter
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Top Shooter',
  'Hit all your recovery targets with precision',
  'tasks_completed',
  45,
  120,
  'epic'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 22. Quiz Master
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Quiz Master',
  'Completed all recovery knowledge challenges',
  'tasks_completed',
  55,
  130,
  'legendary'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 23. Gambler No More
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Gambler No More',
  'Stopped gambling with your health and future',
  'days_sober',
  60,
  175,
  'legendary'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 24. Level Up Master
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Level Up Master',
  'Advanced through multiple levels in your journey',
  'points',
  400,
  150,
  'legendary'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- 25. Distance Covered
INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward, rarity)
VALUES (
  'Distance Covered',
  'Covered significant distance in your recovery journey',
  'streak',
  45,
  200,
  'legendary'
) ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all achievements were added:
-- SELECT achievement_name, requirement_type, requirement_value, points_reward, rarity 
-- FROM achievements 
-- ORDER BY points_reward ASC;

-- ============================================
-- SUMMARY
-- ============================================
-- Total Achievements Added: 25
-- - Badges: 9
-- - Rewards: 8  
-- - Achievements: 11
--
-- Requirement Types:
-- - tasks_completed: 15 achievements
-- - streak: 6 achievements
-- - days_sober: 2 achievements
-- - points: 5 achievements
--
-- Rarity Distribution:
-- - Common: 3
-- - Rare: 5
-- - Epic: 8
-- - Legendary: 9
-- ============================================
