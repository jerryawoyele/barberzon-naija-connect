import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Define the base API URL - using the proxy configured in vite.config.ts
const API_URL = '/api';

/**
 * Base API client for making HTTP requests to the backend
 */
export class ApiClient {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle specific error cases
        if (error.response) {
          // Server responded with a status code outside of 2xx range
          if (error.response.status === 401) {
            // Unauthorized - clear token and redirect to login
            this.clearToken();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Initialize token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set the authentication token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear the authentication token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

export default apiClient;
