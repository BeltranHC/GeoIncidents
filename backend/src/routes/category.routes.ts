import { Router } from 'express';
import { CategoryController } from '../controllers';
import { authenticate, authorize, validate } from '../middlewares';
import { UserRole } from '../types/enums';
import {
  createCategoryValidation,
  updateCategoryValidation,
  reorderCategoriesValidation,
} from '../validators';

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar todas las categorías
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/', CategoryController.findAll);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles de la categoría
 */
router.get('/:id', CategoryController.findById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - icon
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Categoría creada
 */
router.post('/', authenticate, authorize(UserRole.ADMIN), validate(createCategoryValidation), CategoryController.create);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [Categories]
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
 *         description: Categoría actualizada
 */
router.put('/:id', authenticate, authorize(UserRole.ADMIN), validate(updateCategoryValidation), CategoryController.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Desactivar una categoría
 *     tags: [Categories]
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
 *         description: Categoría desactivada
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), CategoryController.delete);

/**
 * @swagger
 * /categories/reorder:
 *   post:
 *     summary: Reordenar categorías
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryIds
 *             properties:
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Categorías reordenadas
 */
router.post('/reorder', authenticate, authorize(UserRole.ADMIN), validate(reorderCategoriesValidation), CategoryController.reorder);

export default router;
