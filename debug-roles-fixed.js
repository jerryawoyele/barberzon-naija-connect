// Debug script for testing role consistency after fixes
// Run this in browser console to test role-related functionality

console.log('🔧 Barberzon Role Debug Script (Post-Fix Version)');
console.log('================================================');

// Helper functions
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function displayUserInfo() {
  const user = getCurrentUser();
  console.log('👤 Current User Info:');
  console.log('  - Role:', user?.role);
  console.log('  - Onboarding Status:', user?.completedOnboarding);
  console.log('  - Full Name:', user?.fullName);
  console.log('  - Phone:', user?.phoneNumber);
  console.log('  - Full User Object:', user);
}

function testRoleConsistency() {
  const user = getCurrentUser();
  if (!user) {
    console.log('❌ No user found in localStorage');
    return;
  }
  
  console.log('🧪 Testing Role Consistency:');
  
  // Check if role is lowercase
  const isLowercase = user.role === user.role.toLowerCase();
  console.log('  - Role is lowercase:', isLowercase ? '✅' : '❌');
  
  // Check expected role values
  const validRoles = ['customer', 'barber'];
  const isValidRole = validRoles.includes(user.role);
  console.log('  - Role is valid:', isValidRole ? '✅' : '❌');
  
  if (!isValidRole) {
    console.log('  - Expected: "customer" or "barber"');
    console.log('  - Actual:', user.role);
  }
  
  return { isLowercase, isValidRole };
}

function fixRoleIfNeeded() {
  const user = getCurrentUser();
  if (!user) {
    console.log('❌ No user found');
    return;
  }
  
  let wasFixed = false;
  
  // Fix role casing
  if (user.role === 'CUSTOMER') {
    user.role = 'customer';
    wasFixed = true;
  } else if (user.role === 'BARBER') {
    user.role = 'barber';
    wasFixed = true;
  }
  
  if (wasFixed) {
    localStorage.setItem('user', JSON.stringify(user));
    console.log('✅ Role fixed and saved to localStorage');
    console.log('🔄 Please refresh the page for changes to take effect');
  } else {
    console.log('✅ Role is already correct');
  }
  
  return wasFixed;
}

function simulateOnboardingComplete(userType = 'customer') {
  const user = getCurrentUser();
  if (!user) {
    console.log('❌ No user found');
    return;
  }
  
  console.log(`🎯 Simulating onboarding completion for ${userType}...`);
  
  const updatedUser = {
    ...user,
    role: userType.toLowerCase(), // Ensure lowercase
    completedOnboarding: true,
    fullName: user.fullName || `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
    phoneNumber: user.phoneNumber || '+234 803 123 4567',
    onboardingData: {
      fullName: user.fullName || `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
      phoneNumber: user.phoneNumber || '+234 803 123 4567',
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
    }
  };
  
  localStorage.setItem('user', JSON.stringify(updatedUser));
  console.log('✅ Onboarding marked as complete');
  console.log('📱 User data updated with test information');
  
  // Auto-redirect to appropriate page
  const targetPath = userType === 'barber' ? '/barber/dashboard' : '/home';
  console.log(`🚀 Redirecting to ${targetPath}...`);
  
  setTimeout(() => {
    window.location.href = targetPath;
  }, 1000);
}

function clearOnboarding() {
  const user = getCurrentUser();
  if (!user) {
    console.log('❌ No user found');
    return;
  }
  
  user.completedOnboarding = false;
  delete user.onboardingData;
  
  localStorage.setItem('user', JSON.stringify(user));
  console.log('✅ Onboarding status cleared');
  console.log('🔄 You can now test the onboarding flow again');
}

function runFullDiagnostic() {
  console.log('🔍 Running Full Diagnostic...');
  console.log('============================');
  
  displayUserInfo();
  console.log('');
  
  const { isLowercase, isValidRole } = testRoleConsistency();
  console.log('');
  
  if (!isLowercase || !isValidRole) {
    console.log('⚠️ Issues detected! Run fixRoleIfNeeded() to fix them.');
  } else {
    console.log('✅ All role checks passed!');
  }
  
  console.log('');
  console.log('📚 Available Commands:');
  console.log('  - displayUserInfo() - Show current user details');
  console.log('  - testRoleConsistency() - Test role format');
  console.log('  - fixRoleIfNeeded() - Fix role casing issues');
  console.log('  - simulateOnboardingComplete("customer"|"barber") - Complete onboarding');
  console.log('  - clearOnboarding() - Reset onboarding status');
  console.log('  - runFullDiagnostic() - Run this diagnostic again');
}

// Make functions available globally
window.displayUserInfo = displayUserInfo;
window.testRoleConsistency = testRoleConsistency;
window.fixRoleIfNeeded = fixRoleIfNeeded;
window.simulateOnboardingComplete = simulateOnboardingComplete;
window.clearOnboarding = clearOnboarding;
window.runFullDiagnostic = runFullDiagnostic;

// Run initial diagnostic
runFullDiagnostic();
