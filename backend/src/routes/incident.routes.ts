import { Router } from 'express';
import { IncidentController } from '../controllers';
import { authenticate, authorize, optionalAuth, validate } from '../middlewares';
import { UserRole } from '../types/enums';
import {
  createIncidentValidation,
  updateIncidentValidation,
  incidentFiltersValidation,
  nearbyValidation,
  rejectIncidentValidation,
} from '../validators';

const router = Router();

/**
 * @swagger
 * /incidents:
 *   get:
 *     summary: Listar todos los incidentes
 *     tags: [Incidents]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de incidentes
 */
router.get('/', optionalAuth, validate(incidentFiltersValidation), IncidentController.findAll);

/**
 * @swagger
 * /incidents/nearby:
 *   get:
 *     summary: Obtener incidentes cercanos a una ubicación
 *     tags: [Incidents]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *     responses:
 *       200:
 *         description: Lista de incidentes cercanos
 */
router.get('/nearby', validate(nearbyValidation), IncidentController.findNearby);

/**
 * @swagger
 * /incidents/heatmap:
 *   get:
 *     summary: Obtener datos para mapa de calor
 *     tags: [Incidents]
 *     responses:
 *       200:
 *         description: Datos para mapa de calor
 */
router.get('/heatmap', IncidentController.getHeatmapData);

/**
 * @swagger
 * /incidents/stats/categories:
 *   get:
 *     summary: Estadísticas por categoría
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas por categoría
 */
router.get('/stats/categories', authenticate, authorize(UserRole.ADMIN), IncidentController.getStatsByCategory);

/**
 * @swagger
 * /incidents/stats/temporal:
 *   get:
 *     summary: Estadísticas temporales
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [hour, day, month]
 *     responses:
 *       200:
 *         description: Estadísticas temporales
 */
router.get('/stats/temporal', authenticate, authorize(UserRole.ADMIN), IncidentController.getTemporalStats);

/**
 * @swagger
 * /incidents/{id}:
 *   get:
 *     summary: Obtener un incidente por ID
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del incidente
 */
router.get('/:id', IncidentController.findById);

/**
 * @swagger
 * /incidents:
 *   post:
 *     summary: Crear un nuevo incidente
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - title
 *               - description
 *               - latitude
 *               - longitude
 *               - incidentDate
 *             properties:
 *               categoryId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               address:
 *                 type: string
 *               incidentDate:
 *                 type: string
 *                 format: date-time
 *               severity:
 *                 type: string
 *               isAnonymous:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Incidente creado
 */
router.post('/', authenticate, validate(createIncidentValidation), IncidentController.create);

/**
 * @swagger
 * /incidents/{id}:
 *   put:
 *     summary: Actualizar un incidente
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Incidente actualizado
 */
router.put('/:id', authenticate, authorize(UserRole.ADMIN), validate(updateIncidentValidation), IncidentController.update);

/**
 * @swagger
 * /incidents/{id}/validate:
 *   patch:
 *     summary: Validar un incidente
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Incidente validado
 */
router.patch('/:id/validate', authenticate, authorize(UserRole.ADMIN), IncidentController.validate);

/**
 * @swagger
 * /incidents/{id}/reject:
 *   patch:
 *     summary: Rechazar un incidente
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Incidente rechazado
 */
router.patch('/:id/reject', authenticate, authorize(UserRole.ADMIN), validate(rejectIncidentValidation), IncidentController.reject);

/**
 * @swagger
 * /incidents/{id}:
 *   delete:
 *     summary: Eliminar un incidente
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Incidente eliminado
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), IncidentController.delete);

export default router;
