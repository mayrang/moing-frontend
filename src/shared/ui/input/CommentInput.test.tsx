import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import CommentInput from './CommentInput';

describe('CommentInput', () => {
  it('renders a textarea element', () => {
    render(<CommentInput setReset={() => {}} value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    render(<CommentInput setReset={() => {}} value="" onChange={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies placeholder text', () => {
    render(
      <CommentInput setReset={() => {}} value="" onChange={() => {}} placeholder="댓글을 입력하세요" />
    );
    expect(screen.getByPlaceholderText('댓글을 입력하세요')).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<CommentInput setReset={() => {}} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '안녕' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<CommentInput setReset={() => {}} value="" onChange={() => {}} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
