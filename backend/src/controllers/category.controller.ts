import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services';
import { sendSuccess } from '../utils';

export class CategoryController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, icon, color, order } = req.body;

      const category = await CategoryService.create({
        name,
        description,
        icon,
        color,
        order,
      });

      sendSuccess(res, category, 'Categoría creada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { includeInactive } = req.query;
      
      const categories = await CategoryService.findAll(includeInactive === 'true');

      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const category = await CategoryService.findById(id);

      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const category = await CategoryService.update(id, updateData);

      sendSuccess(res, category, 'Categoría actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await CategoryService.delete(id);

      sendSuccess(res, null, 'Categoría desactivada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryIds } = req.body;

      await CategoryService.reorder(categoryIds);

      sendSuccess(res, null, 'Categorías reordenadas exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
