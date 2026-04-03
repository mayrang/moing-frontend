export interface ILogger {
  error(message: string, error?: unknown, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  breadcrumb(message: string, data?: Record<string, unknown>): void;
}
