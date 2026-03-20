import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it('text를 렌더링한다', () => {
    render(<Badge text="여행" isDueDate={false} />);
    expect(screen.getByText('여행')).toBeInTheDocument();
  });

  it('isDueDate=true이면 D-N 형식으로 렌더링된다', () => {
    render(<Badge text="출발" daysLeft={3} isDueDate />);
    expect(screen.getByText(/D-3/)).toBeInTheDocument();
  });

  it('isClose=true이면 마감을 렌더링한다', () => {
    render(<Badge text="출발" isClose isDueDate />);
    expect(screen.getByText('마감')).toBeInTheDocument();
  });

  it('isClose=true일 때 D-N을 렌더링하지 않는다', () => {
    render(<Badge text="출발" daysLeft={3} isClose isDueDate />);
    expect(screen.queryByText(/D-3/)).not.toBeInTheDocument();
  });
});
