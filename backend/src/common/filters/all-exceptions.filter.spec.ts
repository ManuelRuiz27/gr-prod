import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { RequestWithId } from '../middleware/request-id.middleware';

describe('AllExceptionsFilter — Canonical Error Contract', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  const createMockHost = (
    mockResponse: Partial<Response>,
    mockRequest: Partial<RequestWithId>,
  ): ArgumentsHost => {
    return {
      switchToHttp: () => ({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as RequestWithId,
        getNext: () => jest.fn(),
      }),
      getArgs: () => [],
      getArgByIndex: () => undefined,
      switchToRpc: () => ({ getData: () => undefined, getContext: () => undefined }),
      switchToWs: () => ({
        getData: () => undefined,
        getClient: () => undefined,
        getPattern: () => '',
      }),
      getType: () => 'http',
    } as unknown as ArgumentsHost;
  };

  it('formats HttpException into canonical ErrorEnvelope without root duplication', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockSetHeader = jest.fn();
    const mockResponse: Partial<Response> = {
      status: mockStatus,
      setHeader: mockSetHeader,
    };
    const mockRequest: Partial<RequestWithId> = {
      requestId: 'test-req-1234',
      headers: {},
    };

    const host = createMockHost(mockResponse, mockRequest);
    const exception = new HttpException('Bad request error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(mockSetHeader).toHaveBeenCalledWith('X-Request-Id', 'test-req-1234');
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Bad request error',
        details: {},
        request_id: 'test-req-1234',
      },
    });
  });

  it('maps class-validator validation array to VALIDATION_ERROR with safe details', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockSetHeader = jest.fn();
    const mockResponse: Partial<Response> = {
      status: mockStatus,
      setHeader: mockSetHeader,
    };
    const mockRequest: Partial<RequestWithId> = {
      requestId: 'req-validation-1',
      headers: {},
    };

    const host = createMockHost(mockResponse, mockRequest);
    const exception = new HttpException(
      {
        message: ['email must be an email', 'password must be longer than 8 characters'],
        error: 'Bad Request',
        statusCode: 400,
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación en la solicitud.',
        request_id: 'req-validation-1',
        details: {
          validation_errors: [
            'email must be an email',
            'password must be longer than 8 characters',
          ],
        },
      },
    });
  });

  it('sanitizes unhandled 500 error preventing stack and SQL leakage', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockSetHeader = jest.fn();
    const mockResponse: Partial<Response> = {
      status: mockStatus,
      setHeader: mockSetHeader,
    };
    const mockRequest: Partial<RequestWithId> = {
      requestId: 'req-crash-500',
      headers: {},
    };

    const host = createMockHost(mockResponse, mockRequest);
    const rawError = new Error('SELECT * FROM "accounts" WHERE password_hash = "secret" CRASHED at C:\\runtime\\db.ts');

    filter.catch(rawError, host);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ha ocurrido un error interno en el servidor.',
        request_id: 'req-crash-500',
        details: {},
      },
    });
    // Ensure raw error message and stack were not leaked
    const calls = mockJson.mock.calls as unknown[][];
    const sentPayload = calls[0]?.[0];
    const payloadStr = JSON.stringify(sentPayload);
    expect(payloadStr).not.toContain('SELECT');
    expect(payloadStr).not.toContain('password_hash');
    expect(payloadStr).not.toContain('C:\\runtime');
  });

  it('sanitizes Prisma P2002 error to 409 CONFLICT without leaking table name', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockSetHeader = jest.fn();
    const mockResponse: Partial<Response> = {
      status: mockStatus,
      setHeader: mockSetHeader,
    };
    const mockRequest: Partial<RequestWithId> = {
      requestId: 'req-prisma-p2002',
      headers: {},
    };

    const host = createMockHost(mockResponse, mockRequest);
    const prismaError = {
      name: 'PrismaClientKnownRequestError',
      code: 'P2002',
      clientVersion: '5.10.0',
      meta: { target: ['email_normalized'] },
      message: "Unique constraint failed on the fields: ('email_normalized')",
    };

    filter.catch(prismaError, host);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'CONFLICT',
        message: 'El recurso ya existe o entra en conflicto con un registro existente.',
        request_id: 'req-prisma-p2002',
        details: {},
      },
    });
  });
});
