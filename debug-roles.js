// Debug script to check and fix role consistency
// Run this in browser console (F12)

console.log('🔍 Role Debugging Script');

// Check current user data
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
console.log('Current user:', currentUser);
console.log('Current role:', currentUser.role);
console.log('Completed onboarding:', currentUser.completedOnboarding);

// Check token
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

// Helper function to fix role to lowercase
function fixRoleToLowercase() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role) {
        user.role = user.role.toLowerCase();
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ Role fixed to lowercase:', user.role);
        console.log('Updated user:', user);
        return user;
    } else {
        console.log('❌ No role found in user data');
        return null;
    }
}

// Helper function to complete onboarding for testing
function completeOnboardingAs(userType) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.role = userType.toLowerCase();
    user.completedOnboarding = true;
    localStorage.setItem('user', JSON.stringify(user));
    console.log(`✅ Onboarding completed as ${userType}:`, user);
    
    // Auto-redirect to correct dashboard
    const dashboardPath = userType.toLowerCase() === 'barber' ? '/barber/dashboard' : '/home';
    console.log(`🚀 Redirecting to: ${dashboardPath}`);
    window.location.href = dashboardPath;
    
    return user;
}

// Export functions to global scope for easy use
window.fixRoleToLowercase = fixRoleToLowercase;
window.completeOnboardingAs = completeOnboardingAs;

console.log('Available functions:');
console.log('- fixRoleToLowercase() - Converts role to lowercase');
console.log('- completeOnboardingAs("customer") - Complete as customer');
console.log('- completeOnboardingAs("barber") - Complete as barber');

// Auto-fix if role is uppercase
if (currentUser.role && currentUser.role === currentUser.role.toUpperCase()) {
    console.log('🔧 Auto-fixing uppercase role...');
    fixRoleToLowercase();
}
