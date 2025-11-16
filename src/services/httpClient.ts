
import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY, API_TIMEOUT, ENABLE_API_LOGGING } from '../config';

// Create axios instance
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (ENABLE_API_LOGGING) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
httpClient.interceptors.response.use(
  (response: any) => {
    // Log successful response in development
    if (ENABLE_API_LOGGING) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (ENABLE_API_LOGGING) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (refreshToken) {
          // Try to refresh token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data.tokens;
          
          // Save new token
          localStorage.setItem(TOKEN_KEY, access_token);
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          
          return httpClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('user_data');
        
        // Redirect to login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network Error:', error.message);
      
      // Create user-friendly error
      return Promise.reject({
        message: 'Error de conexión. Verifica tu conexión a internet.',
        type: 'network',
        originalError: error,
      });
    }

    // Handle CORS errors
    if (error.message.includes('CORS')) {
      console.error('🚫 CORS Error:', error);
      
      return Promise.reject({
        message: 'Error de CORS. La API no permite peticiones desde este origen.',
        type: 'cors',
        originalError: error,
      });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'La petición tardó demasiado. Intenta nuevamente.',
        type: 'timeout',
        originalError: error,
      });
    }

    // Handle other HTTP errors
    const errorData: any = error.response?.data || {};
    const errorMessage = errorData.message || error.message || 'Error desconocido';
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      type: 'api',
      originalError: error,
    });
  }
);

// Helper function to make GET requests
export const get = <T = any>(url: string, config = {}) => {
  return httpClient.get<T>(url, config);
};

// Helper function to make POST requests
export const post = <T = any>(url: string, data?: any, config = {}) => {
  return httpClient.post<T>(url, data, config);
};

// Helper function to make PUT requests
export const put = <T = any>(url: string, data?: any, config = {}) => {
  return httpClient.put<T>(url, data, config);
};

// Helper function to make PATCH requests
export const patch = <T = any>(url: string, data?: any, config = {}) => {
  return httpClient.patch<T>(url, data, config);
};

// Helper function to make DELETE requests
export const del = <T = any>(url: string, config = {}) => {
  return httpClient.delete<T>(url, config);
};

// Helper function to upload files
export const upload = <T = any>(url: string, file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);

  return httpClient.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: any) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

export default httpClient;
