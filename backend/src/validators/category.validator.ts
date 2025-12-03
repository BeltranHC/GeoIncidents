import { body } from 'express-validator';

export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  body('description')
    .optional()
    .trim(),
  body('icon')
    .trim()
    .notEmpty()
    .withMessage('El icono es requerido')
    .isLength({ max: 50 })
    .withMessage('El icono no puede exceder 50 caracteres'),
  body('color')
    .trim()
    .notEmpty()
    .withMessage('El color es requerido')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Formato de color inválido (use formato hex: #RRGGBB)'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero positivo'),
];

export const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  body('description')
    .optional()
    .trim(),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El icono no puede exceder 50 caracteres'),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Formato de color inválido (use formato hex: #RRGGBB)'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero positivo'),
];

export const reorderCategoriesValidation = [
  body('categoryIds')
    .isArray({ min: 1 })
    .withMessage('Se requiere un array de IDs de categorías'),
  body('categoryIds.*')
    .isUUID()
    .withMessage('Cada ID debe ser un UUID válido'),
];
