// Database-First Onboarding Test Script
// Run this in browser console to test the complete database-first onboarding flow

console.log('🔧 Database-First Onboarding Test Script');
console.log('=========================================');

// Test the complete onboarding flow
async function testCompleteOnboardingFlow() {
  console.log('🚀 Testing Complete Onboarding Flow...');
  console.log('');
  
  // Step 1: Check current user state
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('👤 Current User State:');
  console.log('  - Role:', currentUser.role);
  console.log('  - Onboarding Status:', currentUser.completedOnboarding);
  console.log('  - User ID:', currentUser.id);
  console.log('');
  
  // Step 2: Test API profile fetch
  console.log('🔍 Testing API Profile Fetch...');
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return;
  }
  
  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database Profile Retrieved:');
      console.log('  - Role:', data.user.role);
      console.log('  - Onboarding Status:', data.user.completedOnboarding);
      console.log('  - User ID:', data.user.id);
      console.log('  - Full Profile:', data.user);
      console.log('');
      
      // Step 3: Test onboarding completion if not completed
      if (!data.user.completedOnboarding) {
        console.log('⚠️ Onboarding not completed. Testing onboarding completion...');
        await testOnboardingCompletion(data.user.role || 'customer');
      } else {
        console.log('✅ Onboarding already completed in database!');
        console.log('🎯 User should have full access to the application.');
      }
      
    } else {
      console.log('❌ API Profile Fetch Failed:', response.status);
      console.log('   Backend may not be running. Testing with localStorage fallback...');
      
      if (currentUser.completedOnboarding) {
        console.log('✅ localStorage shows onboarding completed');
      } else {
        console.log('⚠️ localStorage shows onboarding incomplete');
      }
    }
    
  } catch (error) {
    console.log('❌ API Error:', error.message);
    console.log('   Backend not available. Using localStorage fallback.');
  }
}

// Test onboarding completion API
async function testOnboardingCompletion(userType = 'customer') {
  console.log(`🎯 Testing Onboarding Completion for ${userType}...`);
  
  const token = localStorage.getItem('token');
  const testData = {
    userType,
    fullName: `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
    phoneNumber: '+234 803 123 4567',
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
  
  try {
    const response = await fetch('/api/auth/onboarding/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Onboarding Completion Successful!');
      console.log('  - Message:', result.message);
      console.log('  - Updated Role:', result.user.role);
      console.log('  - Onboarding Status:', result.user.completedOnboarding);
      console.log('');
      
      // Update localStorage with the latest data
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        ...result.user,
        role: result.user.role.toLowerCase()
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('💾 localStorage updated with database response');
      console.log('');
      
      // Test access after completion
      await testPostOnboardingAccess();
      
    } else {
      console.log('❌ Onboarding Completion Failed:', response.status);
      const errorText = await response.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Onboarding Completion Error:', error.message);
  }
}

// Test access after onboarding completion
async function testPostOnboardingAccess() {
  console.log('🎯 Testing Post-Onboarding Access...');
  
  // Re-fetch profile to confirm database state
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Post-Onboarding Profile Check:');
      console.log('  - Onboarding Status:', data.user.completedOnboarding);
      console.log('  - Role:', data.user.role);
      
      if (data.user.completedOnboarding === true) {
        console.log('🎉 SUCCESS: Database confirms onboarding is completed!');
        console.log('🚀 User should now have full access to the application.');
        
        // Suggest next steps
        const dashboardPath = data.user.role === 'barber' ? '/barber/dashboard' : '/home';
        console.log(`📍 Recommended action: Navigate to ${dashboardPath}`);
        
        return true;
      } else {
        console.log('❌ FAILURE: Database still shows onboarding incomplete');
        return false;
      }
    } else {
      console.log('⚠️ Could not verify database state - API unavailable');
      return null;
    }
    
  } catch (error) {
    console.log('⚠️ Could not verify database state:', error.message);
    return null;
  }
}

// Clear onboarding for testing
async function clearOnboardingForTesting() {
  console.log('🧹 Clearing Onboarding Status for Testing...');
  
  // Clear localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.completedOnboarding = false;
  delete user.onboardingData;
  localStorage.setItem('user', JSON.stringify(user));
  
  console.log('✅ localStorage onboarding status cleared');
  console.log('🔄 Now you can test the complete onboarding flow');
  console.log('   Run: testCompleteOnboardingFlow()');
}

// Diagnostic function
function runDiagnostic() {
  console.log('🔍 Running Diagnostic...');
  console.log('=======================');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  console.log('📱 localStorage State:');
  console.log('  - Has Token:', !!token);
  console.log('  - User Role:', user.role);
  console.log('  - Onboarding Status:', user.completedOnboarding);
  console.log('  - User ID:', user.id);
  console.log('');
  
  console.log('🌐 Available API Endpoints:');
  console.log('  - /api/auth/profile (GET) - Check current user state');
  console.log('  - /api/auth/onboarding/complete (POST) - Complete onboarding');
  console.log('');
  
  console.log('📚 Available Test Functions:');
  console.log('  - testCompleteOnboardingFlow() - Full end-to-end test');
  console.log('  - testOnboardingCompletion(userType) - Test completion API');
  console.log('  - testPostOnboardingAccess() - Test access after completion');
  console.log('  - clearOnboardingForTesting() - Reset for testing');
  console.log('  - runDiagnostic() - Run this diagnostic again');
}

// Make functions available globally
window.testCompleteOnboardingFlow = testCompleteOnboardingFlow;
window.testOnboardingCompletion = testOnboardingCompletion;
window.testPostOnboardingAccess = testPostOnboardingAccess;
window.clearOnboardingForTesting = clearOnboardingForTesting;
window.runDiagnostic = runDiagnostic;

// Run initial diagnostic
runDiagnostic();
