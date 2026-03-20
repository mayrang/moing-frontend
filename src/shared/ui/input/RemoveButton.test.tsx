import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import RemoveButton from './RemoveButton';

describe('RemoveButton', () => {
  it('renders a button element', () => {
    render(<RemoveButton onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has type=button to prevent unintended form submission', () => {
    render(<RemoveButton onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<RemoveButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // Phase 1.5: 접근성
  it('has aria-label="삭제" for screen readers (icon-only button)', () => {
    render(<RemoveButton onClick={() => {}} />);
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<RemoveButton onClick={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
