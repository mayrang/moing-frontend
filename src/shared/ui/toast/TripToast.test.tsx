import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TripToast from './TripToast';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('TripToast', () => {
  beforeEach(() => {
    const portalRoot = document.createElement('div');
    portalRoot.id = 'trip-toast';
    document.body.appendChild(portalRoot);
  });
  afterEach(() => {
    const portalRoot = document.getElementById('trip-toast');
    if (portalRoot) document.body.removeChild(portalRoot);
  });

  const baseProps = {
    isShow: true,
    setIsMapFull: vi.fn(),
    setModalHeight: vi.fn(),
  };

  it('텍스트를 렌더링한다', () => {
    render(<TripToast {...baseProps} />);
    expect(screen.getByText(/여행 일정을 추가해 보세요/)).toBeInTheDocument();
  });

  it('클릭 시 setIsMapFull(true)를 호출한다', () => {
    const setIsMapFull = vi.fn();
    render(<TripToast {...baseProps} setIsMapFull={setIsMapFull} />);
    fireEvent.click(screen.getByRole('button'));
    expect(setIsMapFull).toHaveBeenCalledWith(true);
  });

  it('클릭 시 setModalHeight(0)을 호출한다', () => {
    const setModalHeight = vi.fn();
    render(<TripToast {...baseProps} setModalHeight={setModalHeight} />);
    fireEvent.click(screen.getByRole('button'));
    expect(setModalHeight).toHaveBeenCalledWith(0);
  });
});
