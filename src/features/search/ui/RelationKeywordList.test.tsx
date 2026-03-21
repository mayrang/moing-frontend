import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import RelationKeywordList from './RelationKeywordList';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token', isGuestUser: false }),
}));

vi.mock('@/components/icons/RelationSearchIcon', () => ({
  default: () => null,
}));

vi.mock('@/utils/search', () => ({
  splitByKeyword: (keyword: string, data: string) => [{ str: data, match: false }],
}));

vi.mock('@/styles/palette', () => ({
  palette: { keycolor: '#000', 기본: '#333' },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('RelationKeywordList', () => {
  it('키워드에 해당하는 자동완성 결과를 렌더링한다', async () => {
    render(
      <RelationKeywordList keyword="서울" onClick={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('서울서울')).toBeInTheDocument();
    });
  });

  it('빈 키워드이면 키워드 목록을 렌더링하지 않는다', () => {
    render(
      <RelationKeywordList keyword="" onClick={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    // 빈 키워드일 때 data가 undefined → suggestions 없음
    expect(screen.queryByRole('button')).toBeNull();
  });
});
