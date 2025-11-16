import type { ApiError } from '../types';

export class AppError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'AppError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code
    };
  }

  if (error.response?.data) {
    return {
      message: error.response.data.message || 'Error en el servidor',
      status: error.response.status,
      code: error.response.data.code
    };
  }

  if (error.request) {
    return {
      message: 'Error de conexión. Verifica tu conexión a internet.',
      status: 0
    };
  }

  return {
    message: error.message || 'Error desconocido',
    status: 500
  };
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: number | undefined;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
