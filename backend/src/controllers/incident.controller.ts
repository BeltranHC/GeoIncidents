import { Request, Response, NextFunction } from 'express';
import { IncidentService } from '../services';
import { sendSuccess, sendPaginated, sendError } from '../utils';
import { AuthenticatedRequest, IncidentFilter } from '../types';
import { IncidentStatus, IncidentSeverity } from '../types/enums';

export class IncidentController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        categoryId, 
        title, 
        description, 
        latitude, 
        longitude, 
        address, 
        incidentDate,
        severity,
        isAnonymous 
      } = req.body;

      const incident = await IncidentService.create({
        userId: isAnonymous ? undefined : req.user?.userId,
        categoryId,
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        incidentDate: new Date(incidentDate),
        severity,
        isAnonymous,
      });

      sendSuccess(res, incident, 'Incidente reportado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        categoryId, 
        status, 
        severity,
        startDate, 
        endDate,
        north,
        south,
        east,
        west,
        page = '1',
        limit = '20'
      } = req.query;

      const filters: IncidentFilter = {};

      if (categoryId) filters.categoryId = categoryId as string;
      if (status) filters.status = status as string;
      if (severity) filters.severity = severity as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      if (north && south && east && west) {
        filters.bounds = {
          north: parseFloat(north as string),
          south: parseFloat(south as string),
          east: parseFloat(east as string),
          west: parseFloat(west as string),
        };
      }

      const { incidents, total } = await IncidentService.findAll(
        filters,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

      sendPaginated(
        res,
        incidents,
        {
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
          total,
        }
      );
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const incident = await IncidentService.findById(id);
      
      // Incrementar contador de vistas
      await IncidentService.incrementViewCount(id);

      sendSuccess(res, incident);
    } catch (error) {
      next(error);
    }
  }

  async findNearby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { latitude, longitude, radius = '5', limit = '50' } = req.query;

      if (!latitude || !longitude) {
        sendError(res, 'Se requieren coordenadas (latitude, longitude)', 400);
        return;
      }

      const incidents = await IncidentService.findNearby(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat(radius as string),
        parseInt(limit as string, 10)
      );

      sendSuccess(res, incidents);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const incident = await IncidentService.update(id, updateData, req.user?.userId);

      sendSuccess(res, incident, 'Incidente actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async validate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user) {
        sendError(res, 'No autenticado', 401);
        return;
      }

      const incident = await IncidentService.validate(id, req.user.userId);

      sendSuccess(res, incident, 'Incidente validado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async reject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!req.user) {
        sendError(res, 'No autenticado', 401);
        return;
      }

      if (!reason) {
        sendError(res, 'Se requiere una razón para rechazar', 400);
        return;
      }

      const incident = await IncidentService.reject(id, req.user.userId, reason);

      sendSuccess(res, incident, 'Incidente rechazado');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await IncidentService.delete(id);

      sendSuccess(res, null, 'Incidente eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getHeatmapData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        categoryId,
        startDate,
        endDate,
        north,
        south,
        east,
        west
      } = req.query;

      const filters: IncidentFilter = {};

      if (categoryId) filters.categoryId = categoryId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      if (north && south && east && west) {
        filters.bounds = {
          north: parseFloat(north as string),
          south: parseFloat(south as string),
          east: parseFloat(east as string),
          west: parseFloat(west as string),
        };
      }

      const heatmapData = await IncidentService.getHeatmapData(filters);

      sendSuccess(res, heatmapData);
    } catch (error) {
      next(error);
    }
  }

  async getStatsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await IncidentService.getStatsByCategory();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getTemporalStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { groupBy = 'day', startDate, endDate } = req.query;

      const stats = await IncidentService.getTemporalStats(
        groupBy as 'hour' | 'day' | 'month',
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new IncidentController();
