import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import BaseToast from './BaseToast';

// createPortal 모킹: portal 없이 직접 렌더링
vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('BaseToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // createPortal이 실제로 호출되기 전에 portal 대상 엘리먼트를 생성
    const portalRoot = document.createElement('div');
    portalRoot.id = 'result-toast';
    document.body.appendChild(portalRoot);
  });
  afterEach(() => {
    vi.useRealTimers();
    // 테스트 후 정리
    const portalRoot = document.getElementById('result-toast');
    if (portalRoot) document.body.removeChild(portalRoot);
  });

  const baseProps = {
    isShow: true,
    setIsShow: vi.fn(),
    text: '완료되었습니다',
    icon: <span data-testid="toast-icon">✓</span>,
    portalId: 'result-toast',
  };

  it('isShow=true 일 때 텍스트를 렌더링한다', () => {
    render(<BaseToast {...baseProps} />);
    expect(screen.getByText('완료되었습니다')).toBeInTheDocument();
  });

  it('아이콘을 렌더링한다', () => {
    render(<BaseToast {...baseProps} />);
    expect(screen.getByTestId('toast-icon')).toBeInTheDocument();
  });

  it('1.5초 후 setIsShow(false)를 호출한다', () => {
    const setIsShow = vi.fn();
    render(<BaseToast {...baseProps} setIsShow={setIsShow} />);
    act(() => { vi.advanceTimersByTime(1500); });
    expect(setIsShow).toHaveBeenCalledWith(false);
  });

  it('isShow=false 이면 setIsShow를 호출하지 않는다', () => {
    const setIsShow = vi.fn();
    render(<BaseToast {...baseProps} isShow={false} setIsShow={setIsShow} />);
    act(() => { vi.advanceTimersByTime(1500); });
    expect(setIsShow).not.toHaveBeenCalled();
  });

  it('접근성 위반이 없어야 한다', async () => {
    vi.useRealTimers(); // axe 내부 setTimeout과 fake timer 충돌 방지
    const { container } = render(<BaseToast {...baseProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
