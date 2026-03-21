import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import BoxLayoutTag from './BoxLayoutTag';

describe('BoxLayoutTag', () => {
  it('text를 렌더링한다', () => {
    render(<BoxLayoutTag text="태그" />);
    expect(screen.getByText('태그')).toBeInTheDocument();
  });

  it('size="large" 일 때 렌더링된다', () => {
    render(<BoxLayoutTag text="large 태그" size="large" />);
    expect(screen.getByText('large 태그')).toBeInTheDocument();
  });

  it('size="medium" 일 때 렌더링된다', () => {
    render(<BoxLayoutTag text="medium 태그" size="medium" />);
    expect(screen.getByText('medium 태그')).toBeInTheDocument();
  });

  it('size="small" 일 때 렌더링된다', () => {
    render(<BoxLayoutTag text="small 태그" size="small" />);
    expect(screen.getByText('small 태그')).toBeInTheDocument();
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<BoxLayoutTag text="태그" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
