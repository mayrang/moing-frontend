export interface ILogger {
  error(message: string, error?: unknown, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  breadcrumb(message: string, data?: Record<string, unknown>): void;
  /** 로그인/로그아웃 시 호출. null이면 유저 컨텍스트 초기화 */
  setUser(user: { id: number | string; email?: string } | null): void;
}
