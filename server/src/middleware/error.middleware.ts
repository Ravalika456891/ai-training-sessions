import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors;

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource ID: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {});
    if (fields.includes('userId') && fields.includes('workshopId')) {
      message = 'You already have an active enrollment for this workshop cohort.';
    } else {
      message = `Duplicate value entered for ${fields.join(', ')}. Must be unique.`;
    }
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Don't expose internal stack trace in production
  const responsePayload: any = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(!env.isProduction && { stack: err.stack }),
  };

  if (statusCode >= 500) {
    console.error('[Unhandled Server Error]', err);
  }

  res.status(statusCode).json(responsePayload);
};

