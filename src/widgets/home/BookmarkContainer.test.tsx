import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import BookmarkContainer from './BookmarkContainer';

// useBookmark mock
vi.mock('@/hooks/bookmark/useBookmark', () => ({
  useBookmark: vi.fn(() => ({ data: undefined })),
}));

// useBackPathStore mock
vi.mock('@/store/client/backPathStore', () => ({
  useBackPathStore: vi.fn(() => ({ setTravelDetail: vi.fn() })),
}));

// next/navigation mock
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

// utils mock
vi.mock('@/utils/user', () => ({
  isGuestUser: vi.fn(() => false),
}));

// ContentTitleContainer mock
vi.mock('@/widgets/home/ContentTitleContainer', () => ({
  default: ({ text }: { text: React.ReactNode }) => <div data-testid="title">{text}</div>,
}));

describe('BookmarkContainer', () => {
  it('북마크 데이터 없을 때 렌더링되어야 한다', () => {
    render(<BookmarkContainer />);
    expect(screen.getByTestId('title')).toBeInTheDocument();
  });

  it('즐겨찾기 타이틀이 표시되어야 한다', () => {
    render(<BookmarkContainer />);
    expect(screen.getByText('즐겨찾기')).toBeInTheDocument();
  });
});
