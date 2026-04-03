import type { ILogger } from '../types';

export class ConsoleLogger implements ILogger {
  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, error ?? '', context ?? '');
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context ?? '');
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(`[INFO] ${message}`, context ?? '');
  }

  breadcrumb(message: string, data?: Record<string, unknown>): void {
    console.debug(`[BREADCRUMB] ${message}`, data ?? '');
  }

  setUser(user: { id: number | string; email?: string } | null): void {
    if (user) {
      console.info(`[USER] id=${user.id}${user.email ? ` email=${user.email}` : ''}`);
    } else {
      console.info('[USER] cleared');
    }
  }
}
