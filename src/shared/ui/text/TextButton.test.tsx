import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextButton from './TextButton';

describe('TextButton', () => {
  it('text를 렌더링한다', () => {
    render(<TextButton text="프로필 편집" isRightVector={false} isLeftVector={false} />);
    expect(screen.getByText('프로필 편집')).toBeInTheDocument();
  });

  it('isRightVector=true 일 때 화살표 아이콘이 렌더링된다', () => {
    render(<TextButton text="더보기" isRightVector isLeftVector={false} />);
    // RightVector 컴포넌트가 렌더링되면 SVG가 있어야 함
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('rightText가 있으면 렌더링된다', () => {
    render(<TextButton text="알림" isRightVector={false} isLeftVector={false} rightText="ON" />);
    expect(screen.getByText('ON')).toBeInTheDocument();
  });

  it('onClick 핸들러가 호출된다', async () => {
    const handleClick = vi.fn();
    render(
      <TextButton
        text="클릭"
        isRightVector={false}
        isLeftVector={false}
        onClick={handleClick as any}
      />
    );
    await userEvent.click(screen.getByText('클릭'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
