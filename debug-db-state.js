// Enhanced debug script to check database state and test onboarding completion
// Run this in browser console

console.log('🔧 Database State Debug Script');
console.log('==============================');

async function checkCurrentState() {
  console.log('📋 Step 1: Current localStorage state...');
  
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  console.log('📱 localStorage:');
  console.log('  - User ID:', localUser.id);
  console.log('  - Role:', localUser.role);
  console.log('  - Onboarding Status:', localUser.completedOnboarding);
  console.log('  - Has Token:', !!token);
  console.log('');
  
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return;
  }
  
  console.log('📋 Step 2: Database state from API...');
  
  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database Profile:');
      console.log('  - User ID:', data.user.id);
      console.log('  - Role:', data.user.role);
      console.log('  - Onboarding Status:', data.user.completedOnboarding);
      console.log('  - Customer Data:', data.user.customer);
      console.log('  - Barber Data:', data.user.barber);
      console.log('  - Full Profile:', data.user);
      console.log('');
      
      // Check if onboarding is actually incomplete
      if (data.user.completedOnboarding === false || data.user.completedOnboarding === undefined) {
        console.log('🚫 Database shows onboarding incomplete!');
        console.log('📋 Step 3: Test onboarding completion...');
        await testOnboardingAPI(data.user.role);
      } else {
        console.log('✅ Database shows onboarding completed!');
        console.log('🤔 If ProtectedRoute is still redirecting, try a hard refresh.');
      }
      
    } else {
      console.log('❌ API Profile Failed:', response.status);
      const errorText = await response.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }
}

async function testOnboardingAPI(userType = 'customer') {
  console.log(`🎯 Testing onboarding completion for ${userType}...`);
  
  const token = localStorage.getItem('token');
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const testData = {
    userType,
    fullName: localUser.fullName || 'Test User',
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
    bio: userType === 'barber' ? 'Professional barber' : '',
    shopName: userType === 'barber' ? 'Test Shop' : '',
    shopAddress: userType === 'barber' ? '123 Test Street' : '',
    shopPhone: userType === 'barber' ? '+234 803 123 4567' : '',
    isNewShop: userType === 'barber' ? true : undefined
  };
  
  console.log('📤 Sending request to: /api/auth/onboarding/complete');
  console.log('📦 Request data:', testData);
  console.log('');
  
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
    console.log('');
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Onboarding API Success!');
      console.log('📦 Response data:', result);
      console.log('');
      console.log('🔍 Checking if database was actually updated...');
      
      // Wait a moment then check database again
      setTimeout(async () => {
        await verifyDatabaseUpdate();
      }, 1000);
      
    } else {
      const errorText = await response.text();
      console.log('❌ Onboarding API Failed');
      console.log('   Status:', response.status);
      console.log('   Response:', errorText);
      console.log('');
      
      // Try to parse error as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.log('   Parsed Error:', errorJson);
      } catch (e) {
        console.log('   Raw Error Text:', errorText);
      }
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

async function verifyDatabaseUpdate() {
  console.log('🔍 Verifying database was updated...');
  
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
      console.log('  - Customer completedOnboarding:', data.user.customer?.completedOnboarding);
      console.log('  - Barber completedOnboarding:', data.user.barber?.completedOnboarding);
      console.log('');
      
      if (data.user.completedOnboarding === true) {
        console.log('🎉 SUCCESS: Database shows onboarding completed!');
        console.log('✅ ProtectedRoute should now allow access');
        console.log('🔄 Try navigating to /home or refresh the page');
        
        // Update localStorage to match
        const updatedUser = {
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          ...data.user
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('💾 localStorage synced with database');
        
      } else {
        console.log('❌ ISSUE: Database still shows onboarding incomplete');
        console.log('🔧 This suggests the update logic has an issue');
        console.log('');
        console.log('🚨 Possible causes:');
        console.log('1. Database update transaction failed');
        console.log('2. User ID mismatch in the update query');
        console.log('3. Database connection issue');
        console.log('4. Prisma schema mismatch');
        
        // Show decoded token info for debugging
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('🔍 Token payload:', payload);
            console.log('   - Token User ID:', payload.id);
            console.log('   - Token Role:', payload.role);
            console.log('   - Profile User ID:', data.user.id);
            console.log('   - ID Match:', payload.id === data.user.id ? '✅' : '❌');
          } catch (e) {
            console.log('❌ Could not decode token');
          }
        }
      }
    } else {
      console.log('❌ Could not verify database state');
    }
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
  }
}

async function forceCompleteOnboarding() {
  console.log('💪 Force completing onboarding in database...');
  
  await testOnboardingAPI('customer'); // Try customer first
}

// Make functions available globally
window.checkCurrentState = checkCurrentState;
window.testOnboardingAPI = testOnboardingAPI;
window.verifyDatabaseUpdate = verifyDatabaseUpdate;
window.forceCompleteOnboarding = forceCompleteOnboarding;

console.log('📚 Available Commands:');
console.log('  - checkCurrentState() - Check current localStorage vs database');
console.log('  - testOnboardingAPI(userType) - Test onboarding completion API');
console.log('  - verifyDatabaseUpdate() - Check if database was updated');
console.log('  - forceCompleteOnboarding() - Force complete onboarding');
console.log('');
console.log('🚀 Run checkCurrentState() to start debugging');
