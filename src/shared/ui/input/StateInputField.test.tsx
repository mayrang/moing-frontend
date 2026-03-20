import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import StateInputField from './StateInputField';

describe('StateInputField', () => {
  const baseProps = {
    value: '',
    onChange: () => {},
    handleRemoveValue: () => {},
  };

  it('renders an input element', () => {
    render(<StateInputField {...baseProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('has aria-invalid=false by default', () => {
    render(<StateInputField {...baseProps} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('has aria-invalid=true when hasError is true', () => {
    render(<StateInputField {...baseProps} hasError />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows RemoveButton when value is not empty and not in success state', () => {
    render(<StateInputField {...baseProps} value="hello" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls handleRemoveValue when RemoveButton is clicked', () => {
    const handleRemoveValue = vi.fn();
    render(
      <StateInputField {...baseProps} value="hello" handleRemoveValue={handleRemoveValue} />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleRemoveValue).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<StateInputField {...baseProps} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('applies animate-shake class when shake prop is true', () => {
    const { container } = render(
      <StateInputField {...baseProps} shake={true} />
    );
    // shake class is applied to the container div
    expect(container.firstChild).toHaveClass('animate-shake');
  });

  it('does not apply animate-shake class when shake prop is false', () => {
    const { container } = render(
      <StateInputField {...baseProps} shake={false} />
    );
    expect(container.firstChild).not.toHaveClass('animate-shake');
  });

  // Phase 1.5: 접근성
  it('errorMessageId 전달 시 hasError 상태에서 aria-describedby가 연결된다', () => {
    render(
      <StateInputField
        {...baseProps}
        hasError
        errorMessageId="username-error"
      />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'username-error');
  });

  it('hasError가 false이면 aria-describedby가 없다', () => {
    render(
      <StateInputField
        {...baseProps}
        hasError={false}
        errorMessageId="username-error"
      />
    );
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });
});
