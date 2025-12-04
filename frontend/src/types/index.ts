// Tipos de usuario
export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isAnonymous: boolean;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de incidente
export enum IncidentStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  RESOLVED = 'resolved',
}

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
}

export interface Evidence {
  id: string;
  incidentId: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface Incident {
  id: string;
  userId?: string;
  categoryId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  incidentDate: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  isAnonymous: boolean;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  evidences?: Evidence[];
}

// Tipos de mapa
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  severity?: string;
}

// Tipos de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface IncidentFilters extends PaginationParams {
  categoryId?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  startDate?: string;
  endDate?: string;
  bounds?: BoundingBox;
}

// Tipos de autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Tipos de formulario
export interface CreateIncidentData {
  categoryId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  incidentDate: string;
  severity?: IncidentSeverity;
  isAnonymous?: boolean;
}

// Tipos de estadísticas
export interface CategoryStats {
  categoryId: string;
  category: Category;
  total: number;
  validated: number;
  pending: number;
}

export interface TemporalStats {
  period: string;
  total: number;
}

// Tipos de predicción
export interface Prediction {
  id: string;
  latitude: number;
  longitude: number;
  probability: number;
  predictedDate: string;
  category?: Category;
}

// Tipos de notificación
export interface Notification {
  id: string;
  userId: string;
  incidentId?: string;
  type: 'incident_nearby' | 'incident_validated' | 'incident_rejected' | 'alert_zone' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
