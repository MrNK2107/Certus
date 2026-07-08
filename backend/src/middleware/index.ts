import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '@msme-credit/shared';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = (req.headers['x-request-id'] as string) || uuidv4();
  next();
}

export function responseEnvelopeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    if (body && typeof body === 'object' && 'requestId' in (body as Record<string, unknown>)) {
      return originalJson(body);
    }
    const envelope: Record<string, unknown> = {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    };
    if (body && typeof body === 'object' && 'data' in (body as Record<string, unknown>) && 'meta' in (body as Record<string, unknown>)) {
      envelope.data = (body as Record<string, unknown>).data;
      envelope.meta = (body as Record<string, unknown>).meta;
    } else {
      envelope.data = body;
    }
    return originalJson(envelope);
  };
  next();
}

export function errorHandlerMiddleware(err: Error & { statusCode?: number; code?: string; details?: Record<string, unknown>; actionableHint?: string }, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[${req.requestId}] Error:`, err.message);
  const errorResponse: ApiError = {
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    errorCode: err.code || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred',
    details: err.details,
    actionableHint: err.actionableHint,
  };
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(errorResponse);
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, unknown>;
  actionableHint?: string;

  constructor(statusCode: number, code: string, message: string, details?: Record<string, unknown>, actionableHint?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.actionableHint = actionableHint;
    this.name = 'AppError';
  }
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function wrapAsync(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
