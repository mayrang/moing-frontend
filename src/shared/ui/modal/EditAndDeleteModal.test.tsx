import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import EditAndDeleteModal from './EditAndDeleteModal';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

describe('EditAndDeleteModal', () => {
  beforeEach(() => {
    const el = document.createElement('div');
    el.id = 'end-modal';
    document.body.appendChild(el);
  });
  afterEach(() => {
    document.getElementById('end-modal')?.remove();
  });

  const baseProps = {
    isOpen: true,
    setIsOpen: vi.fn(),
    setIsEditBtnClicked: vi.fn(),
    setIsDeleteBtnClicked: vi.fn(),
  };

  it('수정하기 버튼이 렌더링된다', () => {
    render(<EditAndDeleteModal {...baseProps} />);
    expect(screen.getByText('수정하기')).toBeInTheDocument();
  });

  it('삭제하기 버튼이 렌더링된다', () => {
    render(<EditAndDeleteModal {...baseProps} />);
    expect(screen.getByText('삭제하기')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 setIsEditBtnClicked(true)를 호출하고 모달을 닫는다', () => {
    const setIsEditBtnClicked = vi.fn();
    const setIsOpen = vi.fn();
    render(<EditAndDeleteModal {...baseProps} setIsEditBtnClicked={setIsEditBtnClicked} setIsOpen={setIsOpen} />);
    fireEvent.click(screen.getByText('수정하기'));
    expect(setIsEditBtnClicked).toHaveBeenCalledWith(true);
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('삭제 버튼 클릭 시 setIsDeleteBtnClicked(true)를 호출하고 모달을 닫는다', () => {
    const setIsDeleteBtnClicked = vi.fn();
    const setIsOpen = vi.fn();
    render(<EditAndDeleteModal {...baseProps} setIsDeleteBtnClicked={setIsDeleteBtnClicked} setIsOpen={setIsOpen} />);
    fireEvent.click(screen.getByText('삭제하기'));
    expect(setIsDeleteBtnClicked).toHaveBeenCalledWith(true);
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<EditAndDeleteModal {...baseProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
