import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      
      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      sendSuccess(res, result, 'Usuario registrado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login({ email, password });

      sendSuccess(res, result, 'Inicio de sesión exitoso');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'No autenticado', 401);
        return;
      }

      const user = await AuthService.getProfile(req.user.userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'No autenticado', 401);
        return;
      }

      const { firstName, lastName, phone, avatarUrl, isAnonymous } = req.body;

      const user = await AuthService.updateProfile(req.user.userId, {
        firstName,
        lastName,
        phone,
        avatarUrl,
        isAnonymous,
      });

      sendSuccess(res, user, 'Perfil actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'No autenticado', 401);
        return;
      }

      const { currentPassword, newPassword } = req.body;

      await AuthService.changePassword(req.user.userId, currentPassword, newPassword);

      sendSuccess(res, null, 'Contraseña actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
