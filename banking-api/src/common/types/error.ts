/** A single error detail returned in an API error response. */
export interface Error {
  errCode: string;
  field?: string;
  message: string;
}

/** The shape of an API error response body sent to the client. */
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Error[];
}

/** Input for constructing an ApiError response. */
export interface ApiErrorInput {
  statusCode: number;
  message?: string;
  errors?: Error[];
}

/** A validation error tied to a specific request field. */
export interface FieldError {
  property: string;
  description: string;
}

/** Input for building a list of field-level validation errors with a shared prefix. */
export interface InvalidErrorInput {
  prefix: string;
  properties: FieldError[];
}

/** Base class for domain errors thrown inside services and caught by controllers. */
export class BaseError extends Error {
  message: string;

  constructor({ message }: { message: string }) {
    super();
    this.message = message;
  }
}
