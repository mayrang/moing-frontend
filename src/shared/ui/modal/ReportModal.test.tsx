import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ReportModal from './ReportModal';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

describe('ReportModal', () => {
  beforeEach(() => {
    const el = document.createElement('div');
    el.id = 'checking-modal';
    document.body.appendChild(el);
  });
  afterEach(() => {
    document.getElementById('checking-modal')?.remove();
  });

  const baseProps = {
    isOpen: true,
    setIsOpen: vi.fn(),
    setIsReportBtnClicked: vi.fn(),
  };

  it('신고하기 버튼이 렌더링된다', () => {
    render(<ReportModal {...baseProps} />);
    expect(screen.getByText('신고하기')).toBeInTheDocument();
  });

  it('신고 버튼 클릭 시 setIsReportBtnClicked(true)를 호출하고 모달을 닫는다', () => {
    const setIsReportBtnClicked = vi.fn();
    const setIsOpen = vi.fn();
    render(<ReportModal {...baseProps} setIsReportBtnClicked={setIsReportBtnClicked} setIsOpen={setIsOpen} />);
    fireEvent.click(screen.getByText('신고하기'));
    expect(setIsReportBtnClicked).toHaveBeenCalledWith(true);
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });
});
