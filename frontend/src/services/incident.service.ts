import api from './api';
import {
  ApiResponse,
  Incident,
  CreateIncidentData,
  IncidentFilters,
  HeatmapPoint,
  CategoryStats,
  TemporalStats,
} from '../types';

export const incidentService = {
  async getAll(filters?: IncidentFilters): Promise<{ incidents: Incident[]; total: number; pagination: any }> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.status) params.append('status', filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.bounds) {
        params.append('north', filters.bounds.north.toString());
        params.append('south', filters.bounds.south.toString());
        params.append('east', filters.bounds.east.toString());
        params.append('west', filters.bounds.west.toString());
      }
    }

    const response = await api.get<ApiResponse<Incident[]>>(`/incidents?${params.toString()}`);
    return {
      incidents: response.data.data || [],
      total: response.data.pagination?.total || 0,
      pagination: response.data.pagination,
    };
  },

  async getById(id: string): Promise<Incident> {
    const response = await api.get<ApiResponse<Incident>>(`/incidents/${id}`);
    return response.data.data!;
  },

  async getNearby(latitude: number, longitude: number, radius?: number): Promise<Incident[]> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (radius) params.append('radius', radius.toString());

    const response = await api.get<ApiResponse<Incident[]>>(`/incidents/nearby?${params.toString()}`);
    return response.data.data || [];
  },

  async create(data: CreateIncidentData): Promise<Incident> {
    const response = await api.post<ApiResponse<Incident>>('/incidents', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<CreateIncidentData>): Promise<Incident> {
    const response = await api.put<ApiResponse<Incident>>(`/incidents/${id}`, data);
    return response.data.data!;
  },

  async validate(id: string): Promise<Incident> {
    const response = await api.patch<ApiResponse<Incident>>(`/incidents/${id}/validate`);
    return response.data.data!;
  },

  async reject(id: string, reason: string): Promise<Incident> {
    const response = await api.patch<ApiResponse<Incident>>(`/incidents/${id}/reject`, { reason });
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/incidents/${id}`);
  },

  async getHeatmapData(filters?: Partial<IncidentFilters>): Promise<HeatmapPoint[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
    }

    const response = await api.get<ApiResponse<Array<{ latitude: number; longitude: number; intensity: number; severity: string }>>>(`/incidents/heatmap?${params.toString()}`);
    
    return (response.data.data || []).map(point => ({
      lat: point.latitude,
      lng: point.longitude,
      intensity: point.intensity,
      severity: point.severity,
    }));
  },

  async getStatsByCategory(): Promise<CategoryStats[]> {
    const response = await api.get<ApiResponse<CategoryStats[]>>('/incidents/stats/categories');
    return response.data.data || [];
  },

  async getTemporalStats(groupBy?: 'hour' | 'day' | 'month', startDate?: string, endDate?: string): Promise<TemporalStats[]> {
    const params = new URLSearchParams();
    if (groupBy) params.append('groupBy', groupBy);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<ApiResponse<TemporalStats[]>>(`/incidents/stats/temporal?${params.toString()}`);
    return response.data.data || [];
  },
};
