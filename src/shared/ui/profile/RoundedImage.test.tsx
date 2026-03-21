import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import RoundedImage from './RoundedImage';

describe('RoundedImage', () => {
  it('지정한 size로 width/height를 렌더링한다', () => {
    const { container } = render(<RoundedImage size={48} src="https://example.com/img.jpg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('48px');
  });

  it('src가 있으면 background-image를 설정한다', () => {
    const { container } = render(<RoundedImage size={48} src="https://example.com/img.jpg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundImage).toContain('example.com/img.jpg');
  });

  it('src가 빈 문자열이면 회색 배경을 설정한다', () => {
    const { container } = render(<RoundedImage size={48} src="" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundColor).toBe('rgba(217, 217, 217, 1)');
  });

  it('rounded-full 클래스를 가진다', () => {
    const { container } = render(<RoundedImage size={48} src="" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<RoundedImage size={48} src="https://example.com/img.jpg" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
