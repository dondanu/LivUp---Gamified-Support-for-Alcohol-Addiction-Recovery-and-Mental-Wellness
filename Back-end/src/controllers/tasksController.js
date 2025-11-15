const { query, queryOne } = require('../config/database');

const getDailyTasks = async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    // Get all tasks first, then filter in code to handle any is_active format
    let sql = 'SELECT * FROM daily_tasks';
    const params = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }

    const limitValue = parseInt(limit) || 100;
    // Use template literal for LIMIT to avoid parameter binding issues
    sql += ` ORDER BY points_reward DESC LIMIT ${limitValue}`;

    console.log(`[Tasks] Executing query: ${sql}`, `Params: [${params.join(', ')}]`);
    const result = await query(sql, params);
    const { data, error } = result;
    
    if (error) {
      console.error('[Tasks] Query error:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
    
    if (!data) {
      console.error('[Tasks] Query returned null/undefined data');
      return res.status(500).json({ error: 'Database query returned no data' });
    }
    
    console.log(`[Tasks] Raw data from query: Array of ${data.length} items`);
    if (data.length > 0) {
      console.log(`[Tasks] First task sample:`, JSON.stringify(data[0], null, 2));
    }
    
    // Filter active tasks in code (handle both 1/0, TRUE/FALSE, and NULL)
    const activeTasks = (data || []).filter(task => {
      const isActive = task.is_active;
      const isActiveValue = isActive === 1 || isActive === true || isActive === '1' || isActive === 'TRUE' || isActive === null || isActive === undefined;
      return isActiveValue;
    });
    
    console.log(`[Tasks] Found ${activeTasks.length} active tasks from ${(data || []).length} total tasks`);
    
    // Map active tasks to challenges format for frontend compatibility
    const tasks = activeTasks.map(task => ({
      id: task.id.toString(),
      title: task.task_name,
      description: task.description,
      points_reward: task.points_reward,
      difficulty: task.difficulty || 'Easy',
      category: task.category,
      is_active: task.is_active,
      created_at: task.created_at
    }));
    
    res.status(200).json({ tasks, challenges: tasks, count: tasks.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId, completionDate } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const { data: task } = await queryOne('SELECT * FROM daily_tasks WHERE id = ?', [taskId]);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const date = completionDate || new Date().toISOString().split('T')[0];

    const { data: existingCompletion } = await queryOne('SELECT * FROM user_daily_tasks WHERE user_id = ? AND task_id = ? AND completion_date = ?', [userId, taskId, date]);

    if (existingCompletion) {
      return res.status(409).json({ error: 'Task already completed for this date' });
    }

    const { data: insertResult, error: insertError } = await query('INSERT INTO user_daily_tasks (user_id, task_id, completion_date) VALUES (?, ?, ?)', [userId, taskId, date]);
    
    if (insertError || !insertResult) {
      return res.status(500).json({ error: 'Failed to complete task', details: insertError?.message });
    }
    
    const { data: completion } = await queryOne('SELECT * FROM user_daily_tasks WHERE id = ?', [insertResult.insertId]);

    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

    const newTotalPoints = profile.total_points + task.points_reward;

    await query('UPDATE user_profiles SET total_points = ?, updated_at = ? WHERE user_id = ?', [newTotalPoints, new Date().toISOString(), userId]);

    res.status(201).json({ message: 'Task completed successfully', completion, pointsEarned: task.points_reward, totalPoints: newTotalPoints });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getUserCompletedTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, limit = 50 } = req.query;

    let sql = 'SELECT udt.*, dt.* FROM user_daily_tasks udt JOIN daily_tasks dt ON udt.task_id = dt.id WHERE udt.user_id = ?';
    const params = [userId];

    if (startDate) {
      sql += ' AND udt.completion_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND udt.completion_date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY udt.completion_date DESC LIMIT ?';
    params.push(parseInt(limit));

    const { data } = await query(sql, params);
    res.status(200).json({ completedTasks: data || [], count: (data || []).length });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getTodayProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const { data: completedToday } = await query('SELECT udt.*, dt.* FROM user_daily_tasks udt JOIN daily_tasks dt ON udt.task_id = dt.id WHERE udt.user_id = ? AND udt.completion_date = ?', [userId, today]);
    const { data: allTasks } = await query('SELECT * FROM daily_tasks WHERE is_active = 1', []);

    const completedTaskIds = new Set((completedToday || []).map(ct => ct.task_id));
    const availableTasks = (allTasks || []).filter(task => !completedTaskIds.has(task.id));
    const totalPointsEarnedToday = (completedToday || []).reduce((sum, ct) => sum + (ct.points_reward || 0), 0);

    res.status(200).json({ today, completedTasks: completedToday || [], availableTasks, completedCount: (completedToday || []).length, totalPointsEarnedToday });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getTaskStatistics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: completedTasks } = await query('SELECT udt.*, dt.category, dt.points_reward FROM user_daily_tasks udt JOIN daily_tasks dt ON udt.task_id = dt.id WHERE udt.user_id = ?', [userId]);

    const tasksArray = completedTasks || [];
    const totalTasksCompleted = tasksArray.length;

    const categoryCounts = tasksArray.reduce((acc, task) => {
      const category = task.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const totalPointsFromTasks = tasksArray.reduce((sum, task) => sum + (task.points_reward || 0), 0);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const last7DaysStr = last7Days.toISOString().split('T')[0];

    const recentTasks = tasksArray.filter(task => task.completion_date >= last7DaysStr);

    res.status(200).json({ statistics: { totalTasksCompleted, categoryCounts, totalPointsFromTasks, tasksCompletedLast7Days: recentTasks.length } });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const uncompleteTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { completionId } = req.params;

    const { data: completion } = await queryOne('SELECT udt.*, dt.points_reward FROM user_daily_tasks udt JOIN daily_tasks dt ON udt.task_id = dt.id WHERE udt.id = ? AND udt.user_id = ?', [completionId, userId]);

    if (!completion) {
      return res.status(404).json({ error: 'Completed task not found' });
    }

    await query('DELETE FROM user_daily_tasks WHERE id = ?', [completionId]);

    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

    const pointsToDeduct = completion.points_reward || 0;
    const newTotalPoints = Math.max(0, profile.total_points - pointsToDeduct);

    await query('UPDATE user_profiles SET total_points = ?, updated_at = ? WHERE user_id = ?', [newTotalPoints, new Date().toISOString(), userId]);

    res.status(200).json({ message: 'Task uncompleted successfully', pointsDeducted: pointsToDeduct, totalPoints: newTotalPoints });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { getDailyTasks, completeTask, getUserCompletedTasks, getTodayProgress, getTaskStatistics, uncompleteTask };
