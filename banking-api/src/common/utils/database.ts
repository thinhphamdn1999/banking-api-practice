import { QueryFailedError } from 'typeorm';

import { POSTGRES_UNIQUE_VIOLATION_CODE } from '@/common/constants/database';

/**
 * Checks whether a database error was caused by a unique constraint violation, meaning the inserted row
 * collided with one that already exists. This lets a caller tell an expected duplicate apart from a genuine
 * failure, such as when a concurrent request has already inserted the same idempotency key and the losing
 * request should defer to the record the winner created rather than surface an error.
 * @param error - The value thrown by a repository or query operation. Typed as unknown so a caller can pass the binding from a catch block directly, without narrowing it first.
 * @returns - True when the error is a TypeORM QueryFailedError carrying the PostgreSQL unique violation SQLSTATE, and false for anything else, including database errors with a different SQLSTATE and errors that did not come from the database at all.
 */
export function isUniqueViolationError(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string })?.code === POSTGRES_UNIQUE_VIOLATION_CODE
  );
}
