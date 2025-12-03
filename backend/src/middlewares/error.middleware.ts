import { Request, Response, NextFunction } from 'express';
import { sendError, logger } from '../utils';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error: ${err.message}`);
  
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Error no controlado
  logger.error(`Stack: ${err.stack}`);
  sendError(res, 'Error interno del servidor', 500);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  sendError(res, `Ruta no encontrada: ${req.originalUrl}`, 404);
};
