import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import RoundedImage from './RoundedImage';

describe('RoundedImage', () => {
  it('src가 있으면 img 태그를 렌더링한다', () => {
    const { container } = render(<RoundedImage size={48} src="https://example.com/img.jpg" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
  });

  it('img에 width/height 속성이 설정된다', () => {
    const { container } = render(<RoundedImage size={48} src="https://example.com/img.jpg" />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('48');
    expect(img?.getAttribute('height')).toBe('48');
  });

  it('src가 빈 문자열이면 회색 배경 div를 렌더링한다', () => {
    const { container } = render(<RoundedImage size={48} src="" />);
    const div = container.firstChild as HTMLElement;
    expect(div.tagName).toBe('DIV');
    expect(div.style.backgroundColor).toBe('rgba(217, 217, 217, 1)');
  });

  it('src가 빈 문자열이면 지정한 size로 width/height를 설정한다', () => {
    const { container } = render(<RoundedImage size={48} src="" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('48px');
    expect(div.style.height).toBe('48px');
  });

  it('rounded-full 클래스를 가진다', () => {
    const { container } = render(<RoundedImage size={48} src="" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<RoundedImage size={48} src="https://example.com/img.jpg" alt="프로필" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
