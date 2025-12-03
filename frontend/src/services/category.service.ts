import api from './api';
import { ApiResponse, Category } from '../types';

export const categoryService = {
  async getAll(includeInactive?: boolean): Promise<Category[]> {
    const params = includeInactive ? '?includeInactive=true' : '';
    const response = await api.get<ApiResponse<Category[]>>(`/categories${params}`);
    return response.data.data || [];
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data!;
  },

  async create(data: Omit<Category, 'id' | 'isActive' | 'order'>): Promise<Category> {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  async reorder(categoryIds: string[]): Promise<void> {
    await api.post('/categories/reorder', { categoryIds });
  },
};
