import apiClient from './api';

export interface LoginCredentials {
  phoneNumber: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role?: 'customer' | 'barber';
}

export interface UserVerificationData {
  fullName?: string;
  password?: string;
  phoneNumber?: string;
  hourlyRate?: number;
  specialties?: string[];
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      fullName: string;
      email: string;
      role: 'customer' | 'barber';
      phoneNumber: string;
      profileImage?: string;
    };
    token: string;
  };
}

export interface GoogleAuthResponse {
  status: string;
  message: string;
  data?: {
    user: {
      id: string;
      fullName: string;
      email: string;
      role: 'customer' | 'barber';
      phoneNumber?: string;
      profileImage?: string;
    };
    token: string;
    isNewUser: boolean;
  };
}

/**
 * Service for handling authentication-related API calls
 */
class AuthService {
  /**
   * Universal login method for all user types
   */
  async login(credentials: LoginCredentials) {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.status === 'success') {
        // Store the token
        apiClient.setToken(response.data.data.token);
        
        // Store user data with role from response
        const userData = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.data.token);
        
        console.log('User data stored:', userData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Universal register method for all user types
   * User will be directed to onboarding after registration to specify role and details
   */
  async register(data: RegisterData) {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      if (response.data.status === 'success') {
        // Store the token
        apiClient.setToken(response.data.data.token);
        
        // Store user data (role might be null initially, will be set during onboarding)
        const userData = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.data.token);
        
        console.log('User data stored after registration:', userData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  logout() {
    // Clear token and user data
    apiClient.clearToken();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Redirect to login page
    window.location.href = '/login';
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return apiClient.isAuthenticated() && !!this.getCurrentUser();
  }

  /**
   * Check if current user is a barber
   */
  isBarber() {
    const user = this.getCurrentUser();
    return user?.role === 'barber';
  }

  /**
   * Check if current user is a customer
   */
  isCustomer() {
    const user = this.getCurrentUser();
    return user?.role === 'customer';
  }
  
  /**
   * Authenticate with Google
   */
  async googleAuth(accessToken: string, userType: 'customer' | 'barber'): Promise<GoogleAuthResponse> {
    try {
      const response = await apiClient.post<GoogleAuthResponse>(
        `/auth/google`,
        { token: accessToken, role: userType }
      );
      
      if (response.data.status === 'success' && response.data.data) {
        // Store the token
        apiClient.setToken(response.data.data.token);
        
        // Make sure the role is set correctly based on userType
        const userData = {
          ...response.data.data.user,
          role: userType
        };
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set token in localStorage for App.tsx to pick up on refresh
        localStorage.setItem('token', response.data.data.token);
        
        console.log(`Google auth data stored (${userType}):`, userData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  }
  
  /**
   * Request email verification
   */
  async requestEmailVerification(email: string): Promise<{ status: string; message: string }> {
    try {
      const response = await apiClient.post<{ status: string; message: string }>(
        '/auth/verify/request',
        { email }
      );
      return response.data;
    } catch (error) {
      console.error('Email verification request error:', error);
      throw error;
    }
  }
  
  /**
   * Verify email with token
   */
  async verifyEmail(token: string, userData?: UserVerificationData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/verify/confirm',
        { token, userData }
      );
      
      if (response.data.status === 'success') {
        // Store the token
        apiClient.setToken(response.data.data.token);
        
        // Get the role from the token payload
        const tokenParts = response.data.data.token.split('.');
        let role = 'customer'; // Default to customer
        
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            role = payload.role || 'customer';
          } catch (e) {
            console.error('Error parsing token payload:', e);
          }
        }
        
        // Make sure the role is set correctly
        const userData = {
          ...response.data.data.user,
          role
        };
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set token in localStorage for App.tsx to pick up on refresh
        localStorage.setItem('token', response.data.data.token);
        
        console.log('User data stored after verification:', userData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
