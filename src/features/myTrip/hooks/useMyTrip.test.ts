import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useMyTrip } from './useMyTrip';
import { useMyApplyTrip } from './useMyApplyTrip';
import { useRequestedTrip } from './useMyRequestedTrip';

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

describe('useMyTrip', () => {
  it('내가 만든 여행 목록을 가져온다', async () => {
    const { result } = renderHook(() => useMyTrip(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.pages[0].content[0].title).toBe('내가 만든 여행');
  });

  it('초기 상태에서 isLoading이 true다', () => {
    const { result } = renderHook(() => useMyTrip(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });
});

describe('useMyApplyTrip', () => {
  it('참가한 여행 목록을 가져온다', async () => {
    const { result } = renderHook(() => useMyApplyTrip(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.pages[0].content[0].title).toBe('참가한 여행');
  });

  it('deleteMyApplyTripsMutation 함수를 반환한다', () => {
    const { result } = renderHook(() => useMyApplyTrip(), {
      wrapper: createWrapper(),
    });
    expect(typeof result.current.deleteMyApplyTripsMutation).toBe('function');
  });
});

describe('useRequestedTrip', () => {
  it('신청한 여행 목록을 가져온다', async () => {
    const { result } = renderHook(() => useRequestedTrip(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.pages[0].content[0].title).toBe('신청한 여행');
  });

  it('deleteMyRequestedTripsMutation 함수를 반환한다', () => {
    const { result } = renderHook(() => useRequestedTrip(), {
      wrapper: createWrapper(),
    });
    expect(typeof result.current.deleteMyRequestedTripsMutation).toBe('function');
  });
});
