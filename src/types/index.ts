export type UserRole = 'student' | 'staff' | 'authority';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Category = 'INFRAESTRUCTURA' | 'SOFTWARE' | 'OTROS';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: Priority;
  category: Category;
  status: Status;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
  attachments?: Attachment[];
  commentsCount?: number;  // Contador de comentarios
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  s3Key?: string;  // Clave S3 para obtener URL pre-firmada
  contentType: string;
  size: number;
  uploadedAt: string;
  thumbnail?: string;
  isImage?: boolean;
}

export interface Comment {
  id: string;
  incidentId: string;
  content: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export type NotificationType = 'INCIDENT_CREATED' | 'INCIDENT_UPDATED' | 'COMMENT_ADDED';

export interface Notification {
  id: string;
  type: NotificationType;
  incidentId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WebSocketMessage {
  type: 'INCIDENT_UPDATED' | 'COMMENT_ADDED' | 'NOTIFICATION_RECEIVED';
  incident?: Incident;
  incidentId?: string;
  comment?: Comment;
  notification?: Notification;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  location: string;
  priority: Priority;
  category: Category;
}

export interface UpdateIncidentRequest {
  title?: string;
  description?: string;
  location?: string;
  priority?: Priority;
  category?: Category;
  status?: Status;
  assignedTo?: string;
  images?: string[];
}

export type AuditAction = 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'COMMENTED';

export interface AuditLog {
  id: string;
  incidentId: string;
  action: AuditAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  description: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
