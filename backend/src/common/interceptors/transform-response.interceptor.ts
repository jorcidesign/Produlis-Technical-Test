import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function toSnakeCase(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function isDecimalLike(value: unknown): value is { toNumber: () => number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { toNumber?: unknown }).toNumber === 'function'
  );
}

function transformValue(value: unknown): unknown {
  if (isDecimalLike(value)) {
    return value.toNumber();
  }
  if (value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => transformValue(item));
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[toSnakeCase(key)] = transformValue(val);
    }
    return result;
  }
  return value;
}

/**
 * Normalizes every JSON response to the shape the frontend expects:
 * camelCase keys -> snake_case, and Prisma.Decimal values -> number.
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => transformValue(data)));
  }
}
