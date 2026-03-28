import { classifyError, extractErrorMessage } from './classify';
import { errorToastStore } from './errorToastStore';
import type { MutationPolicyOptions, PolicyMutationOptions } from './types';

const RETRY_DELAYS = [1000, 2000, 4000]; // 1s → 2s → 4s

const SYSTEM_ERROR_MESSAGE = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인해주세요.';

/**
 * ErrorPolicy 기반 useMutation options 팩토리.
 *
 * - network 'retry' : React Query auto-retry 3회 (1s/2s/4s), 소진 후 RetryToast 표시
 * - network 'toast' : 즉시 WarningToast
 * - system  'toast' : WarningToast (Fallback 차단)
 * - system  'fallback': errorToastStore 미호출 → caller가 전역 에러 처리
 * - business: 항상 onBusinessError 콜백으로 위임
 */
export function createMutationOptions<TData, TError = unknown, TVariables = void>({
  mutationFn,
  policy,
  onBusinessError,
}: MutationPolicyOptions<TData, TError, TVariables>): PolicyMutationOptions<TData, TError, TVariables> {
  return {
    mutationFn,

    retry: (failureCount, error) => {
      if (classifyError(error) === 'network' && policy.network === 'retry') {
        return failureCount < 3;
      }
      return false;
    },

    retryDelay: (attemptIndex) =>
      RETRY_DELAYS[Math.min(attemptIndex, RETRY_DELAYS.length - 1)],

    onError: (error, variables) => {
      const errorClass = classifyError(error);

      // business 에러 → 항상 콜백 위임 (폼 인라인 or Toast 등 caller가 결정)
      if (errorClass === 'business') {
        onBusinessError?.(error as TError, variables);
        return;
      }

      const behavior = errorClass === 'network' ? policy.network : policy.system;

      if (behavior === 'retry') {
        // auto-retry가 소진된 이후 onError 호출 → RetryToast 표시
        // onRetry 콜백은 현재 mutation을 재실행해야 하므로
        // caller가 useMutation 결과를 직접 보유 → retryFn은 외부에서 주입
        // 여기서는 re-call 없이 메시지만 표시, retryFn은 caller가 추가 가능
        errorToastStore.getState().show(NETWORK_ERROR_MESSAGE);
        return;
      }

      if (behavior === 'toast') {
        const message =
          errorClass === 'network' ? NETWORK_ERROR_MESSAGE : SYSTEM_ERROR_MESSAGE;
        errorToastStore.getState().show(message);
        return;
      }

      // 'fallback': caller가 처리하도록 throw
      if (behavior === 'fallback') {
        throw error;
      }

      // 'ignore': no-op
    },
  };
}
