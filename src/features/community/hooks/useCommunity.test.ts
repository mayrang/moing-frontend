import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useCommunity from './useCommunity';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token', isGuestUser: false }),
}));

vi.mock('@/store/client/imageStore', () => ({
  EditFinalImages: {},
  FinalImages: {},
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCommunity', () => {
  it('post, update, remove, like, unlike 함수를 반환한다', () => {
    const { result } = renderHook(() => useCommunity(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.post).toBe('function');
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.remove).toBe('function');
    expect(typeof result.current.like).toBe('function');
    expect(typeof result.current.unlike).toBe('function');
  });

  it('communityList 쿼리를 반환한다', () => {
    const { result } = renderHook(() => useCommunity(), {
      wrapper: createWrapper(),
    });

    expect(result.current.communityList).toBeDefined();
  });

  it('communityNumber가 있으면 단건 커뮤니티를 조회한다', async () => {
    const { result } = renderHook(() => useCommunity(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.community).toBeDefined();
  });
});
