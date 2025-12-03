import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/response';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Ejecutar todas las validaciones
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      next();
      return;
    }

    const errorMessages = errors.array().map(error => {
      if ('path' in error) {
        return `${error.path}: ${error.msg}`;
      }
      return error.msg;
    });

    sendError(res, errorMessages.join(', '), 400);
  };
};
