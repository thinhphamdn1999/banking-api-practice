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
