import type { Comment } from '../types';
import { AppError } from '../utils/helpers';
import axios, { type AxiosInstance } from 'axios';
import { TOKEN_KEY } from '../config';

// Interfaces para el backend de comentarios
interface BackendCommentRequest {
  comment: string;
  userId: string;
  userName: string;
}

interface BackendCommentResponse {
  commentId: string;
  parentIncidentId: string; // Cambiado de incidentId
  comment: string;
  userId: string;
  userName: string;
  createdAt: number;
  type: 'comment';
  incidentId: string; // Este es el ID compuesto: parentIncidentId#COMMENT#commentId
}

interface BackendIncidentsResponse {
  incidents: (BackendIncidentItem | BackendCommentResponse)[];
  count: number;
}

interface BackendIncidentItem {
  incidentId: string;
  titulo?: string;
  descripcion?: string;
  urgencia?: string;
  status?: string;
  ubicacion?: string;
  createdAt: number;
  updatedAt?: number;
  reporterId?: string;
  reporterEmail?: string;
}

// URL base para la API de incidentes (los comentarios están bajo incidents)
const INCIDENTS_BASE_URL = 'https://wkcu4ednn9.execute-api.us-east-1.amazonaws.com/prod';

// Cliente HTTP específico para comentarios con autenticación
const commentsHttpClient: AxiosInstance = axios.create({
  baseURL: INCIDENTS_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
commentsHttpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Comments API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('❌ Comments Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
commentsHttpClient.interceptors.response.use(
  (response) => {
    console.log('✅ Comments API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ Comments Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class CommentsAPI {
  private convertBackendToFrontend(backend: BackendCommentResponse): Comment {
    return {
      id: backend.commentId,
      incidentId: backend.parentIncidentId, // Usar parentIncidentId
      content: backend.comment,
      createdAt: new Date(backend.createdAt * 1000).toISOString(),
      createdBy: backend.userId,
      createdByName: backend.userName,
    };
  }

  async getComments(incidentId: string): Promise<Comment[]> {
    try {
      console.log('🔗 Fetching comments for incident:', incidentId);
      
      // Los comentarios están almacenados en la misma tabla de incidentes
      // Obtener todos los elementos y filtrar por comentarios
      const response = await commentsHttpClient.get<BackendIncidentsResponse>('/incidents');
      
      console.log('✅ Raw incidents response for comments:', {
        totalItems: response.data.incidents?.length || 0,
        sampleData: response.data.incidents?.slice(0, 3)
      });
      
      // Filtrar solo comentarios para este incidente específico
      const allItems = response.data.incidents || [];
      const commentsForIncident = allItems.filter((item: any) => 
        item.type === 'comment' && 
        item.parentIncidentId === incidentId
      ) as BackendCommentResponse[];
      
      console.log(`📋 Found ${commentsForIncident.length} comments for incident ${incidentId}`);
      
      // Convertir al formato frontend
      const comments = commentsForIncident.map(comment => this.convertBackendToFrontend(comment));
      
      // Ordenar por fecha de creación (más antiguos primero)
      comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      return comments;
    } catch (error: any) {
      console.error('❌ Get comments error:', error);
      
      throw new AppError(
        error.response?.data?.message || error.message || 'Error al obtener comentarios',
        error.response?.status || 500
      );
    }
  }

  async createComment(incidentId: string, content: string, user?: { id: string; name: string }): Promise<Comment> {
    try {
      // Validar contenido del comentario
      this.validateComment(content);
      
      // Obtener información del usuario
      let userId = 'anon';
      let userName = 'Anónimo';
      
      if (user) {
        userId = user.id;
        userName = user.name;
      } else {
        // Intentar obtener del localStorage
        try {
          const userDataString = localStorage.getItem('user_data');
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            userId = userData.email || userData.userId || 'anon';
            userName = userData.full_name || userData.nombre || 'Usuario';
          }
        } catch (e) {
          console.warn('Could not get user data from localStorage');
        }
      }

      const backendData: BackendCommentRequest = {
        comment: content.trim(),
        userId: userId,
        userName: userName,
      };

      console.log('🔗 Creating comment:', backendData);
      const response = await commentsHttpClient.post<BackendCommentResponse>(`/incidents/${incidentId}/comments`, backendData);
      
      console.log('✅ Comment created:', response.data);
      return this.convertBackendToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ Create comment error:', error);
      
      // Extraer mensaje de error del backend
      let errorMessage = 'Error al crear el comentario';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new AppError(
        errorMessage,
        error.response?.status || 500
      );
    }
  }

  async deleteComment(incidentId: string, commentId: string): Promise<void> {
    try {
      console.log('🔗 Deleting comment:', commentId, 'from incident:', incidentId);
      await commentsHttpClient.delete(`/incidents/${incidentId}/comments/${commentId}`);
      console.log('✅ Comment deleted:', commentId);
    } catch (error: any) {
      console.error('❌ Delete comment error:', error);
      
      // Extraer mensaje de error del backend
      let errorMessage = 'Error al eliminar el comentario';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new AppError(
        errorMessage,
        error.response?.status || 500
      );
    }
  }

  // Método para validar comentarios
  private validateComment(content: string): void {
    if (!content || content.trim().length < 3) {
      throw new AppError('El comentario debe tener al menos 3 caracteres', 400);
    }
    
    if (content.trim().length > 1000) {
      throw new AppError('El comentario no puede exceder 1000 caracteres', 400);
    }
  }
}

export const commentsAPI = new CommentsAPI();
