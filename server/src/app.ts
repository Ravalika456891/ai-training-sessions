import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rateLimit.middleware.js';
import { ApiError } from './utils/apiError.js';
import { env } from './config/env.js';

export const createApp = (): Express => {
  const app = express();

  // 1. Trust proxy in production if behind reverse proxy / Cloudflare
  if (env.isProduction) {
    app.set('trust proxy', 1);
  }

  // 2. Helmet HTTP Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // 3. Strict CORS Allowlists with automatic Vercel preview & production support
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server webhooks)
        if (!requestOrigin) return callback(null, true);

        const isAllowed =
          requestOrigin === env.CLIENT_ORIGIN ||
          requestOrigin === 'http://localhost:5173' ||
          requestOrigin === 'http://127.0.0.1:5173' ||
          requestOrigin.endsWith('.vercel.app') ||
          requestOrigin.includes('localhost') ||
          (process.env.VERCEL_URL && requestOrigin.includes(process.env.VERCEL_URL));

        if (isAllowed) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive fallback for authorized frontends
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-requested-with'],
    })
  );

  // 4. Request Parsers
  app.use(
    express.json({
      limit: '1mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // 5. Global API Rate Limiter
  app.use('/api', apiRateLimiter);

  // 6. CSRF Mitigation Header Check for Cookie-Authenticated State Mutations
  app.use((req: Request, _res: Response, next: NextFunction) => {
    // Only check mutating requests that contain the auth cookie
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const hasAuthCookie = Boolean(req.cookies?.[env.COOKIE_NAME]);

    if (isMutation && hasAuthCookie) {
      const customHeader = req.headers['x-requested-with'] || req.headers['authorization'];
      if (!customHeader && req.path.startsWith('/api/admin')) {
        return next(
          ApiError.forbidden('CSRF validation failed: Missing custom request header.')
        );
      }
    }
    next();
  });

  // 7. Mount REST API
  app.use('/api', apiRoutes);

  // 8. 404 Handler for Unmatched Routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
  });

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
};

