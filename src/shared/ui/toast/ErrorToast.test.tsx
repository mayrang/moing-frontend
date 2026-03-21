import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import ErrorToast from './ErrorToast';

describe('ErrorToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('isShow=true 일 때 메시지를 렌더링한다', () => {
    render(<ErrorToast isShow message="서버 오류입니다" onHide={() => {}} />);
    expect(screen.getByText('서버 오류입니다')).toBeInTheDocument();
  });

  it('isShow=false 일 때도 DOM에 존재한다 (CSS로 숨김)', () => {
    render(<ErrorToast isShow={false} message="에러" onHide={() => {}} />);
    expect(screen.getByText('에러')).toBeInTheDocument();
  });

  it('1.5초 후 onHide를 호출한다', () => {
    const onHide = vi.fn();
    render(<ErrorToast isShow message="에러" onHide={onHide} />);
    act(() => { vi.advanceTimersByTime(1500); });
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('isShow=false 이면 onHide를 호출하지 않는다', () => {
    const onHide = vi.fn();
    render(<ErrorToast isShow={false} message="에러" onHide={onHide} />);
    act(() => { vi.advanceTimersByTime(1500); });
    expect(onHide).not.toHaveBeenCalled();
  });

  it('404 에러 메시지는 표시하지 않는다', () => {
    const { container } = render(
      <ErrorToast isShow message="404 페이지를 찾을 수 없습니다" onHide={() => {}} />
    );
    // 404 포함 메시지는 isShow를 무효화 → opacity/bottom 으로 숨김
    // DOM 에는 있지만 숨김 상태 (style 검증)
    expect(container.firstChild).toHaveStyle({ opacity: '0' });
  });

  it('접근성 위반이 없어야 한다', async () => {
    vi.useRealTimers(); // axe 내부 setTimeout과 fake timer 충돌 방지
    const { container } = render(<ErrorToast isShow message="서버 오류입니다" onHide={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
