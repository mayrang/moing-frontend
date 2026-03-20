import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TextareaField from './TextareaField';

// useTextAreaScroll 은 touchmove 이벤트에 의존하므로 테스트 환경에서 모킹
vi.mock('@/hooks/createTrip/useInputScroll', () => ({
  useTextAreaScroll: vi.fn(),
}));

describe('TextareaField', () => {
  it('renders a textarea element', () => {
    render(<TextareaField />);
    // TextareaField renders a visible textarea (and a hidden clone)
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThanOrEqual(1);
  });

  it('applies placeholder text', () => {
    render(<TextareaField placeholder="내용을 입력해주세요" />);
    const visibleTextarea = screen.getAllByRole('textbox').find(
      (el) => !(el as HTMLElement).style.visibility?.includes('hidden')
    );
    expect(visibleTextarea).toHaveAttribute('placeholder', '내용을 입력해주세요');
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<TextareaField onChange={onChange} />);
    const textareas = screen.getAllByRole('textbox');
    // The visible textarea is the last one (clone is hidden)
    const visibleTextarea = textareas[textareas.length - 1];
    fireEvent.change(visibleTextarea, { target: { value: '새 내용' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
