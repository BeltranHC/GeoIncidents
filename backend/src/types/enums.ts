// Tipos de enumeraciones para el sistema
export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin',
}

export enum IncidentStatus {
  PENDING = 'pending',        // Pendiente de validación
  VALIDATED = 'validated',    // Validado por admin
  REJECTED = 'rejected',      // Rechazado (falso/duplicado)
  RESOLVED = 'resolved',      // Resuelto
}

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum EvidenceType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export enum NotificationType {
  INCIDENT_NEARBY = 'incident_nearby',
  INCIDENT_VALIDATED = 'incident_validated',
  INCIDENT_REJECTED = 'incident_rejected',
  ALERT_ZONE = 'alert_zone',
  SYSTEM = 'system',
}

export enum RiskLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
  CRITICAL = 'critical',
}
