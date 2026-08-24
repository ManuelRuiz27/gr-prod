import { RequestIdMiddleware, RequestWithId } from './request-id.middleware';
import { Response } from 'express';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
  });

  it('should generate a new request id if none provided', () => {
    const req = { headers: {} } as unknown as RequestWithId;
    const res = {
      setHeader: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it('should preserve incoming x-request-id header', () => {
    const req = {
      headers: { 'x-request-id': 'custom-req-id-123' },
    } as unknown as RequestWithId;
    const res = {
      setHeader: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toBe('custom-req-id-123');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', 'custom-req-id-123');
    expect(next).toHaveBeenCalled();
  });
});
