import type { AxiosError } from 'axios';

import type { ApiErrorResponse } from '@/types/api';

/**
 * Extracts a human-readable message from an Axios error.
 * Falls back to the provided fallback string if no API message is found.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message ?? fallback;
};
