import { Op, WhereOptions, literal } from 'sequelize';
import { Incident, Category, User, Evidence } from '../models';
import { AppError } from '../middlewares';
import { IncidentStatus, IncidentSeverity } from '../types/enums';
import { IncidentFilter, BoundingBox, HeatmapData } from '../types';

interface CreateIncidentData {
  userId?: string;
  categoryId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  incidentDate: Date;
  severity?: IncidentSeverity;
  isAnonymous?: boolean;
}

interface UpdateIncidentData {
  categoryId?: string;
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  incidentDate?: Date;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
}

class IncidentService {
  async create(data: CreateIncidentData): Promise<Incident> {
    // Verificar que la categoría existe
    const category = await Category.findByPk(data.categoryId);
    
    if (!category || !category.isActive) {
      throw new AppError('Categoría no válida', 400);
    }

    const incident = await Incident.create({
      ...data,
      status: IncidentStatus.PENDING,
      severity: data.severity || IncidentSeverity.MEDIUM,
      isAnonymous: data.isAnonymous || false,
    });

    return this.findById(incident.id);
  }

  async findById(id: string): Promise<Incident> {
    const incident = await Incident.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl'],
        },
        { model: Evidence, as: 'evidences' },
      ],
    });

    if (!incident) {
      throw new AppError('Incidente no encontrado', 404);
    }

    return incident;
  }

  async findAll(
    filters: IncidentFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<{ incidents: Incident[]; total: number }> {
    const where: WhereOptions<any> = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.startDate && filters.endDate) {
      where.incidentDate = {
        [Op.between]: [filters.startDate, filters.endDate],
      };
    } else if (filters.startDate) {
      where.incidentDate = {
        [Op.gte]: filters.startDate,
      };
    } else if (filters.endDate) {
      where.incidentDate = {
        [Op.lte]: filters.endDate,
      };
    }

    // Filtro por bounding box (área geográfica)
    if (filters.bounds) {
      where.latitude = {
        [Op.between]: [filters.bounds.south, filters.bounds.north],
      };
      where.longitude = {
        [Op.between]: [filters.bounds.west, filters.bounds.east],
      };
    }

    const { rows: incidents, count: total } = await Incident.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { incidents, total };
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    limit: number = 50
  ): Promise<Incident[]> {
    // Usando la fórmula de Haversine para calcular distancia
    const haversineFormula = `
      (6371 * acos(
        cos(radians(${latitude})) * 
        cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${longitude})) + 
        sin(radians(${latitude})) * 
        sin(radians(latitude))
      ))
    `;

    const incidents = await Incident.findAll({
      where: {
        status: IncidentStatus.VALIDATED,
      },
      attributes: {
        include: [[literal(haversineFormula), 'distance']],
      },
      include: [
        { model: Category, as: 'category' },
      ],
      having: literal(`${haversineFormula} <= ${radiusKm}`),
      order: [[literal('distance'), 'ASC']],
      limit,
    });

    return incidents;
  }

  async update(id: string, data: UpdateIncidentData, adminId?: string): Promise<Incident> {
    const incident = await Incident.findByPk(id);

    if (!incident) {
      throw new AppError('Incidente no encontrado', 404);
    }

    await incident.update(data);

    return this.findById(id);
  }

  async validate(id: string, adminId: string): Promise<Incident> {
    const incident = await Incident.findByPk(id);

    if (!incident) {
      throw new AppError('Incidente no encontrado', 404);
    }

    await incident.update({
      status: IncidentStatus.VALIDATED,
      validatedBy: adminId,
      validatedAt: new Date(),
    });

    return this.findById(id);
  }

  async reject(id: string, adminId: string, reason: string): Promise<Incident> {
    const incident = await Incident.findByPk(id);

    if (!incident) {
      throw new AppError('Incidente no encontrado', 404);
    }

    await incident.update({
      status: IncidentStatus.REJECTED,
      validatedBy: adminId,
      validatedAt: new Date(),
      rejectionReason: reason,
    });

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const incident = await Incident.findByPk(id);

    if (!incident) {
      throw new AppError('Incidente no encontrado', 404);
    }

    await incident.destroy();
  }

  // Datos para mapa de calor
  async getHeatmapData(filters?: IncidentFilter): Promise<HeatmapData[]> {
    const where: WhereOptions<any> = {
      status: IncidentStatus.VALIDATED,
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.incidentDate = {
        [Op.between]: [filters.startDate, filters.endDate],
      };
    }

    if (filters?.bounds) {
      where.latitude = {
        [Op.between]: [filters.bounds.south, filters.bounds.north],
      };
      where.longitude = {
        [Op.between]: [filters.bounds.west, filters.bounds.east],
      };
    }

    const incidents = await Incident.findAll({
      where,
      attributes: ['latitude', 'longitude', 'severity'],
    });

    // Convertir severidad a intensidad
    const severityToIntensity: Record<IncidentSeverity, number> = {
      [IncidentSeverity.LOW]: 0.3,
      [IncidentSeverity.MEDIUM]: 0.5,
      [IncidentSeverity.HIGH]: 0.8,
      [IncidentSeverity.CRITICAL]: 1.0,
    };

    return incidents.map(incident => ({
      latitude: Number(incident.latitude),
      longitude: Number(incident.longitude),
      intensity: severityToIntensity[incident.severity],
      severity: incident.severity,
    }));
  }

  // Estadísticas por categoría
  async getStatsByCategory(): Promise<any[]> {
    const stats = await Incident.findAll({
      attributes: [
        'categoryId',
        [literal('COUNT(*)'), 'total'],
        [literal(`COUNT(CASE WHEN status = '${IncidentStatus.VALIDATED}' THEN 1 END)`), 'validated'],
        [literal(`COUNT(CASE WHEN status = '${IncidentStatus.PENDING}' THEN 1 END)`), 'pending'],
      ],
      include: [
        { model: Category, as: 'category', attributes: ['name', 'color', 'icon'] },
      ],
      group: ['categoryId', 'category.id'],
    });

    return stats;
  }

  // Estadísticas temporales
  async getTemporalStats(
    groupBy: 'hour' | 'day' | 'month' = 'day',
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    const where: WhereOptions<any> = {
      status: IncidentStatus.VALIDATED,
    };

    if (startDate && endDate) {
      where.incidentDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    let dateFormat: string;
    switch (groupBy) {
      case 'hour':
        dateFormat = 'YYYY-MM-DD HH24';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const stats = await Incident.findAll({
      where,
      attributes: [
        [literal(`TO_CHAR(incident_date, '${dateFormat}')`), 'period'],
        [literal('COUNT(*)'), 'total'],
      ],
      group: [literal(`TO_CHAR(incident_date, '${dateFormat}')`)],
      order: [[literal('period'), 'ASC']],
    });

    return stats;
  }

  // Incrementar contador de vistas
  async incrementViewCount(id: string): Promise<void> {
    await Incident.update(
      { viewCount: literal('view_count + 1') as any },
      { where: { id } }
    );
  }
}

export default new IncidentService();
