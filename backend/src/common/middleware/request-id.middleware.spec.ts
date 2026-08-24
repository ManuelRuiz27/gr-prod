import { RequestIdMiddleware } from './request-id.middleware';
import { Response } from 'express';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
  });

  it('should generate a new request id if none provided', () => {
    const req: any = { headers: {} };
    const res: Partial<Response> = {
      setHeader: jest.fn(),
    };
    const next = jest.fn();

    middleware.use(req, res as Response, next);

    expect(req.requestId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it('should preserve incoming x-request-id header', () => {
    const req: any = { headers: { 'x-request-id': 'custom-req-id-123' } };
    const res: Partial<Response> = {
      setHeader: jest.fn(),
    };
    const next = jest.fn();

    middleware.use(req, res as Response, next);

    expect(req.requestId).toBe('custom-req-id-123');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', 'custom-req-id-123');
    expect(next).toHaveBeenCalled();
  });
});
