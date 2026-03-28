import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { classifyError, extractErrorMessage } from '../classify';

// ── 헬퍼 ────────────────────────────────────────────────────────────────────

function makeNetworkError(code = 'ERR_NETWORK'): AxiosError {
  const err = new AxiosError('Network Error', code);
  // response 없음 = 응답 자체가 오지 않은 상황
  err.response = undefined;
  return err;
}

function makeHttpError(status: number, reason?: string): AxiosError {
  const err = new AxiosError('Request failed', 'ERR_BAD_RESPONSE');
  err.response = {
    status,
    data: reason ? { error: { reason } } : {},
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    statusText: String(status),
  };
  return err;
}

// ── classifyError ─────────────────────────────────────────────────────────

describe('classifyError', () => {
  describe('network 에러', () => {
    it('ERR_NETWORK → network', () => {
      expect(classifyError(makeNetworkError('ERR_NETWORK'))).toBe('network');
    });

    it('ECONNABORTED (타임아웃) → network', () => {
      expect(classifyError(makeNetworkError('ECONNABORTED'))).toBe('network');
    });

    it('ECONNREFUSED (서버 거부) → network', () => {
      expect(classifyError(makeNetworkError('ECONNREFUSED'))).toBe('network');
    });

    it('response 없는 AxiosError → network', () => {
      const err = new AxiosError('Network Error');
      err.response = undefined;
      expect(classifyError(err)).toBe('network');
    });
  });

  describe('business 에러 (4xx)', () => {
    it('400 Bad Request → business', () => {
      expect(classifyError(makeHttpError(400))).toBe('business');
    });

    it('401 Unauthorized → business', () => {
      expect(classifyError(makeHttpError(401))).toBe('business');
    });

    it('409 Conflict → business', () => {
      expect(classifyError(makeHttpError(409))).toBe('business');
    });

    it('499 → business (4xx 경계)', () => {
      expect(classifyError(makeHttpError(499))).toBe('business');
    });
  });

  describe('system 에러 (5xx)', () => {
    it('500 Internal Server Error → system', () => {
      expect(classifyError(makeHttpError(500))).toBe('system');
    });

    it('503 Service Unavailable → system', () => {
      expect(classifyError(makeHttpError(503))).toBe('system');
    });
  });

  describe('non-axios 에러', () => {
    it('일반 Error → system', () => {
      expect(classifyError(new Error('unexpected'))).toBe('system');
    });

    it('문자열 → system', () => {
      expect(classifyError('string error')).toBe('system');
    });

    it('null → system', () => {
      expect(classifyError(null)).toBe('system');
    });
  });
});

// ── extractErrorMessage ───────────────────────────────────────────────────

describe('extractErrorMessage', () => {
  it('error.reason 필드 추출', () => {
    const err = makeHttpError(400, '이미 사용 중인 이메일입니다.');
    expect(extractErrorMessage(err)).toBe('이미 사용 중인 이메일입니다.');
  });

  it('response 없는 경우 fallback 반환', () => {
    const err = makeNetworkError();
    expect(extractErrorMessage(err, '네트워크 오류')).toBe('네트워크 오류');
  });

  it('일반 Error → message 반환', () => {
    expect(extractErrorMessage(new Error('예상치 못한 오류'))).toBe('예상치 못한 오류');
  });

  it('fallback 기본값', () => {
    expect(extractErrorMessage(null)).toBe('오류가 발생했습니다.');
  });
});
