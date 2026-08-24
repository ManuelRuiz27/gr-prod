import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { RequestWithId } from '../middleware/request-id.middleware';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('should format HttpException properly with error envelope', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockResponse = { status: mockStatus } as unknown as Response;
    const mockRequest = {
      requestId: 'test-req-id',
      headers: {},
    } as unknown as RequestWithId;

    const mockHost: ArgumentsHost = {
      switchToHttp: () => ({
        getResponse: <T>() => mockResponse as unknown as T,
        getRequest: <T>() => mockRequest as unknown as T,
        getNext: <T>() => jest.fn() as unknown as T,
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
    };

    const exception = new HttpException('Bad request error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      request_id: 'test-req-id',
      error: {
        code: 'BAD_REQUEST',
        message: 'Bad request error',
        details: {},
        request_id: 'test-req-id',
      },
    });
  });
});
