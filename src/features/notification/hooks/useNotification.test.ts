import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useNotification from './useNotification';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token' }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: any }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useNotification', () => {
  it('data, isLoading, fetchNextPage 등을 반환한다', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(typeof result.current.isLoading).toBe('boolean');
    expect(typeof result.current.fetchNextPage).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
    expect(typeof result.current.isFetching).toBe('boolean');
    expect(typeof result.current.hasNextPage).toBe('boolean');
  });

  it('accessToken이 있으면 쿼리가 활성화된다', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
