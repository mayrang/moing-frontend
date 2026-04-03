import type { ILogger } from '../types';

/**
 * Sentry 어댑터.
 * - 클라이언트 전용 (typeof window 체크로 SSR 보호)
 * - 에러 재현에 필요한 컨텍스트 자동 수집:
 *   - Axios 에러: URL, method, HTTP status
 *   - 유저: id, email (setUser로 주입)
 *   - 환경: 네트워크 타입, 화면 해상도 (Sentry SDK 미수집 항목 보완)
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
        beforeSend(event) {
          // 로그인/토큰 엔드포인트는 민감 정보 포함 가능 → 전송 차단
          const url = event.request?.url ?? '';
          if (url.includes('/api/login') || url.includes('/api/token')) return null;
          return event;
        },
      });
      this.initialized = true;
    });
  }

  /**
   * AxiosError에서 재현에 필요한 HTTP 컨텍스트 추출.
   * Axios 에러는 `config`, `response`, `code` 필드를 가짐.
   */
  private extractRequestContext(error: unknown): Record<string, unknown> {
    if (!error || typeof error !== 'object') return {};
    const e = error as Record<string, any>;
    if (!e.config) return {};

    return {
      url: e.config?.url,
      method: e.config?.method?.toUpperCase(),
      httpStatus: e.response?.status,
      httpStatusText: e.response?.statusText,
      errorCode: e.code, // 'ERR_NETWORK', 'ECONNABORTED' 등
    };
  }

  /**
   * Sentry SDK가 자동 수집하지 않는 환경 정보 추가.
   * - 네트워크 타입 (3G/4G/WiFi): 모바일 환경 재현에 중요
   * - 화면 해상도: 레이아웃 이슈 재현에 중요
   * - 하드웨어 코어 수: 성능 이슈 연관성 파악
   */
  private collectEnvironment(): Record<string, unknown> {
    if (typeof window === 'undefined') return {};
    const conn = (navigator as any).connection;
    return {
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      devicePixelRatio: window.devicePixelRatio,
      networkType: conn?.effectiveType ?? 'unknown',   // '4g' | '3g' | '2g' | 'slow-2g'
      networkDownlink: conn?.downlink,                 // Mbps
      hardwareConcurrency: navigator.hardwareConcurrency,
      onLine: navigator.onLine,
    };
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    import('@sentry/react').then((Sentry) => {
      Sentry.withScope((scope) => {
        scope.setLevel('error');

        // 1. 호출부에서 전달한 컨텍스트 (errorClass, featureName 등)
        if (context) scope.setExtras(context);

        // 2. Axios 에러 HTTP 컨텍스트 (URL, method, status)
        const requestCtx = this.extractRequestContext(error);
        if (Object.keys(requestCtx).length > 0) {
          scope.setExtras(requestCtx);
          // status와 URL은 태그로도 등록 → Sentry 필터/검색에 활용
          if (requestCtx.httpStatus) scope.setTag('http.status', String(requestCtx.httpStatus));
          if (requestCtx.url) scope.setTag('api.url', String(requestCtx.url));
          if (requestCtx.method) scope.setTag('http.method', String(requestCtx.method));
        }

        // 3. 기기/브라우저 환경 (Sentry 미수집 항목)
        scope.setContext('environment', this.collectEnvironment());

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

  setUser(user: { id: number | string; email?: string } | null): void {
    if (typeof window === 'undefined') return;
    import('@sentry/react').then((Sentry) => {
      if (user) {
        Sentry.setUser({ id: String(user.id), email: user.email });
      } else {
        Sentry.setUser(null);
      }
    });
  }
}
