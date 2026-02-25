import HttpStatusCode from '@/common/constants/http-status-code';
import type { ApiError, ApiErrorInput, InvalidErrorInput } from '@/common/types/error';
import { ERROR_CODES } from '../constants/errors';

/**
 * Map an HTTP status to a standardized error response object
 * @param statusCode - The HTTP status code
 * @param message - Optional custom error message (will use default if not provided)
 * @param errors - Optional array of detailed error objects
 * @returns - Standardized API error response
 */
export const createErrorResponse = ({ statusCode, message, errors }: ApiErrorInput): ApiError => {
  const errorCodeStatusMap: Record<number, { defaultMessage: string }> = {
    // Client Errors (4xx)
    [HttpStatusCode.UNAUTHORIZED]: {
      defaultMessage: 'Invalid Credentials',
    },
    [HttpStatusCode.BAD_REQUEST]: {
      defaultMessage: 'Bad Request',
    },
    [HttpStatusCode.NOT_FOUND]: {
      defaultMessage: 'Resource Not Found',
    },
    [HttpStatusCode.TOO_MANY_REQUESTS]: {
      defaultMessage: 'Too Many Request',
    },

    // Server Errors (5xx)
    [HttpStatusCode.INTERNAL_SERVER_ERROR]: {
      defaultMessage: 'Internal Server Error',
    },
  };

  const errorInfo =
    errorCodeStatusMap[statusCode] || errorCodeStatusMap[HttpStatusCode.INTERNAL_SERVER_ERROR];

  const errorResponse: ApiError = {
    statusCode,
    message: message || errorInfo.defaultMessage,
    errors,
  };

  return errorResponse;
};

export const getInvalidErrorList = ({ prefix, properties }: InvalidErrorInput) => {
  return properties.map(({ property, description }) => {
    return {
      errCode: ERROR_CODES.INVALID_REQUEST,
      field: `${prefix}.${property}`,
      message: description,
    };
  });
};
