import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import TripInfiniteList from './TripInfiniteList';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token', userId: '1', isGuestUser: false }),
}));

vi.mock('@/store/client/backPathStore', () => ({
  useBackPathStore: () => ({ setTravelDetail: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => 'recent' }),
  usePathname: () => '/trip/list',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => [vi.fn(), false],
}));

vi.mock('@/hooks/bookmark/useUpdateBookmark', () => ({
  useUpdateBookmark: () => ({
    postBookmarkMutation: vi.fn(),
    deleteBookmarkMutation: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/useViewTransition', () => ({
  default: () => vi.fn(),
}));

vi.mock('@/shared/hooks/useInfiniteScroll', () => ({
  default: (cb: () => void) => cb(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('TripInfiniteList', () => {
  it('여행 목록이 로드되면 타이틀이 표시된다', async () => {
    render(<TripInfiniteList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('유럽 배낭여행')).toBeInTheDocument();
    });
  });

  it('로딩 중에는 목록 아이템이 없다', () => {
    render(<TripInfiniteList />, { wrapper: createWrapper() });
    expect(screen.queryByText('유럽 배낭여행')).not.toBeInTheDocument();
  });
});
