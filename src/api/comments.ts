import type { Comment } from '../types';
import { AppError } from '../utils/helpers';
import axios, { type AxiosInstance } from 'axios';
import { TOKEN_KEY, USER_KEY } from '../config';

// Interfaces para el backend de comentarios AWS Lambda
interface CreateCommentRequest {
  content: string;      // Backend espera "content", no "text"
  authorId: string;
}

interface BackendComment {
  incidentId: string;
  commentId: string;
  authorId: string;
  content: string;      // Backend retorna "content"
  createdAt: string;
  updatedAt: string;
}

// URL base para la API de comentarios AWS Lambda
const COMMENTS_BASE_URL = 'https://m8iy12chv2.execute-api.us-east-1.amazonaws.com/dev';

// Cliente HTTP específico para comentarios con autenticación
const commentsHttpClient: AxiosInstance = axios.create({
  baseURL: COMMENTS_BASE_URL,
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
  /**
   * Convierte un comentario del backend al formato del frontend
   */
  private convertBackendToFrontend(backend: BackendComment): Comment {
    // Asegurar que la fecha tenga 'Z' al final si no la tiene (UTC)
    let createdAt = backend.createdAt;
    if (!createdAt.endsWith('Z') && !createdAt.includes('+')) {
      createdAt = createdAt + 'Z';
    }
    
    return {
      id: backend.commentId,
      incidentId: backend.incidentId,
      content: backend.content,        // Backend usa "content"
      createdAt: createdAt,            // Fecha normalizada
      createdBy: backend.authorId,
      createdByName: backend.authorId, // Backend no retorna nombre, usar authorId
    };
  }

  /**
   * Obtiene todos los comentarios de un incidente
   * GET /incidents/{id}/comments
   */
  async getComments(incidentId: string): Promise<Comment[]> {
    try {
      console.log('📋 Fetching comments for incident:', incidentId);
      
      const response = await commentsHttpClient.get<BackendComment[]>(
        `/incidents/${incidentId}/comments`
      );
      
      console.log('✅ Comments retrieved:', response.data.length, 'comments');
      
      // Convertir al formato frontend
      const comments = (response.data || []).map(comment => 
        this.convertBackendToFrontend(comment)
      );
      
      // Ordenar por fecha de creación (más antiguos primero)
      comments.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      return comments;
    } catch (error: any) {
      console.error('❌ Get comments error:', error);
      
      // Si es 404, probablemente no hay comentarios
      if (error.response?.status === 404) {
        console.log('ℹ️ No comments found for incident:', incidentId);
        return [];
      }
      
      throw new AppError(
        error.response?.data?.error || error.response?.data?.message || error.message || 'Error al obtener comentarios',
        error.response?.status || 500
      );
    }
  }

  /**
   * Crea un nuevo comentario para un incidente
   * POST /incidents/{id}/comments
   */
  async createComment(
    incidentId: string, 
    content: string, 
    user?: { id: string; name: string }
  ): Promise<Comment> {
    try {
      // Validar contenido del comentario
      this.validateComment(content);
      
      // Obtener información del usuario (authorId)
      let authorId = 'anonymous';
      
      if (user) {
        authorId = user.id;
      } else {
        // Intentar obtener del localStorage
        try {
          const userDataString = localStorage.getItem(USER_KEY);
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            authorId = userData.userId || userData.email || 'anonymous';
          }
        } catch (e) {
          console.warn('Could not get user data from localStorage');
        }
      }

      const requestData: CreateCommentRequest = {
        content: content.trim(),    // Backend espera "content"
        authorId: authorId,
      };

      console.log('💬 Creating comment for incident:', incidentId);
      console.log('📤 Comment data:', requestData);
      
      const response = await commentsHttpClient.post<BackendComment>(
        `/incidents/${incidentId}/comments`,
        requestData
      );
      
      console.log('✅ Comment created successfully:', response.data);
      
      return this.convertBackendToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ Create comment error:', error);
      
      // Extraer mensaje de error del backend
      let errorMessage = 'Error al crear el comentario';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new AppError(
        errorMessage,
        error.response?.status || 500
      );
    }
  }

  /**
   * Elimina un comentario
   * Nota: Este endpoint no está documentado en la API actual
   */
  async deleteComment(incidentId: string, commentId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting comment:', commentId, 'from incident:', incidentId);
      
      await commentsHttpClient.delete(
        `/incidents/${incidentId}/comments/${commentId}`
      );
      
      console.log('✅ Comment deleted:', commentId);
    } catch (error: any) {
      console.error('❌ Delete comment error:', error);
      
      let errorMessage = 'Error al eliminar el comentario';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new AppError(
        errorMessage,
        error.response?.status || 500
      );
    }
  }

  /**
   * Valida el contenido de un comentario
   */
  private validateComment(content: string): void {
    if (!content || content.trim().length < 1) {
      throw new AppError('El comentario no puede estar vacío', 400);
    }
    
    if (content.trim().length > 2000) {
      throw new AppError('El comentario no puede exceder 2000 caracteres', 400);
    }
  }
}

export const commentsAPI = new CommentsAPI();
