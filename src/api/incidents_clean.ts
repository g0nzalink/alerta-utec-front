import type { Incident, CreateIncidentRequest, UpdateIncidentRequest, PaginatedResponse, Priority, Status } from '../types';
import { AppError } from '../utils/helpers';
import axios, { type AxiosInstance } from 'axios';
import { TOKEN_KEY } from '../config';

// URL de la API de incidentes
const INCIDENTS_API_URL = 'https://wkcu4ednn9.execute-api.us-east-1.amazonaws.com/prod';

// Interfaces basadas en la respuesta real de la API
interface BackendIncident {
  incidentId: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  urgencia: 'baja' | 'media' | 'alta';
  status: 'open' | 'in_progress' | 'resolved';
  reporterId: string;
  reporterEmail: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

interface BackendIncidentsResponse {
  incidents: BackendIncident[];
  count: number;
}

interface CreateIncidentBackendRequest {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  urgencia: 'baja' | 'media' | 'alta';
}

interface UpdateIncidentBackendRequest {
  titulo?: string;
  descripcion?: string;
  ubicacion?: string;
  urgencia?: 'baja' | 'media' | 'alta';
  status?: 'open' | 'in_progress' | 'resolved';
  assignedTo?: string;
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
  // Mapeo de prioridades frontend -> backend
  private mapPriorityToUrgencia(priority: Priority): 'baja' | 'media' | 'alta' {
    const mapping: Record<Priority, 'baja' | 'media' | 'alta'> = {
      'LOW': 'baja',
      'MEDIUM': 'media',
      'HIGH': 'alta'
    };
    return mapping[priority] || 'media';
  }

  // Mapeo de urgencias backend -> frontend
  private mapUrgenciaToPriority(urgencia: string): Priority {
    const mapping: Record<string, Priority> = {
      'baja': 'LOW',
      'media': 'MEDIUM',
      'alta': 'HIGH'
    };
    return mapping[urgencia] || 'MEDIUM';
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
    return {
      id: backend.incidentId,
      title: backend.titulo,
      description: backend.descripcion,
      location: backend.ubicacion,
      priority: this.mapUrgenciaToPriority(backend.urgencia),
      category: 'OTROS', // Por defecto, ya que el backend no tiene categorías
      status: this.mapStatusToFrontend(backend.status),
      createdAt: new Date(backend.createdAt * 1000).toISOString(),
      updatedAt: new Date(backend.updatedAt * 1000).toISOString(),
      createdBy: backend.reporterId || 'Anónimo',
      assignedTo: undefined,
      attachments: []
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
      const params = new URLSearchParams();
      
      // El backend solo soporta filtro por status por ahora
      if (filters?.status) {
        const backendStatus = this.mapStatusToBackend(filters.status as Status);
        params.append('status', backendStatus);
      }

      const url = `/incidents${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await incidentsHttpClient.get<BackendIncidentsResponse>(url);
      
      let incidents = response.data.incidents.map(incident => this.convertBackendToFrontend(incident));
      
      // Aplicar filtros que el backend no soporta
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

      // Paginación manual (ya que el backend no la soporta aún)
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
      const response = await incidentsHttpClient.get<BackendIncident>(`/incidents/${id}`);
      return this.convertBackendToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ Error getting incident:', error);
      if (error.response?.status === 404) {
        throw new AppError('Incidente no encontrado', 404);
      }
      throw new AppError(
        error.response?.data?.message || error.message || 'Error al obtener el incidente',
        error.response?.status || 500
      );
    }
  }

  async createIncident(data: CreateIncidentRequest): Promise<Incident> {
    try {
      const backendData: CreateIncidentBackendRequest = {
        titulo: data.title,
        descripcion: data.description,
        ubicacion: data.location,
        urgencia: this.mapPriorityToUrgencia(data.priority),
      };

      const response = await incidentsHttpClient.post<BackendIncident>('/incidents', backendData);
      return this.convertBackendToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ Error creating incident:', error);
      throw new AppError(
        error.response?.data?.message || error.message || 'Error al crear el incidente',
        error.response?.status || 500
      );
    }
  }

  async updateIncident(id: string, data: UpdateIncidentRequest): Promise<Incident> {
    try {
      const backendData: UpdateIncidentBackendRequest = {};
      
      if (data.title !== undefined) backendData.titulo = data.title;
      if (data.description !== undefined) backendData.descripcion = data.description;
      if (data.location !== undefined) backendData.ubicacion = data.location;
      if (data.priority !== undefined) backendData.urgencia = this.mapPriorityToUrgencia(data.priority);
      if (data.status !== undefined) backendData.status = this.mapStatusToBackend(data.status);
      if (data.assignedTo !== undefined) backendData.assignedTo = data.assignedTo;

      const response = await incidentsHttpClient.put<BackendIncident>(`/incidents/${id}`, backendData);
      return this.convertBackendToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ Error updating incident:', error);
      throw new AppError(
        error.response?.data?.message || error.message || 'Error al actualizar el incidente',
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
