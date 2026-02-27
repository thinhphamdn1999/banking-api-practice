import { createErrorResponse, getInvalidErrorList } from '@/common/utils/error-response';
import HttpStatusCode from '@/common/constants/http-status-code';
import { ERROR_CODES } from '@/common/constants/error';

describe('createErrorResponse', () => {
  it('should return default message when message is not provided', () => {
    const result = createErrorResponse({
      statusCode: HttpStatusCode.BAD_REQUEST,
    });

    expect(result).toEqual({
      statusCode: HttpStatusCode.BAD_REQUEST,
      message: 'Bad Request',
      errors: undefined,
    });
  });

  it('should use custom message when provided', () => {
    const result = createErrorResponse({
      statusCode: HttpStatusCode.BAD_REQUEST,
      message: 'Custom bad request message',
    });

    expect(result).toEqual({
      statusCode: HttpStatusCode.BAD_REQUEST,
      message: 'Custom bad request message',
      errors: undefined,
    });
  });

  it('should include errors array when provided', () => {
    const errors = [
      {
        errCode: 'INVALID_REQUEST',
        field: 'body.email',
        message: 'Email is required',
      },
    ];

    const result = createErrorResponse({
      statusCode: HttpStatusCode.BAD_REQUEST,
      errors,
    });

    expect(result).toEqual({
      statusCode: HttpStatusCode.BAD_REQUEST,
      message: 'Bad Request',
      errors,
    });
  });

  it('should fallback to INTERNAL_SERVER_ERROR if statusCode is not mapped', () => {
    const result = createErrorResponse({
      statusCode: 999,
    });

    expect(result).toEqual({
      statusCode: 500,
      message: 'Internal Server Error',
      errors: undefined,
    });
  });

  it('should return correct default messages for mapped status codes', () => {
    const testCases = [
      { status: HttpStatusCode.UNAUTHORIZED, message: 'Invalid Credentials' },
      { status: HttpStatusCode.NOT_FOUND, message: 'Resource Not Found' },
      { status: HttpStatusCode.TOO_MANY_REQUESTS, message: 'Too Many Request' },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR, message: 'Internal Server Error' },
    ];

    testCases.forEach(({ status, message }) => {
      const result = createErrorResponse({ statusCode: status });
      expect(result.message).toBe(message);
    });
  });
});

describe('getInvalidErrorList', () => {
  it('should generate standardized error objects', () => {
    const result = getInvalidErrorList({
      prefix: 'body',
      properties: [
        { property: 'email', description: 'Email is required' },
        { property: 'password', description: 'Password must be at least 8 characters' },
      ],
    });

    expect(result).toEqual([
      {
        errCode: ERROR_CODES.INVALID_REQUEST,
        field: 'body.email',
        message: 'Email is required',
      },
      {
        errCode: ERROR_CODES.INVALID_REQUEST,
        field: 'body.password',
        message: 'Password must be at least 8 characters',
      },
    ]);
  });

  it('should return empty array when properties is empty', () => {
    const result = getInvalidErrorList({
      prefix: 'query',
      properties: [],
    });

    expect(result).toEqual([]);
  });

  it('should correctly handle different prefixes', () => {
    const result = getInvalidErrorList({
      prefix: 'params',
      properties: [{ property: 'id', description: 'Id is invalid' }],
    });

    expect(result[0].field).toBe('params.id');
  });
});
