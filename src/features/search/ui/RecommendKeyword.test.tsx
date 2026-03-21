import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import RecommendKeyword from './RecommendKeyword';

describe('RecommendKeyword', () => {
  it('추천 검색어 목록이 렌더링된다', () => {
    render(<RecommendKeyword setKeyword={vi.fn()} />);

    expect(screen.getByText('추천 검색어')).toBeInTheDocument();
    expect(screen.getByText('유럽')).toBeInTheDocument();
    expect(screen.getByText('일본')).toBeInTheDocument();
    expect(screen.getByText('제주')).toBeInTheDocument();
  });

  it('키워드 클릭 시 setKeyword가 해당 키워드로 호출된다', () => {
    const mockSetKeyword = vi.fn();
    render(<RecommendKeyword setKeyword={mockSetKeyword} />);

    fireEvent.click(screen.getByText('유럽'));
    expect(mockSetKeyword).toHaveBeenCalledWith('유럽');
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<RecommendKeyword setKeyword={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
