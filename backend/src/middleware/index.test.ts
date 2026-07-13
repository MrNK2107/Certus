import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  requestIdMiddleware,
  responseEnvelopeMiddleware,
  errorHandlerMiddleware,
  wrapAsync,
  AppError,
} from './index';

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    ...overrides,
  } as unknown as Request;
}

interface MockRes {
  statusCode: number;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
}

function createMockRes(): { res: Response; jsonMock: ReturnType<typeof vi.fn> } {
  const jsonMock = vi.fn();
  const mockRes: MockRes = {
    statusCode: 200,
    status: vi.fn((code: number) => {
      mockRes.statusCode = code;
      return mockRes;
    }),
    json: jsonMock,
  };
  return { res: mockRes as unknown as Response, jsonMock };
}

describe('requestIdMiddleware', () => {
  it('should generate a requestId if none provided', () => {
    const req = createMockReq();
    const next = vi.fn();
    requestIdMiddleware(req, {} as Response, next);
    expect(req.requestId).toBeDefined();
    expect(typeof req.requestId).toBe('string');
    expect(next).toHaveBeenCalledOnce();
  });

  it('should use x-request-id header if provided', () => {
    const req = createMockReq({ headers: { 'x-request-id': 'custom-id-123' } });
    const next = vi.fn();
    requestIdMiddleware(req, {} as Response, next);
    expect(req.requestId).toBe('custom-id-123');
    expect(next).toHaveBeenCalledOnce();
  });
});

describe('responseEnvelopeMiddleware', () => {
  it('should wrap response body in envelope with requestId and timestamp', () => {
    const req = createMockReq();
    req.requestId = 'test-req-id';
    const { res, jsonMock } = createMockRes();
    const next = vi.fn();

    responseEnvelopeMiddleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();

    res.json({ someData: 'value' });
    const callBody = jsonMock.mock.lastCall?.[0];
    expect(callBody).toHaveProperty('requestId', 'test-req-id');
    expect(callBody).toHaveProperty('timestamp');
    expect(callBody).toHaveProperty('data');
    expect(callBody.data).toEqual({ someData: 'value' });
  });

  it('should not double-wrap if body already has requestId', () => {
    const req = createMockReq();
    req.requestId = 'test-req-id';
    const { res, jsonMock } = createMockRes();
    const next = vi.fn();

    responseEnvelopeMiddleware(req, res, next);

    res.json({ requestId: 'already-present', data: 'test' });
    const callBody = jsonMock.mock.lastCall?.[0];
    expect(callBody).toEqual({ requestId: 'already-present', data: 'test' });
  });

  it('should preserve data/meta structure when body has both', () => {
    const req = createMockReq();
    req.requestId = 'test-req-id';
    const { res, jsonMock } = createMockRes();
    const next = vi.fn();

    responseEnvelopeMiddleware(req, res, next);

    res.json({ data: { key: 'value' }, meta: { total: 10 } });
    const callBody = jsonMock.mock.lastCall?.[0];
    expect(callBody.requestId).toBe('test-req-id');
    expect(callBody.data).toEqual({ key: 'value' });
    expect(callBody.meta).toEqual({ total: 10 });
  });
});

describe('errorHandlerMiddleware', () => {
  it('should produce correct error shape with requestId and timestamp', () => {
    const req = createMockReq();
    req.requestId = 'err-req-id';
    const { res, jsonMock } = createMockRes();
    const next = vi.fn();
    const err = new Error('Something broke');

    errorHandlerMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    const callBody = jsonMock.mock.lastCall?.[0];
    expect(callBody).toHaveProperty('requestId', 'err-req-id');
    expect(callBody).toHaveProperty('timestamp');
    expect(callBody).toHaveProperty('errorCode', 'INTERNAL_ERROR');
    expect(callBody).toHaveProperty('message', 'Something broke');
  });

  it('should use statusCode and code from enriched error', () => {
    const req = createMockReq();
    req.requestId = 'err-req-id';
    const { res, jsonMock } = createMockRes();
    const next = vi.fn();

    const err = Object.assign(new Error('Not found'), { statusCode: 404, code: 'NOT_FOUND' });
    errorHandlerMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    const callBody = jsonMock.mock.lastCall?.[0];
    expect(callBody.errorCode).toBe('NOT_FOUND');
  });

  it('should include details and actionableHint when present', () => {
    const req = createMockReq();
    req.requestId = 'err-req-id';
    const { res, jsonMock } = createMockRes();
    const next = vi.fn();

    const err = Object.assign(new Error('Validation failed'), {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      details: { field: 'email' },
      actionableHint: 'Provide a valid email address',
    });
    errorHandlerMiddleware(err, req, res, next);
    const callBody = jsonMock.mock.lastCall?.[0];
    expect(callBody.details).toEqual({ field: 'email' });
    expect(callBody.actionableHint).toBe('Provide a valid email address');
  });
});

describe('wrapAsync', () => {
  it('should call next with error when async handler rejects', async () => {
    const req = createMockReq();
    const { res } = createMockRes();
    const next = vi.fn();

    const handler = async () => {
      throw new Error('Async error');
    };

    const wrapped = wrapAsync(handler);
    await wrapped(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should not call next when async handler succeeds', async () => {
    const req = createMockReq();
    const { res } = createMockRes();
    const next = vi.fn();

    const handler = async () => {
      return 'success';
    };

    const wrapped = wrapAsync(handler);
    await wrapped(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('AppError', () => {
  it('should create an AppError with the correct properties', () => {
    const err = new AppError(403, 'FORBIDDEN', 'Access denied', { role: 'viewer' }, 'Request higher role');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
    expect(err.message).toBe('Access denied');
    expect(err.details).toEqual({ role: 'viewer' });
    expect(err.actionableHint).toBe('Request higher role');
    expect(err.name).toBe('AppError');
  });

  it('should create an AppError without optional fields', () => {
    const err = new AppError(500, 'INTERNAL_ERROR', 'Server error');
    expect(err.statusCode).toBe(500);
    expect(err.details).toBeUndefined();
    expect(err.actionableHint).toBeUndefined();
  });
});
