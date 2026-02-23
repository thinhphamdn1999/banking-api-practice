export interface Error {
  errCode: string;
  field?: string;
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Error[];
}

export interface ApiErrorInput {
  statusCode: number;
  message?: string;
  errors?: Error[];
}

export interface FieldError {
  property: string;
  description: string;
}

export interface InvalidErrorInput {
  prefix: string;
  properties: FieldError[];
}

export class BaseError extends Error {
  message: string;

  constructor({ message }: { message: string }) {
    super();
    this.message = message;
  }
}
