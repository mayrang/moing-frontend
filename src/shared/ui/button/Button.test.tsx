import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('텍스트를 렌더링한다', () => {
    render(<Button text="다음" />);
    expect(screen.getByRole('button', { name: '다음' })).toBeInTheDocument();
  });

  it('기본 type은 submit이다', () => {
    render(<Button text="제출" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('type prop을 전달할 수 있다', () => {
    render(<Button text="버튼" type="button" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('onClick 핸들러가 호출된다', async () => {
    const handleClick = vi.fn();
    render(<Button text="클릭" onClick={handleClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서는 클릭이 안 된다', async () => {
    const handleClick = vi.fn();
    render(<Button text="비활성" disabled onClick={handleClick} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('children을 렌더링한다', () => {
    render(<Button text="버튼"><span data-testid="child">자식</span></Button>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
