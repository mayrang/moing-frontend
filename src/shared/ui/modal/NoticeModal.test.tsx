import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import NoticeModal from './NoticeModal';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

describe('NoticeModal', () => {
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
    modalTitle: '안내',
    modalMsg: '확인해 주세요.',
    setModalOpen: vi.fn(),
  };

  it('제목을 렌더링한다', () => {
    render(<NoticeModal {...baseProps} />);
    expect(screen.getByText('안내')).toBeInTheDocument();
  });

  it('메시지를 렌더링한다', () => {
    render(<NoticeModal {...baseProps} />);
    expect(screen.getByText('확인해 주세요.')).toBeInTheDocument();
  });

  it('아이콘 SVG를 렌더링한다', () => {
    const { container } = render(<NoticeModal {...baseProps} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('닫기 버튼을 클릭하면 setModalOpen(false)를 호출한다', () => {
    const setModalOpen = vi.fn();
    render(<NoticeModal {...baseProps} setModalOpen={setModalOpen} />);
    fireEvent.click(screen.getByText('닫기'));
    expect(setModalOpen).toHaveBeenCalledWith(false);
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<NoticeModal {...baseProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
