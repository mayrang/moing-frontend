import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useBookmark } from './useBookmark';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token' }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useBookmark', () => {
  it('초기 상태에서 isLoading이 true다', () => {
    const { result } = renderHook(() => useBookmark(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('북마크 목록을 가져온다', async () => {
    const { result } = renderHook(() => useBookmark(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.pages[0].content[0].title).toBe('유럽 배낭여행');
  });

  it('accessToken이 없으면 쿼리가 비활성화된다', () => {
    vi.doMock('@/store/client/authStore', () => ({
      authStore: () => ({ accessToken: null }),
    }));

    const { result } = renderHook(() => useBookmark(), {
      wrapper: createWrapper(),
    });
    // enabled=false이므로 isLoading=false, data=undefined
    expect(result.current.data).toBeUndefined();
  });
});
