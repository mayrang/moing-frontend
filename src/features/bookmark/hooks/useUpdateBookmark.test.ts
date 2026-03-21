import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useUpdateBookmark } from './useUpdateBookmark';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: any }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useUpdateBookmark', () => {
  it('postBookmarkMutation과 deleteBookmarkMutation 함수를 반환한다', () => {
    const { result } = renderHook(() => useUpdateBookmark('test-token', 1, 1), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.postBookmarkMutation).toBe('function');
    expect(typeof result.current.deleteBookmarkMutation).toBe('function');
  });

  it('초기 isBookmarkPostSuccess는 false다', () => {
    const { result } = renderHook(() => useUpdateBookmark('test-token', 1, 1), {
      wrapper: createWrapper(),
    });
    expect(result.current.isBookmarkPostSuccess).toBe(false);
  });

  it('북마크 추가 성공 시 isBookmarkPostSuccess가 true가 된다', async () => {
    const { result } = renderHook(() => useUpdateBookmark('test-token', 1, 1), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.postBookmarkMutation();
    });

    await waitFor(() => expect(result.current.isBookmarkPostSuccess).toBe(true));
  });
});
