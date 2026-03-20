import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterButton from './FilterButton';

describe('FilterButton', () => {
  it('텍스트를 렌더링한다', () => {
    render(<FilterButton text="필터 적용" />);
    expect(screen.getByText('필터 적용')).toBeInTheDocument();
  });

  it('리셋 버튼이 렌더링된다', () => {
    render(<FilterButton text="필터 적용" />);
    // 리셋 버튼(ResetIcon)과 필터 버튼 2개
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('onClick 핸들러가 호출된다', async () => {
    const handleClick = vi.fn();
    render(<FilterButton text="필터 적용" onClick={handleClick} />);
    const buttons = screen.getAllByRole('button');
    // 두 번째 버튼이 메인 필터 버튼
    await userEvent.click(buttons[1]);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('initializeOnClick 핸들러가 호출된다', async () => {
    const handleInitialize = vi.fn();
    render(<FilterButton text="필터 적용" initializeOnClick={handleInitialize} />);
    const buttons = screen.getAllByRole('button');
    // 첫 번째 버튼이 리셋 버튼
    await userEvent.click(buttons[0]);
    expect(handleInitialize).toHaveBeenCalledTimes(1);
  });
});
