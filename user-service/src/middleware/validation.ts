import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = schema.parse(req.body);
      console.log('[log]validData:', validData);
      req.body = validData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Invalid request body',
          details: error.issues.map((issue) => ({
            field: issue.path,
          })),
        });
      }
      next(error);
    }
  };
};
