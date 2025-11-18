-- SQL script to remove duplicate challenges and keep only unique ones
-- Run this in your MySQL database

-- First, see how many duplicates we have
SELECT task_name, COUNT(*) as count 
FROM daily_tasks 
GROUP BY task_name 
HAVING count > 1;

-- Remove duplicates, keeping only the first one (lowest ID) for each task_name
DELETE t1 FROM daily_tasks t1
INNER JOIN daily_tasks t2 
WHERE t1.id > t2.id 
AND t1.task_name = t2.task_name;

-- Verify we now have unique challenges
SELECT COUNT(*) as total_challenges FROM daily_tasks;
SELECT COUNT(DISTINCT task_name) as unique_challenges FROM daily_tasks;

-- Should show the same number (25) for both queries

