import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useComment from './useComment';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token', userId: '1', isGuestUser: false }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: any }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useComment', () => {
  it('travel 타입 댓글 목록을 가져온다', async () => {
    const { result } = renderHook(() => useComment('travel', 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.commentList.isLoading).toBe(false));
    expect(result.current.commentList.data).toBeDefined();
  });

  it('community 타입 댓글 목록을 가져온다', async () => {
    const { result } = renderHook(() => useComment('community', 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.commentList.isLoading).toBe(false));
    expect(result.current.commentList.data).toBeDefined();
  });

  it('post, update, remove, like, unlike 함수를 반환한다', () => {
    const { result } = renderHook(() => useComment('travel', 1), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.post).toBe('function');
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.remove).toBe('function');
    expect(typeof result.current.like).toBe('function');
    expect(typeof result.current.unlike).toBe('function');
  });
});
