import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import PopularPlaceList from './PopularPlaceList';

vi.mock('@/components/CustomLink', () => ({
  default: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('PopularPlaceList', () => {
  it('"인기 여행 장소" 제목이 렌더링된다', () => {
    render(<PopularPlaceList />);
    expect(screen.getByText('인기 여행 장소')).toBeInTheDocument();
  });

  it('5개의 장소 아이템이 렌더링된다', () => {
    render(<PopularPlaceList />);
    expect(screen.getByText('뉴욕')).toBeInTheDocument();
    expect(screen.getByText('제주도')).toBeInTheDocument();
    expect(screen.getByText('도쿄')).toBeInTheDocument();
    expect(screen.getByText('파리')).toBeInTheDocument();
    expect(screen.getByText('서울')).toBeInTheDocument();
  });

  it('각 장소 클릭 시 올바른 검색 링크로 이동한다', () => {
    render(<PopularPlaceList />);
    const linkEl = screen.getByText('뉴욕').closest('a');
    expect(linkEl).toHaveAttribute('href', '/search/travel?keyword=뉴욕');
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<PopularPlaceList />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
