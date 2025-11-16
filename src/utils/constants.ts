import type { Priority, Status, Category } from '../types';
import { API_BASE_URL as CONFIG_API_URL, WEBSOCKET_URL } from '../config';

export const API_BASE_URL = CONFIG_API_URL;
export const WS_URL = WEBSOCKET_URL;

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media', 
  HIGH: 'Alta'
};

export const STATUS_LABELS: Record<Status, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En Progreso',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado'
};

export const CATEGORY_LABELS: Record<Category, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SOFTWARE: 'Software',
  OTROS: 'Otros'
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-green-100 text-green-900 border-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  HIGH: 'bg-red-100 text-red-900 border-red-300'
};

export const STATUS_COLORS: Record<Status, string> = {
  OPEN: 'bg-blue-100 text-blue-900 border-blue-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-900 border-purple-300',
  RESOLVED: 'bg-green-100 text-green-900 border-green-300',
  CLOSED: 'bg-gray-100 text-gray-900 border-gray-300'
};

export const PAGE_SIZE = 10;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
