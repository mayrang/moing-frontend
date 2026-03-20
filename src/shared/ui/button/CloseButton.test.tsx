import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import CloseButton from './CloseButton';

describe('CloseButton', () => {
  it('닫기 버튼이 렌더링된다', () => {
    render(<CloseButton onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('onClick 핸들러가 호출된다', async () => {
    const handleClick = vi.fn();
    render(<CloseButton onClick={handleClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Phase 1.5: 접근성
  it('기본 aria-label이 text prop과 동일하다', () => {
    render(<CloseButton onClick={() => {}} />);
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('aria-label prop을 통해 접근성 이름을 커스텀할 수 있다', () => {
    render(<CloseButton onClick={() => {}} aria-label="모달 닫기" text="닫기" />);
    expect(screen.getByRole('button', { name: '모달 닫기' })).toBeInTheDocument();
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<CloseButton onClick={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
