// Debug script to check barber profile API response
// Run this in browser console to see what data is being returned

console.log('🔍 Debugging Barber Profile API Response');
console.log('==========================================');

async function debugBarberProfile() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return;
  }
  
  console.log('📡 Fetching barber profile...');
  
  try {
    // Fetch barber profile from backend
    const response = await fetch('http://localhost:3001/api/barbers/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response Success!');
      console.log('📦 Full Response:', data);
      console.log('');
      
      if (data.status === 'success' && data.data) {
        const barber = data.data;
        console.log('👤 Barber Info:');
        console.log('  - ID:', barber.id);
        console.log('  - Name:', barber.fullName);
        console.log('  - Shop ID:', barber.shopId);
        console.log('  - Shop Data:', barber.shop);
        console.log('');
        
        if (barber.shop) {
          console.log('🏪 Shop Details:');
          console.log('  - Shop Name:', barber.shop.name);
          console.log('  - Shop Address:', barber.shop.address);
          console.log('  - Shop Owner ID:', barber.shop.ownerId);
          console.log('  - Shop Phone:', barber.shop.phoneNumber);
          console.log('  - Is Owner:', barber.id === barber.shop.ownerId ? '✅ Yes' : '❌ No');
          console.log('');
        } else {
          console.log('⚠️ No shop data found!');
          console.log('');
          
          if (barber.shopId) {
            console.log('❌ Barber has shopId but no shop data - possible database issue');
          } else {
            console.log('❌ Barber has no shopId - not associated with any shop');
          }
          console.log('');
          
          console.log('🔧 Possible Solutions:');
          console.log('1. Re-run onboarding to create/associate with a shop');
          console.log('2. Use the test shop creation endpoint');
          console.log('3. Check if shop exists in database');
        }
        
        // Check current localStorage
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('📱 localStorage User:');
        console.log('  - Role:', localUser.role);
        console.log('  - Onboarding Status:', localUser.completedOnboarding);
        console.log('');
        
      } else {
        console.log('❌ Unexpected response structure:', data);
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ API Request Failed');
      console.log('   Status:', response.status);
      console.log('   Error:', errorText);
      
      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.log('   Parsed Error:', errorJson);
      } catch (e) {
        console.log('   Raw Error:', errorText);
      }
    }
    
  } catch (error) {
    console.log('❌ Network/Request Error:', error.message);
    console.log('🔧 Make sure:');
    console.log('1. Backend server is running on port 3001');
    console.log('2. You are logged in with a valid token');
    console.log('3. Your user role is "barber"');
  }
}

// Also check the database state via test endpoint
async function checkDatabaseState() {
  const token = localStorage.getItem('token');
  
  console.log('🗄️ Checking Database State...');
  
  try {
    // Try the auth profile endpoint to see user state
    const authResponse = await fetch('http://localhost:3001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('📋 Auth Profile Data:');
      console.log('  - User ID:', authData.user?.id);
      console.log('  - Role:', authData.user?.role);
      console.log('  - Onboarding:', authData.user?.completedOnboarding);
      console.log('  - Barber Data:', authData.user?.barber);
      console.log('');
    } else {
      console.log('⚠️ Auth profile endpoint not available');
    }
    
  } catch (error) {
    console.log('⚠️ Could not check auth profile:', error.message);
  }
}

// Make functions available globally
window.debugBarberProfile = debugBarberProfile;
window.checkDatabaseState = checkDatabaseState;

console.log('📚 Available Functions:');
console.log('  - debugBarberProfile() - Check barber profile API');
console.log('  - checkDatabaseState() - Check auth profile API');
console.log('');
console.log('🚀 Run debugBarberProfile() to start debugging');
