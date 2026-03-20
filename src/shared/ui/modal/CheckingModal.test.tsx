import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CheckingModal from './CheckingModal';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

describe('CheckingModal', () => {
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
    modalTitle: '정말 삭제하시겠습니까?',
    modalMsg: '삭제하면 복구할 수 없습니다.',
    modalButtonText: '삭제',
    setModalOpen: vi.fn(),
  };

  it('제목을 렌더링한다', () => {
    render(<CheckingModal {...baseProps} />);
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('메시지를 렌더링한다', () => {
    render(<CheckingModal {...baseProps} />);
    expect(screen.getByText('삭제하면 복구할 수 없습니다.')).toBeInTheDocument();
  });

  it('닫기 버튼을 클릭하면 setModalOpen(false)를 호출한다', () => {
    const setModalOpen = vi.fn();
    render(<CheckingModal {...baseProps} setModalOpen={setModalOpen} />);
    fireEvent.click(screen.getByText('닫기'));
    expect(setModalOpen).toHaveBeenCalledWith(false);
  });

  it('확인 버튼을 클릭하면 onClick을 호출하고 모달을 닫는다', () => {
    const onClick = vi.fn();
    const setModalOpen = vi.fn();
    render(<CheckingModal {...baseProps} onClick={onClick} setModalOpen={setModalOpen} />);
    fireEvent.click(screen.getByText('삭제'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(setModalOpen).toHaveBeenCalledWith(false);
  });

  it('isModalOpen=false 이면 null을 반환한다', () => {
    const { container } = render(<CheckingModal {...baseProps} isModalOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  // Phase 1.5: 접근성
  it('모달 컨테이너에 role="dialog"가 있다', () => {
    render(<CheckingModal {...baseProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('모달 컨테이너에 aria-modal="true"가 있다', () => {
    render(<CheckingModal {...baseProps} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('Escape 키 입력 시 모달이 닫힌다', () => {
    const setModalOpen = vi.fn();
    render(<CheckingModal {...baseProps} setModalOpen={setModalOpen} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(setModalOpen).toHaveBeenCalledWith(false);
  });
});
