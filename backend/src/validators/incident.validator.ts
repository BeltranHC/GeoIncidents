import { body, query } from 'express-validator';
import { IncidentStatus, IncidentSeverity } from '../types/enums';

export const createIncidentValidation = [
  body('categoryId')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isUUID()
    .withMessage('ID de categoría inválido'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ max: 255 })
    .withMessage('El título no puede exceder 255 caracteres'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida'),
  body('latitude')
    .notEmpty()
    .withMessage('La latitud es requerida')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),
  body('longitude')
    .notEmpty()
    .withMessage('La longitud es requerida')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida'),
  body('address')
    .optional()
    .trim(),
  body('incidentDate')
    .notEmpty()
    .withMessage('La fecha del incidente es requerida')
    .isISO8601()
    .withMessage('Formato de fecha inválido'),
  body('severity')
    .optional()
    .isIn(Object.values(IncidentSeverity))
    .withMessage('Severidad inválida'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous debe ser un booleano'),
];

export const updateIncidentValidation = [
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('ID de categoría inválido'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('El título no puede exceder 255 caracteres'),
  body('description')
    .optional()
    .trim(),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida'),
  body('severity')
    .optional()
    .isIn(Object.values(IncidentSeverity))
    .withMessage('Severidad inválida'),
  body('status')
    .optional()
    .isIn(Object.values(IncidentStatus))
    .withMessage('Estado inválido'),
];

export const incidentFiltersValidation = [
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('ID de categoría inválido'),
  query('status')
    .optional()
    .isIn(Object.values(IncidentStatus))
    .withMessage('Estado inválido'),
  query('severity')
    .optional()
    .isIn(Object.values(IncidentSeverity))
    .withMessage('Severidad inválida'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha de inicio inválido'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha de fin inválido'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Límite debe ser entre 1 y 1000'),
  query('north')
    .optional()
    .isFloat({ min: -90, max: 90 }),
  query('south')
    .optional()
    .isFloat({ min: -90, max: 90 }),
  query('east')
    .optional()
    .isFloat({ min: -180, max: 180 }),
  query('west')
    .optional()
    .isFloat({ min: -180, max: 180 }),
];

export const nearbyValidation = [
  query('latitude')
    .notEmpty()
    .withMessage('La latitud es requerida')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),
  query('longitude')
    .notEmpty()
    .withMessage('La longitud es requerida')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radio debe ser entre 0.1 y 100 km'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Límite debe ser entre 1 y 200'),
];

export const rejectIncidentValidation = [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('La razón de rechazo es requerida'),
];
