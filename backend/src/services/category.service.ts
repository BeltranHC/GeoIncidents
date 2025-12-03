import { Category } from '../models';
import { AppError } from '../middlewares';

interface CreateCategoryData {
  name: string;
  description?: string;
  icon: string;
  color: string;
  order?: number;
}

interface UpdateCategoryData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
}

class CategoryService {
  async create(data: CreateCategoryData): Promise<Category> {
    // Verificar si ya existe una categoría con el mismo nombre
    const existing = await Category.findOne({ where: { name: data.name } });
    
    if (existing) {
      throw new AppError('Ya existe una categoría con ese nombre', 400);
    }

    const category = await Category.create(data);
    return category;
  }

  async findAll(includeInactive: boolean = false): Promise<Category[]> {
    const where = includeInactive ? {} : { isActive: true };
    
    return Category.findAll({
      where,
      order: [['order', 'ASC'], ['name', 'ASC']],
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await Category.findByPk(id);
    
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }
    
    return category;
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const category = await Category.findByPk(id);
    
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (data.name && data.name !== category.name) {
      const existing = await Category.findOne({ where: { name: data.name } });
      if (existing) {
        throw new AppError('Ya existe una categoría con ese nombre', 400);
      }
    }

    await category.update(data);
    return category;
  }

  async delete(id: string): Promise<void> {
    const category = await Category.findByPk(id);
    
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    // En lugar de eliminar, desactivar (soft delete)
    await category.update({ isActive: false });
  }

  async reorder(categoryIds: string[]): Promise<void> {
    for (let i = 0; i < categoryIds.length; i++) {
      await Category.update(
        { order: i },
        { where: { id: categoryIds[i] } }
      );
    }
  }
}

export default new CategoryService();
