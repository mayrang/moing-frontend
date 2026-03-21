import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import TripAvailable from './TripAvailable';

// useTripList mock
vi.mock('@/hooks/useTripList', () => ({
  useTripList: vi.fn(() => ({ data: undefined })),
}));

// useBackPathStore mock
vi.mock('@/store/client/backPathStore', () => ({
  useBackPathStore: vi.fn(() => ({ setTravelDetail: vi.fn() })),
}));

// next/navigation mock
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

// ThreeRowCarousel mock
vi.mock('@/components/ThreeRowCarousel', () => ({
  default: ({ children }: React.PropsWithChildren) => <div data-testid="carousel">{children}</div>,
}));

// ContentTitleContainer mock
vi.mock('@/widgets/home/ContentTitleContainer', () => ({
  default: ({ text }: { text: React.ReactNode }) => <div data-testid="title">{text}</div>,
}));

describe('TripAvailable', () => {
  it('데이터 없을 때 렌더링되어야 한다', () => {
    render(<TripAvailable />);
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
  });

  it('여행 목록 타이틀이 렌더링되어야 한다', () => {
    render(<TripAvailable />);
    expect(screen.getByTestId('title')).toBeInTheDocument();
  });
});
