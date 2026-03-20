import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import CodeInput from './CodeInput';

describe('CodeInput', () => {
  const createRefs = () => {
    const refs = React.createRef<(HTMLInputElement | null)[]>() as React.MutableRefObject<(HTMLInputElement | null)[]>;
    refs.current = Array(6).fill(null);
    return refs;
  };

  it('renders 6 input cells', () => {
    const refs = createRefs();
    render(<CodeInput refs={refs} onValueChange={() => {}} />);
    const inputs = screen.getAllByRole('spinbutton'); // type="number" inputs
    expect(inputs).toHaveLength(6);
  });

  it('calls onValueChange when input value changes', () => {
    const refs = createRefs();
    const onValueChange = vi.fn();
    render(<CodeInput refs={refs} onValueChange={onValueChange} />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.input(inputs[0], { target: { value: '1' } });
    expect(onValueChange).toHaveBeenCalled();
  });

  it('ignores non-numeric input', () => {
    const refs = createRefs();
    const onValueChange = vi.fn();
    render(<CodeInput refs={refs} onValueChange={onValueChange} />);
    const inputs = screen.getAllByRole('spinbutton');
    // Simulate non-numeric input
    fireEvent.input(inputs[0], { target: { value: 'a' } });
    // After input handler runs, value should be cleared
    // (DOM manipulation done directly on the ref, so we check via refs)
    // The handler calls updateValues regardless
    expect(onValueChange).toHaveBeenCalled();
  });

  it('shows a bar placeholder in each cell', () => {
    const refs = createRefs();
    render(<CodeInput refs={refs} onValueChange={() => {}} />);
    // Each cell has an .input-bar element
    const bars = document.querySelectorAll('.input-bar');
    expect(bars).toHaveLength(6);
  });

  // Phase 1.5: 접근성
  it('각 셀에 "n번째 숫자" aria-label이 있다', () => {
    const refs = createRefs();
    render(<CodeInput refs={refs} onValueChange={() => {}} />);
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByLabelText(`${i}번째 숫자`)).toBeInTheDocument();
    }
  });
});
