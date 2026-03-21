import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import ResultModal from './ResultModal';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

describe('ResultModal', () => {
  beforeEach(() => {
    const el = document.createElement('div');
    el.id = 'checking-modal';
    document.body.appendChild(el);
  });
  afterEach(() => {
    document.getElementById('checking-modal')?.remove();
  });

  const baseProps = {
    isModalOpen: true,
    modalTitle: '신청 완료',
    modalMsg: '여행 신청이 완료되었습니다.',
    setModalOpen: vi.fn(),
  };

  it('제목을 렌더링한다', () => {
    render(<ResultModal {...baseProps} />);
    expect(screen.getByText('신청 완료')).toBeInTheDocument();
  });

  it('메시지를 렌더링한다', () => {
    render(<ResultModal {...baseProps} />);
    expect(screen.getByText('여행 신청이 완료되었습니다.')).toBeInTheDocument();
  });

  it('CheckIcon(SVG)을 렌더링한다', () => {
    const { container } = render(<ResultModal {...baseProps} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('닫기 버튼을 클릭하면 setModalOpen(false)를 호출한다', () => {
    const setModalOpen = vi.fn();
    render(<ResultModal {...baseProps} setModalOpen={setModalOpen} />);
    fireEvent.click(screen.getByText('닫기'));
    expect(setModalOpen).toHaveBeenCalledWith(false);
  });

  it('isModalOpen=false 이면 null을 반환한다', () => {
    const { container } = render(<ResultModal {...baseProps} isModalOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<ResultModal {...baseProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
