const axios = require('axios');
require('dotenv').config();

async function testCompleteTask() {
  try {
    // First login to get token
    console.log('🔐 Logging in as aaa...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'aaa',
      password: 'aaa123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // Complete a task
    console.log('📝 Completing task ID 1...');
    const completeResponse = await axios.post(
      'http://localhost:3000/api/tasks/complete',
      { taskId: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('\n✅ Task completed!');
    console.log('Response:', JSON.stringify(completeResponse.data, null, 2));

    // Check if streak is in response
    if (completeResponse.data.currentStreak !== undefined) {
      console.log('\n🔥 STREAK TRACKING IS WORKING!');
      console.log('   Current Streak:', completeResponse.data.currentStreak);
      console.log('   Longest Streak:', completeResponse.data.longestStreak);
    } else {
      console.log('\n❌ STREAK TRACKING NOT WORKING!');
      console.log('   Response does not include streak data');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCompleteTask();
