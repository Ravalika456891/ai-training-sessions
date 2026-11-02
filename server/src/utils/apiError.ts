export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: any[]): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized access'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden access'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static unprocessable(message: string, errors?: any[]): ApiError {
    return new ApiError(422, message, errors);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, undefined, false);
  }
}

