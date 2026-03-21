import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import SearchFilterTag from './SearchFilterTag';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('SearchFilterTag', () => {
  it('text를 렌더링한다', () => {
    render(<SearchFilterTag text="서울" idx={0} />);
    expect(screen.getByText('서울')).toBeInTheDocument();
  });

  it('onClick 핸들러가 호출된다', async () => {
    const handleClick = vi.fn();
    render(<SearchFilterTag text="서울" idx={0} onClick={handleClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('iconPosition=start 일 때 아이콘이 앞에 렌더링된다', () => {
    const icon = <span data-testid="icon">★</span>;
    render(<SearchFilterTag text="서울" idx={0} icon={icon} iconPosition="start" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('disabled 상태에서는 클릭이 안 된다', async () => {
    const handleClick = vi.fn();
    render(<SearchFilterTag text="서울" idx={0} disabled onClick={handleClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<SearchFilterTag text="서울" idx={0} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
