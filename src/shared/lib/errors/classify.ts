import { isAxiosError } from 'axios';
import type { ErrorClass } from './types';

/**
 * HTTP 상태코드를 ErrorClass로 변환하는 헬퍼.
 */
function classifyByStatus(status: number | undefined): ErrorClass {
  if (!status) return 'network';
  if (status >= 400 && status < 500) return 'business';
  if (status >= 500) return 'system';
  return 'system';
}

/**
 * unknown 에러를 ErrorClass로 분류.
 *
 * - network : 응답 없음 (오프라인, timeout, ECONNREFUSED)
 * - business: 4xx 응답 (이메일 중복, 인증 실패 등 서비스 로직 에러)
 * - system  : 5xx 응답, 알 수 없는 에러
 *
 * RequestError (레거시 API 함수의 래퍼 클래스)도 status 필드를 통해 분류.
 */
export function classifyError(error: unknown): ErrorClass {
  if (isAxiosError(error)) {
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ECONNREFUSED'
    ) {
      return 'network';
    }
    return classifyByStatus(error.response.status);
  }
  // RequestError: 레거시 API 함수가 AxiosError를 래핑해 throw하는 커스텀 에러
  if (error instanceof Error && 'status' in error) {
    return classifyByStatus((error as any).status);
  }
  return 'system';
}

/** 에러 응답 메시지 추출 */
export function extractErrorMessage(error: unknown, fallback = '오류가 발생했습니다.'): string {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.error?.reason ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      fallback
    );
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
