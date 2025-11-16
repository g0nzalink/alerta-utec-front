import axios, { type AxiosInstance } from 'axios';
import { TOKEN_KEY } from '../config';
import { AppError } from '../utils/helpers';
import type { User } from '../types';

// URL base para la API de usuarios AWS Lambda
const USERS_API_URL = 'https://m8iy12chv2.execute-api.us-east-1.amazonaws.com/dev';

// Cliente HTTP para usuarios con autenticación
const usersHttpClient: AxiosInstance = axios.create({
  baseURL: USERS_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
usersHttpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('👥 Users API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
    });
    return config;
  },
  (error) => {
    console.error('❌ Users Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
usersHttpClient.interceptors.response.use(
  (response) => {
    console.log('✅ Users Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ Users Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Interface para el usuario del backend (DynamoDB)
interface BackendUser {
  userId: string;
  email: string;
  fullName?: string;
  full_name?: string;
  role: string;
  createdAt?: string;
}

class UsersAPI {
  /**
   * Convierte un usuario del backend al formato del frontend
   */
  private convertBackendToFrontend(backendUser: BackendUser): User {
    return {
      id: backendUser.userId,
      email: backendUser.email,
      name: backendUser.fullName || backendUser.full_name || backendUser.email,
      role: this.normalizeRole(backendUser.role),
    };
  }

  /**
   * Normaliza el rol del usuario
   */
  private normalizeRole(role: string): 'student' | 'staff' | 'authority' {
    const roleLower = role.toLowerCase();
    
    if (roleLower === 'staff' || roleLower === 'personal') {
      return 'staff';
    }
    if (roleLower === 'authority' || roleLower === 'autoridad') {
      return 'authority';
    }
    return 'student';
  }

  /**
   * Lista todo el personal administrativo (staff) de la universidad
   * GET /users/admin-status
   * @returns Lista de usuarios con rol staff
   */
  async getAdminStaff(): Promise<User[]> {
    try {
      console.log('📡 Fetching admin staff...');
      
      const response = await usersHttpClient.get('/users/admin-status');
      
      const staffList: BackendUser[] = Array.isArray(response.data) 
        ? response.data 
        : [];

      // Convertir cada usuario al formato del frontend
      const staff = staffList.map(user => this.convertBackendToFrontend(user));

      console.log(`✅ Got ${staff.length} staff members`);
      return staff;
    } catch (error: any) {
      console.error('❌ Get admin staff error:', error);
      
      if (error.response?.status === 401) {
        throw new AppError('No autorizado', 401);
      }
      
      if (error.response?.status === 404) {
        // Si no hay staff, devolver array vacío
        return [];
      }

      throw new AppError(
        error.response?.data?.error || 'Error al obtener personal administrativo',
        error.response?.status || 500
      );
    }
  }

  /**
   * Obtiene la lista de usuarios que pueden ser asignados a un incidente
   * (personal staff y autoridades)
   */
  async getAssignableUsers(): Promise<User[]> {
    try {
      const staff = await this.getAdminStaff();
      
      // Ordenar por nombre
      return staff.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting assignable users:', error);
      return [];
    }
  }

  /**
   * Busca un usuario por su ID en la lista de staff
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const staff = await this.getAdminStaff();
      return staff.find(user => user.id === userId) || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
}

// Exportar instancia singleton
export const usersAPI = new UsersAPI();
