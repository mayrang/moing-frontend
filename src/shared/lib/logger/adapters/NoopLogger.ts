import type { ILogger } from '../types';

export class NoopLogger implements ILogger {
  error(): void {}
  warn(): void {}
  info(): void {}
  breadcrumb(): void {}
}
