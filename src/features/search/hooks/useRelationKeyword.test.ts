import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useRelationKeyword from './useRelationKeyword';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token', isGuestUser: false }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useRelationKeyword', () => {
  it('빈 키워드이면 API를 호출하지 않고 data가 undefined다', () => {
    const { result } = renderHook(() => useRelationKeyword(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('키워드 입력 시 자동완성 결과를 반환한다', async () => {
    const { result } = renderHook(() => useRelationKeyword('서울'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.suggestions).toBeDefined();
    expect(result.current.data?.suggestions.length).toBeGreaterThan(0);
  });
});
