import type { ErrorPolicy } from '@/shared/lib/errors';

/**
 * Auth 페이지 에러 정책.
 *
 * - network 'retry': 자동 3회 재시도(1/2/4s) → 소진 시 NetworkErrorToast + 다시 시도 버튼
 * - system  'toast': 서버 오류는 Fallback 대신 Toast로 처리
 *   (auth 폼에서 전체 화면 교체는 과도한 대응)
 *
 * business 에러는 항상 onBusinessError 콜백으로 위임:
 *   - 이메일 중복, 비밀번호 불일치 등 → 폼 인라인 에러 메시지
 *   - 소셜 로그인 실패 등 → Toast
 */
export const AUTH_ERROR_POLICY: ErrorPolicy = {
  network: 'retry',
  system: 'toast',
};
