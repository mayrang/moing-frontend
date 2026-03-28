import type { MutationOptions } from '@tanstack/react-query';

/** API 에러 분류 */
export type ErrorClass = 'network' | 'business' | 'system';

/**
 * network / system 에러의 동작 정책.
 * business 에러는 컨텍스트마다 의미가 달라 항상 onBusinessError 콜백으로 위임.
 */
export type SystemBehavior = 'retry' | 'toast' | 'fallback' | 'ignore';

export interface ErrorPolicy {
  network: SystemBehavior;
  system: SystemBehavior;
}

export interface MutationPolicyOptions<TData, TError, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  policy: ErrorPolicy;
  /**
   * business 에러 처리는 caller가 결정.
   * - 폼 필드 인라인: setError('field', { message })
   * - Toast: showToast(message)
   */
  onBusinessError?: (error: TError, variables: TVariables) => void;
}

// onSuccess는 useMutation 호출부에서 직접 선언 (spread 이후 override 패턴으로 통일)
export type PolicyMutationOptions<TData, TError, TVariables> = Pick<
  MutationOptions<TData, TError, TVariables>,
  'mutationFn' | 'retry' | 'retryDelay' | 'onError'
>;
