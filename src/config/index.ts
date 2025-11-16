
// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://m8iy12chv2.execute-api.us-east-1.amazonaws.com/dev';
export const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'wss://rgs5nn9vgf.execute-api.us-east-1.amazonaws.com/dev';

// App Configuration
export const APP_NAME = 'Alerta UTEC';
export const APP_VERSION = '1.0.0';

// Token Configuration
export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user_data';

// API Timeouts (in milliseconds)
export const API_TIMEOUT = 30000; // 30 seconds
export const UPLOAD_TIMEOUT = 60000; // 60 seconds for file uploads

// Retry Configuration
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

// Environment
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';

// Feature Flags
export const ENABLE_WEBSOCKET = true;
export const ENABLE_NOTIFICATIONS = true;
export const ENABLE_FILE_UPLOAD = true;

// Logging
export const ENABLE_API_LOGGING = isDevelopment;
export const ENABLE_ERROR_LOGGING = true;
