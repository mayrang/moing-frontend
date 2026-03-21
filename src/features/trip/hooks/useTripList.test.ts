import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useTripList } from './useTripList';

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

describe('useTripList', () => {
  it('sort=recent이면 최근 여행 목록을 가져온다', async () => {
    const { result } = renderHook(() => useTripList('recent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.pages[0].content[0].title).toBe('유럽 배낭여행');
  });

  it('sort=recommend이면 추천 여행 목록을 가져온다', async () => {
    const { result } = renderHook(() => useTripList('recommend'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.pages[0].content).toHaveLength(1);
  });

  it('초기 상태에서는 isLoading이 true다', () => {
    const { result } = renderHook(() => useTripList('recent'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
