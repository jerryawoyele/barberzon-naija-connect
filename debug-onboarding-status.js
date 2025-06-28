// Debug script to diagnose why ProtectedRoute thinks onboarding is incomplete
// Run this in browser console to get detailed information

console.log('🔍 Debugging Onboarding Status Issue');
console.log('=====================================');

async function diagnoseOnboardingStatus() {
  console.log('📋 Step 1: Check localStorage...');
  
  // Check localStorage
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  console.log('📱 localStorage Data:');
  console.log('  - Has Token:', !!token);
  console.log('  - User ID:', localUser.id);
  console.log('  - Role:', localUser.role);
  console.log('  - Onboarding Status:', localUser.completedOnboarding);
  console.log('  - Full User Object:', localUser);
  console.log('');
  
  if (!token) {
    console.log('❌ No token found! Please login first.');
    return;
  }
  
  console.log('📋 Step 2: Check database profile...');
  
  // Test API profile call
  try {
    const profileResponse = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Database Profile Retrieved:');
      console.log('  - User ID:', profileData.user.id);
      console.log('  - Role:', profileData.user.role);
      console.log('  - Onboarding Status:', profileData.user.completedOnboarding);
      console.log('  - Email Verified:', profileData.user.emailVerified);
      console.log('  - Customer Data:', profileData.user.customer);
      console.log('  - Barber Data:', profileData.user.barber);
      console.log('');
      
      // Compare localStorage vs database
      console.log('📊 localStorage vs Database Comparison:');
      console.log(`  - Role Match: ${localUser.role === profileData.user.role ? '✅' : '❌'} (${localUser.role} vs ${profileData.user.role})`);
      console.log(`  - Onboarding Match: ${localUser.completedOnboarding === profileData.user.completedOnboarding ? '✅' : '❌'} (${localUser.completedOnboarding} vs ${profileData.user.completedOnboarding})`);
      console.log('');
      
      if (profileData.user.completedOnboarding === false) {
        console.log('🚫 ISSUE FOUND: Database shows onboarding incomplete!');
        console.log('📋 Step 3: Testing onboarding completion...');
        await testOnboardingCompletion(profileData.user.role);
      } else if (profileData.user.completedOnboarding === true) {
        console.log('✅ Database shows onboarding completed!');
        console.log('🤔 ProtectedRoute should allow access. Checking for other issues...');
        await checkForOtherIssues();
      } else {
        console.log('⚠️ Database onboarding status is undefined/null');
        console.log('📋 Step 3: Testing onboarding completion...');
        await testOnboardingCompletion(profileData.user.role);
      }
      
    } else {
      console.log('❌ Database Profile Failed:', profileResponse.status);
      const errorText = await profileResponse.text();
      console.log('   Error:', errorText);
      console.log('   Backend may not be running properly.');
    }
    
  } catch (error) {
    console.log('❌ API Error:', error.message);
    console.log('   Backend not available or network issue.');
  }
}

async function testOnboardingCompletion(userType = 'customer') {
  console.log(`🎯 Testing Onboarding Completion for ${userType}...`);
  
  const token = localStorage.getItem('token');
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const testData = {
    userType,
    fullName: localUser.fullName || `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
    phoneNumber: localUser.phoneNumber || '+234 803 123 4567',
    profileImage: '',
    locationLat: 6.5110016,
    locationLng: 3.3685504,
    bookingPreferences: userType === 'customer' ? {
      preferredTime: 'Morning (8AM - 12PM)',
      favoriteServices: ['Haircut', 'Beard Trim'],
      notifications: true
    } : undefined,
    specialties: userType === 'barber' ? ['Fade', 'Beard Trim'] : [],
    hourlyRate: userType === 'barber' ? '5000' : '',
    bio: userType === 'barber' ? 'Professional barber with 5+ years experience' : '',
    shopName: userType === 'barber' ? 'Test Barber Shop' : '',
    shopAddress: userType === 'barber' ? '123 Test Street, Lagos' : '',
    shopPhone: userType === 'barber' ? '+234 803 123 4567' : '',
    isNewShop: userType === 'barber' ? true : undefined
  };
  
  console.log('📤 Sending onboarding completion request...');
  console.log('   Endpoint: /api/auth/onboarding/complete');
  console.log('   Data:', testData);
  
  try {
    const response = await fetch('/api/auth/onboarding/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Onboarding Completion Successful!');
      console.log('   Result:', result);
      
      // Update localStorage
      const updatedUser = {
        ...localUser,
        ...result.user,
        role: result.user.role.toLowerCase()
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('💾 localStorage updated');
      
      // Verify the change took effect
      console.log('🔄 Verifying database update...');
      setTimeout(async () => {
        await verifyOnboardingUpdate();
      }, 1000);
      
    } else {
      const errorText = await response.text();
      console.log('❌ Onboarding Completion Failed');
      console.log('   Status:', response.status);
      console.log('   Error:', errorText);
      
      if (response.status === 404) {
        console.log('🚨 404 Error - API endpoint not found!');
        console.log('   This suggests the backend is not running or routes are not set up correctly.');
        console.log('   Please ensure backend is running on port 5000.');
      }
    }
    
  } catch (error) {
    console.log('❌ Request Error:', error.message);
    console.log('   This suggests network/connection issues.');
  }
}

async function verifyOnboardingUpdate() {
  console.log('🔍 Verifying onboarding was updated in database...');
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Post-Update Database Check:');
      console.log('  - Onboarding Status:', data.user.completedOnboarding);
      console.log('  - Role:', data.user.role);
      
      if (data.user.completedOnboarding === true) {
        console.log('🎉 SUCCESS: Database now shows onboarding completed!');
        console.log('✅ ProtectedRoute should now allow access.');
        console.log('🔄 Try refreshing the page or navigating to /home');
      } else {
        console.log('❌ ISSUE: Database still shows onboarding incomplete');
        console.log('   There may be an issue with the database update logic.');
      }
    } else {
      console.log('❌ Could not verify database state');
    }
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
  }
}

async function checkForOtherIssues() {
  console.log('🔍 Checking for other potential issues...');
  
  // Check if ProtectedRoute is using stale data
  console.log('⚠️ Possible issues:');
  console.log('1. ProtectedRoute might be using cached/stale data');
  console.log('2. Browser cache might need clearing');
  console.log('3. Frontend might need a hard refresh');
  console.log('4. Token might be expired or invalid');
  console.log('');
  console.log('🔧 Suggested fixes:');
  console.log('1. Hard refresh the page (Ctrl+Shift+R)');
  console.log('2. Clear browser cache/storage');
  console.log('3. Re-login if token is old');
  console.log('4. Check browser console for ProtectedRoute logs');
}

function clearAllDataAndRetest() {
  console.log('🧹 Clearing all data for fresh test...');
  
  // Clear localStorage but keep token for re-auth
  const token = localStorage.getItem('token');
  localStorage.clear();
  localStorage.setItem('token', token);
  
  console.log('✅ Data cleared. Refresh page and run diagnoseOnboardingStatus() again.');
}

// Make functions available globally
window.diagnoseOnboardingStatus = diagnoseOnboardingStatus;
window.testOnboardingCompletion = testOnboardingCompletion;
window.verifyOnboardingUpdate = verifyOnboardingUpdate;
window.clearAllDataAndRetest = clearAllDataAndRetest;

console.log('📚 Available Commands:');
console.log('  - diagnoseOnboardingStatus() - Full diagnostic');
console.log('  - testOnboardingCompletion(userType) - Test API completion');
console.log('  - verifyOnboardingUpdate() - Check if DB was updated');
console.log('  - clearAllDataAndRetest() - Clear data and start fresh');
console.log('');
console.log('🚀 Run diagnoseOnboardingStatus() to start debugging');
