/**
 * Application error taxonomy and a discriminated `Result` type used by the
 * service layer so callers handle failure explicitly instead of via throws.
 */

export type AppErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "conflict"
  | "rate_limited"
  | "internal";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly cause?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = options?.status ?? DEFAULT_STATUS[code];
    this.cause = options?.cause;
  }
}

const DEFAULT_STATUS: Record<AppErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  validation: 422,
  conflict: 409,
  rate_limited: 429,
  internal: 500,
};

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<T = never>(
  code: AppErrorCode,
  message: string,
  options?: { status?: number; cause?: unknown },
): Result<T> {
  return { ok: false, error: new AppError(code, message, options) };
}
