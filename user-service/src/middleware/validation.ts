import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { querySchema } from '../db/schema';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = schema.parse(req.body);
      req.body = validData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          data: null,
          message: 'Validation failed',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
};

export const validateQueryParameters = (querySchema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      querySchema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          data: null,
          message: 'Validation failed',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
};
