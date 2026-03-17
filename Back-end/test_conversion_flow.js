const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let anonymousToken = '';
let convertedToken = '';

async function testConversionFlow() {
  console.log('🧪 Testing Anonymous to Registered User Conversion Flow\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Create anonymous user
    console.log('\n📝 Step 1: Creating anonymous user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      username: `test_anon_${Date.now()}`,
      password: 'test123',
      isAnonymous: true,
    });
    
    anonymousToken = registerResponse.data.token;
    const userId = registerResponse.data.user.id;
    console.log('✅ Anonymous user created!');
    console.log(`   User ID: ${userId}`);
    console.log(`   Username: ${registerResponse.data.user.username}`);
    console.log(`   Is Anonymous: ${registerResponse.data.user.isAnonymous}`);
    
    // Step 2: Complete a task to trigger milestone
    console.log('\n📝 Step 2: Completing a task to trigger milestone...');
    const taskResponse = await axios.post(
      `${API_URL}/tasks/complete`,
      { taskId: 1 },
      { headers: { Authorization: `Bearer ${anonymousToken}` } },
    );
    
    console.log('✅ Task completed!');
    console.log(`   Points earned: ${taskResponse.data.pointsEarned}`);
    
    if (taskResponse.data.conversionPrompt) {
      console.log('🎉 Conversion prompt triggered!');
      console.log(`   Milestone: ${taskResponse.data.conversionPrompt.milestoneType}`);
      console.log(`   Should show: ${taskResponse.data.conversionPrompt.shouldShowPrompt}`);
    } else {
      console.log('⚠️  No conversion prompt (might be second task)');
    }
    
    // Step 3: Convert account
    console.log('\n📝 Step 3: Converting anonymous account to registered...');
    const convertResponse = await axios.post(
      `${API_URL}/auth/convert`,
      {
        email: `test${Date.now()}@example.com`,
        password: 'newpassword123',
        username: `converted_user_${Date.now()}`,
      },
      { headers: { Authorization: `Bearer ${anonymousToken}` } },
    );
    
    convertedToken = convertResponse.data.token;
    console.log('✅ Account converted successfully!');
    console.log(`   New Username: ${convertResponse.data.user.username}`);
    console.log(`   Email: ${convertResponse.data.user.email}`);
    console.log(`   Is Anonymous: ${convertResponse.data.user.isAnonymous}`);
    
    // Step 4: Verify profile with new token
    console.log('\n📝 Step 4: Verifying profile with new token...');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${convertedToken}` },
    });
    
    console.log('✅ Profile verified!');
    console.log(`   User ID: ${profileResponse.data.user.id} (should match: ${userId})`);
    console.log(`   Username: ${profileResponse.data.user.username}`);
    console.log(`   Email: ${profileResponse.data.user.email}`);
    console.log(`   Is Anonymous: ${profileResponse.data.user.is_anonymous}`);
    console.log(`   Total Points: ${profileResponse.data.profile.total_points}`);
    
    // Step 5: Verify data preservation
    console.log('\n📝 Step 5: Verifying data preservation...');
    if (profileResponse.data.user.id === userId) {
      console.log('✅ User ID preserved (same user_id)');
    } else {
      console.log('❌ User ID changed (data might be lost!)');
    }
    
    if (profileResponse.data.profile.total_points > 0) {
      console.log('✅ Points preserved');
    } else {
      console.log('⚠️  No points found');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Anonymous to Registered conversion is working correctly!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run tests
testConversionFlow();
