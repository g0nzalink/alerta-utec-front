import type { Incident, CreateIncidentRequest, UpdateIncidentRequest, PaginatedResponse, Priority, Status } from '../types';
import { AppError } from '../utils/helpers';
import axios, { type AxiosInstance } from 'axios';
import { TOKEN_KEY, USER_KEY } from '../config';
import { commentsAPI } from './comments';

// URL de la API de incidentes - AWS Lambda
const INCIDENTS_API_URL = 'https://m8iy12chv2.execute-api.us-east-1.amazonaws.com/dev';

// Interfaces para el backend AWS Lambda
interface BackendIncident {
  PK: string;
  SK: string;
  incidentId: string;
  title: string;
  description: string;
  priority: 'baja' | 'media' | 'alta';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  images?: string[];
  authorId: string;
  assignedTo?: string;
}

interface CreateIncidentBackendRequest {
  title: string;
  description: string;
  priority: 'baja' | 'media' | 'alta';
  authorId: string;
  images?: string[];
}

interface UpdateIncidentBackendRequest {
  title?: string;
  description?: string;
  priority?: 'baja' | 'media' | 'alta';
  status?: 'open' | 'in_progress' | 'resolved';
  images?: string[];
}

// Cliente HTTP específico para incidentes con autenticación
const incidentsHttpClient: AxiosInstance = axios.create({
  baseURL: INCIDENTS_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
incidentsHttpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // DEBUG: Decodificar token para ver su contenido
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          console.log('🔍 Token payload being sent:', payload);
          console.log('🔍 Has userId?', !!payload.userId);
          console.log('🔍 Has sub?', !!payload.sub);
        }
      } catch (e) {
        console.error('Could not decode token for debugging');
      }
    }
    console.log('🚀 Incidents API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('❌ Incidents Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
incidentsHttpClient.interceptors.response.use(
  (response) => {
    console.log('✅ Incidents API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ Incidents Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class IncidentsAPI {
  // Mapeo de prioridades frontend -> backend (español)
  private mapPriorityToBackend(priority: Priority): 'baja' | 'media' | 'alta' {
    const mapping: Record<Priority, 'baja' | 'media' | 'alta'> = {
      'LOW': 'baja',
      'MEDIUM': 'media',
      'HIGH': 'alta'
    };
    return mapping[priority] || 'media';
  }

  // Mapeo de prioridades backend -> frontend
  private mapPriorityToFrontend(priority: string): Priority {
    const mapping: Record<string, Priority> = {
      'baja': 'LOW',
      'low': 'LOW',
      'media': 'MEDIUM',
      'medium': 'MEDIUM',
      'alta': 'HIGH',
      'high': 'HIGH'
    };
    return mapping[priority?.toLowerCase()] || 'MEDIUM';
  }

  // Mapeo de estados backend -> frontend
  private mapStatusToFrontend(status: string): Status {
    const mapping: Record<string, Status> = {
      'open': 'OPEN',
      'in_progress': 'IN_PROGRESS',
      'resolved': 'RESOLVED'
    };
    return mapping[status] || 'OPEN';
  }

  // Mapeo de estados frontend -> backend
  private mapStatusToBackend(status: Status): 'open' | 'in_progress' | 'resolved' {
    const mapping: Record<Status, 'open' | 'in_progress' | 'resolved'> = {
      'OPEN': 'open',
      'IN_PROGRESS': 'in_progress',
      'RESOLVED': 'resolved',
      'CLOSED': 'resolved'
    };
    return mapping[status] || 'open';
  }

  // Convertir respuesta del backend al formato del frontend
  private convertBackendToFrontend(backend: BackendIncident): Incident {
    // Intentar recuperar location y category del localStorage
    let location = 'UTEC';
    let category: import('../types').Category = 'OTROS';
    
    try {
      const metadata = JSON.parse(localStorage.getItem('incident_metadata') || '[]');
      const incidentMeta = metadata.find((m: any) => m.incidentId === backend.incidentId);
      if (incidentMeta) {
        location = incidentMeta.location || 'UTEC';
        category = incidentMeta.category || 'OTROS';
      }
    } catch (error) {
      console.warn('Could not retrieve incident metadata from localStorage');
    }
    
    return {
      id: backend.incidentId,
      title: backend.title,
      description: backend.description,
      location: location,
      priority: this.mapPriorityToFrontend(backend.priority),
      category: category,
      status: this.mapStatusToFrontend(backend.status),
      createdAt: backend.createdAt,
      updatedAt: backend.updatedAt,
      createdBy: backend.authorId || 'Anónimo',
      assignedTo: backend.assignedTo,
      attachments: backend.images?.map(img => ({
        id: img,
        filename: img,
        url: img,
        contentType: 'image/jpeg',
        size: 0,
        uploadedAt: backend.createdAt,
        isImage: true
      })) || []
    };
  }

  async getIncidents(filters?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Incident>> {
    try {
      // El backend devuelve un array directo de incidentes
      const response = await incidentsHttpClient.get<BackendIncident[]>('/incidents');
      
      console.log('📋 Raw API response:', response.data);
      
      // Filtrar solo incidentes (SK === "METADATA")
      let incidents = response.data
        .filter((item: BackendIncident) => item.SK === 'METADATA')
        .map((incident: BackendIncident) => this.convertBackendToFrontend(incident));
      
      // Obtener contador de comentarios para cada incidente
      await Promise.all(
        incidents.map(async (incident) => {
          try {
            const comments = await commentsAPI.getComments(incident.id);
            incident.commentsCount = comments.length;
          } catch (error) {
            console.warn(`Could not get comments count for incident ${incident.id}`);
            incident.commentsCount = 0;
          }
        })
      );
      
      // Aplicar filtros del lado del cliente
      if (filters?.status) {
        incidents = incidents.filter(inc => inc.status === filters.status);
      }
      
      if (filters?.priority) {
        incidents = incidents.filter(inc => inc.priority === filters.priority);
      }
      
      if (filters?.category) {
        incidents = incidents.filter(inc => inc.category === filters.category);
      }
      
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        incidents = incidents.filter(inc => 
          inc.title.toLowerCase().includes(searchLower) ||
          inc.description.toLowerCase().includes(searchLower)
        );
      }

      // Ordenar por fecha de creación (más recientes primero)
      incidents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Paginación del lado del cliente
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = incidents.slice(startIndex, endIndex);
      
      return {
        items: paginatedItems,
        total: incidents.length,
        page,
        pageSize,
        totalPages: Math.ceil(incidents.length / pageSize)
      };
    } catch (error: any) {
      console.error('❌ Error getting incidents:', error);
      throw new AppError(
        error.response?.data?.message || error.message || 'Error al obtener incidentes',
        error.response?.status || 500
      );
    }
  }

  async getIncident(id: string): Promise<Incident> {
    try {
      console.log('🔍 Getting incident by ID:', id);
      
      // Usar el endpoint específico GET /incidents/{id}
      const response = await incidentsHttpClient.get<BackendIncident>(`/incidents/${id}`);
      
      console.log('✅ Incident retrieved:', response.data);
      
      return this.convertBackendToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ Error getting incident:', error);
      
      throw new AppError(
        error.response?.data?.error || error.response?.data?.message || error.message || 'Error al obtener el incidente',
        error.response?.status || 404
      );
    }
  }

  async createIncident(data: CreateIncidentRequest): Promise<Incident> {
    try {
      // Obtener el userId del usuario actual desde localStorage
      const userDataString = localStorage.getItem(USER_KEY);
      let authorId = 'anonymous';
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        authorId = userData.userId || userData.email || 'anonymous';
      }
      
      console.log('👤 Creating incident with authorId:', authorId);
      console.log('📍 Location selected:', data.location);
      console.log('🏷️ Category selected:', data.category);

      const backendData: CreateIncidentBackendRequest = {
        title: data.title,
        description: data.description,
        priority: this.mapPriorityToBackend(data.priority),
        authorId: authorId, // Incluir el authorId del usuario actual
        images: []
      };

      console.log('📤 Sending incident data:', backendData);

      const response = await incidentsHttpClient.post<BackendIncident>('/incidents', backendData);
      
      // Guardar location y category en localStorage para este incidente
      const incidentMetadata = {
        incidentId: response.data.incidentId,
        location: data.location,
        category: data.category
      };
      
      // Recuperar metadata existente
      const existingMetadata = JSON.parse(localStorage.getItem('incident_metadata') || '[]');
      existingMetadata.push(incidentMetadata);
      localStorage.setItem('incident_metadata', JSON.stringify(existingMetadata));
      
      console.log('💾 Saved incident metadata locally:', incidentMetadata);
      
      return this.convertBackendToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ Error creating incident:', error);
      throw new AppError(
        error.response?.data?.error || error.response?.data?.message || error.message || 'Error al crear el incidente',
        error.response?.status || 500
      );
    }
  }

  async updateIncident(id: string, data: UpdateIncidentRequest): Promise<Incident> {
    try {
      console.log('🔄 Updating incident:', id, 'with data:', data);
      
      const backendData: UpdateIncidentBackendRequest = {};
      
      if (data.title !== undefined) backendData.title = data.title;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.priority !== undefined) backendData.priority = this.mapPriorityToBackend(data.priority);
      if (data.status !== undefined) backendData.status = this.mapStatusToBackend(data.status);
      if (data.images !== undefined) backendData.images = data.images;

      console.log('📤 Sending update data to backend:', backendData);

      // Usar PUT en lugar de PATCH según el backend AWS Lambda
      const response = await incidentsHttpClient.put<BackendIncident>(`/incidents/${id}`, backendData);
      
      console.log('✅ Incident updated:', response.data);
      
      return this.convertBackendToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ Error updating incident:', error);
      throw new AppError(
        error.response?.data?.error || error.response?.data?.message || error.message || 'Error al actualizar el incidente',
        error.response?.status || 500
      );
    }
  }

  async assignIncident(id: string, userId: string): Promise<Incident> {
    try {
      console.log('👤 Assigning incident:', id, 'to user:', userId);
      
      const response = await incidentsHttpClient.post<BackendIncident>(`/incidents/${id}/assign`, {
        userId: userId
      });
      
      console.log('✅ Incident assigned successfully:', response.data);
      
      return this.convertBackendToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ Error assigning incident:', error);
      throw new AppError(
        error.response?.data?.error || error.response?.data?.message || error.message || 'Error al asignar el incidente',
        error.response?.status || 500
      );
    }
  }

  async deleteIncident(id: string): Promise<void> {
    try {
      await incidentsHttpClient.delete(`/incidents/${id}`);
    } catch (error: any) {
      console.error('❌ Error deleting incident:', error);
      throw new AppError(
        error.response?.data?.message || error.message || 'Error al eliminar el incidente',
        error.response?.status || 500
      );
    }
  }
}

export const incidentsAPI = new IncidentsAPI();
