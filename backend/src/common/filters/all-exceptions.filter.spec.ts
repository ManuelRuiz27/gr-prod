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

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
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
