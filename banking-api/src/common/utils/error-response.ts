import HttpStatusCode from '@/common/constants/http-status-code';
import type { ApiError, ApiErrorInput, InvalidErrorInput } from '@/common/types/error';
import { ERROR_CODES } from '../constants/error';

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

  const resolvedStatusCode = errorCodeStatusMap[statusCode]
    ? statusCode
    : HttpStatusCode.INTERNAL_SERVER_ERROR;

  const errorResponse: ApiError = {
    statusCode: resolvedStatusCode,
    message: message || errorInfo.defaultMessage,
    errors,
  };

  return errorResponse;
};

/**
 * Generate a list of standardized error objects for invalid request properties
 * @param param0 - An object containing the prefix for the field names and an array of properties with their respective error descriptions
 * @param param0.prefix - The prefix to use for the field names in the error objects (e.g., "body", "query", "params")
 * @param param0.properties - An array of objects representing the invalid properties, each with a property name and a description of the error
 * @returns - An array of error objects formatted according to the ApiError structure, with standardized error codes and messages for invalid requests
 */
export const getInvalidErrorList = ({ prefix, properties }: InvalidErrorInput) => {
  return properties.map(({ property, description }) => {
    return {
      errCode: ERROR_CODES.INVALID_REQUEST,
      field: `${prefix}.${property}`,
      message: description,
    };
  });
};
