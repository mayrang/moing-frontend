import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useSearch from './useSearch';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token', isGuestUser: false }),
}));

vi.mock('@/store/client/searchStore', () => ({
  searchStore: () => ({
    style: [],
    place: [],
    gender: [],
    people: [],
    period: [],
    sort: '추천순',
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: any }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSearch', () => {
  it('keyword가 빈 문자열이면 data를 undefined로 반환한다', async () => {
    const { result } = renderHook(() => useSearch({ keyword: '' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();
  });

  it('keyword가 있으면 검색 결과를 반환한다', async () => {
    const { result } = renderHook(() => useSearch({ keyword: '유럽' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.pages[0].content[0].title).toBe('유럽 여행');
  });

  it('isGuestUser인 경우에도 쿼리가 활성화된다', async () => {
    vi.mock('@/store/client/authStore', () => ({
      authStore: () => ({ accessToken: null, isGuestUser: true }),
    }));

    const { result } = renderHook(() => useSearch({ keyword: '제주' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
  });
});
