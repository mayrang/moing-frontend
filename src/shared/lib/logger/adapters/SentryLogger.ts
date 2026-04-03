import type { ILogger } from '../types';

/**
 * Sentry 어댑터.
 * - 클라이언트 전용 (typeof window 체크로 SSR 보호)
 * - 생성 시 Sentry.init 호출 (DSN 없으면 no-op)
 */
export class SentryLogger implements ILogger {
  private initialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return;

    import('@sentry/react').then((Sentry) => {
      if (this.initialized) return;
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        // 민감 정보 필터
        beforeSend(event) {
          const url = event.request?.url ?? '';
          if (url.includes('/api/login') || url.includes('/api/token')) return null;
          return event;
        },
      });
      this.initialized = true;
    });
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    import('@sentry/react').then((Sentry) => {
      Sentry.withScope((scope) => {
        scope.setLevel('error');
        if (context) scope.setExtras(context);
        scope.setExtra('message', message);
        if (error instanceof Error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(message, 'error');
        }
      });
    });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    import('@sentry/react').then((Sentry) => {
      Sentry.withScope((scope) => {
        scope.setLevel('warning');
        if (context) scope.setExtras(context);
        Sentry.captureMessage(message, 'warning');
      });
    });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.breadcrumb(message, context);
  }

  breadcrumb(message: string, data?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    import('@sentry/react').then((Sentry) => {
      Sentry.addBreadcrumb({
        message,
        data,
        level: 'info',
        timestamp: Date.now() / 1000,
      });
    });
  }
}
