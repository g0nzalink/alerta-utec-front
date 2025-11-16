import type { Notification } from '../types';
import { AppError } from '../utils/helpers';
import axios, { type AxiosInstance } from 'axios';
import { TOKEN_KEY } from '../config';

// Interfaces para el backend de notificaciones AWS Lambda
interface BackendNotification {
  notificationId: string;
  userId: string;
  incidentId?: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// URL base para la API de notificaciones AWS Lambda
const NOTIFICATIONS_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://nal0woodc6.execute-api.us-east-1.amazonaws.com/dev';

// Cliente HTTP para notificaciones con autenticación
const notificationsHttpClient: AxiosInstance = axios.create({
  baseURL: NOTIFICATIONS_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
notificationsHttpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔔 Notifications API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('❌ Notifications Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
notificationsHttpClient.interceptors.response.use(
  (response) => {
    console.log('✅ Notifications API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ Notifications Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class NotificationsAPI {
  // Flag para usar datos mock temporalmente mientras se soluciona el backend
  private useMockData = false; // ✅ Cambiado a false para usar backend real

  // Almacenamiento local de notificaciones mock
  private mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'COMMENT_ADDED',
      incidentId: '1',
      message: 'Nuevo comentario en "Problema con el proyector"',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-2',
      type: 'INCIDENT_UPDATED',
      incidentId: '2',
      message: 'Incidente "Aire acondicionado no funciona" actualizado a EN_PROGRESO',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-3',
      type: 'INCIDENT_CREATED',
      incidentId: '3',
      message: 'Nuevo incidente asignado: "WiFi intermitente"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ];

  /**
   * Convierte una notificación del backend al formato del frontend
   */
  private convertBackendToFrontend(backend: BackendNotification): Notification {
    // Normalizar timestamp UTC
    let timestamp = backend.createdAt;
    if (!timestamp.endsWith('Z') && !timestamp.includes('+')) {
      timestamp = timestamp + 'Z';
    }

    // Mapear tipo de notificación
    let type: Notification['type'] = 'INCIDENT_CREATED';
    if (backend.type === 'incident_updated' || backend.type === 'INCIDENT_UPDATED') {
      type = 'INCIDENT_UPDATED';
    } else if (backend.type === 'comment_added' || backend.type === 'COMMENT_ADDED') {
      type = 'COMMENT_ADDED';
    } else if (backend.type === 'incident_created' || backend.type === 'INCIDENT_CREATED') {
      type = 'INCIDENT_CREATED';
    }

    return {
      id: backend.notificationId,
      type: type,
      incidentId: backend.incidentId || '',
      message: backend.message,
      timestamp: timestamp,
      read: backend.read,
    };
  }

  /**
   * Obtiene todas las notificaciones del usuario actual
   * GET /notifications
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      console.log('🔔 Fetching notifications for current user');

      // WORKAROUND: Usar datos mock localmente mientras se soluciona el backend
      if (this.useMockData) {
        console.warn('⚠️ Using local mock notifications (backend token issue)');
        console.warn('📋 Backend needs same JWT secret key as auth Lambda');
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Retornar copia de las notificaciones mock
        return [...this.mockNotifications].sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }

      const response = await notificationsHttpClient.get<BackendNotification[]>('/notifications');

      console.log('✅ Notifications retrieved:', response.data.length, 'notifications');

      // Convertir al formato frontend
      const notifications = (response.data || []).map(notification =>
        this.convertBackendToFrontend(notification)
      );

      // Ordenar por fecha (más recientes primero)
      notifications.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return notifications;
    } catch (error: any) {
      console.error('❌ Get notifications error:', error);

      // Si es 401 (Unauthorized), usar datos mock
      if (error.response?.status === 401) {
        console.warn('⚠️ Backend token rejected (401), using local mock data');
        return [...this.mockNotifications];
      }

      // Si es 404, probablemente no hay notificaciones
      if (error.response?.status === 404) {
        console.log('ℹ️ No notifications found for user');
        return [];
      }

      throw new AppError(
        error.response?.data?.error || error.response?.data?.message || error.message || 'Error al obtener notificaciones',
        error.response?.status || 500
      );
    }
  }

  /**
   * Marca una notificación como leída
   * PUT /notifications/{id}/mark-read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      console.log('✓ Marking notification as read:', notificationId);

      // WORKAROUND: Actualizar localmente mientras se soluciona el backend
      if (this.useMockData) {
        console.warn('⚠️ Marking notification as read locally (mock mode)');
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Buscar y actualizar la notificación en el array mock
        const notification = this.mockNotifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
          return { ...notification };
        }
        
        throw new AppError('Notificación no encontrada', 404);
      }

      const response = await notificationsHttpClient.put<BackendNotification>(
        `/notifications/${notificationId}/mark-read`
      );

      console.log('✅ Notification marked as read:', response.data);

      return this.convertBackendToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ Mark as read error:', error);

      throw new AppError(
        error.response?.data?.error || error.response?.data?.message || error.message || 'Error al marcar notificación como leída',
        error.response?.status || 500
      );
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<void> {
    try {
      // WORKAROUND: Actualizar localmente mientras se soluciona el backend
      if (this.useMockData) {
        console.warn('⚠️ Marking all notifications as read locally (mock mode)');
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Marcar todas como leídas
        this.mockNotifications.forEach(notification => {
          notification.read = true;
        });
        
        return;
      }

      const notifications = await this.getNotifications();
      const unreadNotifications = notifications.filter(n => !n.read);

      await Promise.all(
        unreadNotifications.map(notification =>
          this.markAsRead(notification.id)
        )
      );

      console.log('✅ All notifications marked as read');
    } catch (error: any) {
      console.error('❌ Mark all as read error:', error);
      throw new AppError(
        'Error al marcar todas las notificaciones como leídas',
        500
      );
    }
  }

  /**
   * Obtiene el número de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter((n: Notification) => !n.read).length;
    } catch (error) {
      console.error('❌ Get unread count error:', error);
      return 0;
    }
  }
}

export const notificationsAPI = new NotificationsAPI();
