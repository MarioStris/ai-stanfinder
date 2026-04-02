import type { Context } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly statusCode: StatusCode,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: err.flatten().fieldErrors,
        },
        meta: null,
      },
      400,
    );
  }

  if (err instanceof AppError) {
    return c.json(
      { data: null, error: { code: err.code, message: err.message }, meta: null },
      err.statusCode,
    );
  }

  console.error('[UnhandledError]', err);

  return c.json(
    {
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      meta: null,
    },
    500,
  );
};
