import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditAndDeleteButton from './EditAndDeleteButton';

describe('EditAndDeleteButton', () => {
  const defaultProps = {
    isOpen: true,
    editClickHandler: vi.fn(),
    deleteClickHandler: vi.fn(),
  };

  it('수정하기 버튼이 렌더링된다', () => {
    render(<EditAndDeleteButton {...defaultProps} />);
    expect(screen.getByText('수정하기')).toBeInTheDocument();
  });

  it('삭제하기 버튼이 렌더링된다', () => {
    render(<EditAndDeleteButton {...defaultProps} />);
    expect(screen.getByText('삭제하기')).toBeInTheDocument();
  });

  it('deleteText prop으로 삭제 버튼 텍스트를 변경할 수 있다', () => {
    render(<EditAndDeleteButton {...defaultProps} deleteText="참가 취소" />);
    expect(screen.getByText('참가 취소')).toBeInTheDocument();
  });

  it('isMyApplyTrip이 true이면 수정 버튼이 숨겨진다', () => {
    render(<EditAndDeleteButton {...defaultProps} isMyApplyTrip />);
    expect(screen.queryByText('수정하기')).not.toBeInTheDocument();
  });

  it('editClickHandler가 호출된다', async () => {
    const editClickHandler = vi.fn();
    render(<EditAndDeleteButton {...defaultProps} editClickHandler={editClickHandler} />);
    await userEvent.click(screen.getByText('수정하기'));
    expect(editClickHandler).toHaveBeenCalledTimes(1);
  });

  it('deleteClickHandler가 호출된다', async () => {
    const deleteClickHandler = vi.fn();
    render(<EditAndDeleteButton {...defaultProps} deleteClickHandler={deleteClickHandler} />);
    await userEvent.click(screen.getByText('삭제하기'));
    expect(deleteClickHandler).toHaveBeenCalledTimes(1);
  });
});
