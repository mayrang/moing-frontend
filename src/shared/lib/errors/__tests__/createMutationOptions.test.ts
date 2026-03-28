import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { createMutationOptions } from '../createMutationOptions';
import type { ErrorPolicy } from '../types';

// ── errorToastStore mock ──────────────────────────────────────────────────
const mockShow = vi.hoisted(() => vi.fn());

vi.mock('@/shared/lib/errors/errorToastStore', () => ({
  errorToastStore: {
    getState: () => ({ show: mockShow, dismiss: vi.fn() }),
  },
}));

// ── 헬퍼 ────────────────────────────────────────────────────────────────────

function makeNetworkError(code = 'ERR_NETWORK'): AxiosError {
  const err = new AxiosError('Network Error', code);
  err.response = undefined;
  return err;
}

function makeHttpError(status: number): AxiosError {
  const err = new AxiosError('Request failed', 'ERR_BAD_RESPONSE');
  err.response = {
    status,
    data: { error: { reason: '에러' } },
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    statusText: String(status),
  };
  return err;
}

const AUTH_POLICY: ErrorPolicy = { network: 'retry', system: 'toast' };
const SILENT_POLICY: ErrorPolicy = { network: 'ignore', system: 'ignore' };

// ── retry 함수 ────────────────────────────────────────────────────────────

describe('createMutationOptions: retry', () => {
  it('network + retry 정책: failureCount 0~2 → true', () => {
    const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
    const networkErr = makeNetworkError();
    expect((opts.retry as Function)(0, networkErr)).toBe(true);
    expect((opts.retry as Function)(1, networkErr)).toBe(true);
    expect((opts.retry as Function)(2, networkErr)).toBe(true);
  });

  it('network + retry 정책: failureCount 3 → false (재시도 소진)', () => {
    const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
    expect((opts.retry as Function)(3, makeNetworkError())).toBe(false);
  });

  it('network + ignore 정책 → 재시도 없음', () => {
    const opts = createMutationOptions({ mutationFn: vi.fn(), policy: SILENT_POLICY });
    expect((opts.retry as Function)(0, makeNetworkError())).toBe(false);
  });

  it('business 에러 (400) → 재시도 없음', () => {
    const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
    expect((opts.retry as Function)(0, makeHttpError(400))).toBe(false);
  });

  it('system 에러 (500) → 재시도 없음', () => {
    const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
    expect((opts.retry as Function)(0, makeHttpError(500))).toBe(false);
  });
});

// ── retryDelay ────────────────────────────────────────────────────────────

describe('createMutationOptions: retryDelay', () => {
  it('attemptIndex 0 → 1000ms', () => {
    const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
    expect((opts.retryDelay as Function)(0)).toBe(1000);
  });

  it('attemptIndex 1 → 2000ms', () => {
    const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
    expect((opts.retryDelay as Function)(1)).toBe(2000);
  });

  it('attemptIndex 2 → 4000ms', () => {
    const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
    expect((opts.retryDelay as Function)(2)).toBe(4000);
  });

  it('attemptIndex 초과 → 4000ms (마지막 값 고정)', () => {
    const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
    expect((opts.retryDelay as Function)(10)).toBe(4000);
  });
});

// ── onError ───────────────────────────────────────────────────────────────

describe('createMutationOptions: onError', () => {
  beforeEach(() => {
    mockShow.mockClear();
  });

  describe('business 에러 (4xx)', () => {
    it('onBusinessError 콜백 호출', () => {
      const onBusinessError = vi.fn();
      const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY, onBusinessError });
      (opts.onError as Function)(makeHttpError(400), undefined);
      expect(onBusinessError).toHaveBeenCalledOnce();
    });

    it('errorToastStore.show 호출 안 함', () => {
      const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
      (opts.onError as Function)(makeHttpError(401), undefined);
      expect(mockShow).not.toHaveBeenCalled();
    });

    it('onBusinessError 없으면 조용히 무시', () => {
      const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
      expect(() => (opts.onError as Function)(makeHttpError(409), undefined)).not.toThrow();
    });
  });

  describe('network 에러 + retry 정책 (재시도 소진 후 onError 호출)', () => {
    it('toast 표시 (NETWORK_ERROR_MESSAGE)', () => {
      const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
      (opts.onError as Function)(makeNetworkError(), undefined);
      expect(mockShow).toHaveBeenCalledOnce();
      expect(mockShow.mock.calls[0][0]).toContain('네트워크');
    });
  });

  describe('network 에러 + toast 정책', () => {
    it('즉시 toast 표시', () => {
      const policy: ErrorPolicy = { network: 'toast', system: 'toast' };
      const opts = createMutationOptions({ mutationFn: vi.fn(), policy });
      (opts.onError as Function)(makeNetworkError(), undefined);
      expect(mockShow).toHaveBeenCalledOnce();
    });
  });

  describe('network 에러 + ignore 정책', () => {
    it('toast 호출 안 함', () => {
      const opts = createMutationOptions({ mutationFn: vi.fn(), policy: SILENT_POLICY });
      (opts.onError as Function)(makeNetworkError(), undefined);
      expect(mockShow).not.toHaveBeenCalled();
    });
  });

  describe('system 에러 (5xx) + toast 정책', () => {
    it('toast 표시 (SYSTEM_ERROR_MESSAGE)', () => {
      const opts = createMutationOptions({ mutationFn: vi.fn(), policy: AUTH_POLICY });
      (opts.onError as Function)(makeHttpError(500), undefined);
      expect(mockShow).toHaveBeenCalledOnce();
      expect(mockShow.mock.calls[0][0]).toContain('서버');
    });
  });

  describe('system 에러 + ignore 정책', () => {
    it('toast 호출 안 함', () => {
      const opts = createMutationOptions({ mutationFn: vi.fn(), policy: SILENT_POLICY });
      (opts.onError as Function)(makeHttpError(500), undefined);
      expect(mockShow).not.toHaveBeenCalled();
    });
  });

  describe('system 에러 + fallback 정책', () => {
    it('에러를 다시 throw', () => {
      const policy: ErrorPolicy = { network: 'retry', system: 'fallback' };
      const opts = createMutationOptions({ mutationFn: vi.fn(), policy });
      const err = makeHttpError(503);
      expect(() => (opts.onError as Function)(err, undefined)).toThrow();
    });
  });
});
