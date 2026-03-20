import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import InputField from './InputField';

describe('InputField', () => {
  it('renders an input element', () => {
    render(<InputField value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders icon when icon prop is provided', () => {
    const TestIcon = () => <span data-testid="test-icon">icon</span>;
    render(<InputField value="" onChange={() => {}} icon={<TestIcon />} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('shows RemoveButton when value is not empty and isRemove is true', () => {
    render(
      <InputField
        value="hello"
        onChange={() => {}}
        isRemove={true}
        handleRemoveValue={() => {}}
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('hides RemoveButton when value is empty', () => {
    render(
      <InputField
        value=""
        onChange={() => {}}
        isRemove={true}
        handleRemoveValue={() => {}}
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('hides RemoveButton when isRemove is false', () => {
    render(
      <InputField
        value="hello"
        onChange={() => {}}
        isRemove={false}
        handleRemoveValue={() => {}}
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls handleRemoveValue when RemoveButton is clicked', () => {
    const handleRemoveValue = vi.fn();
    render(
      <InputField
        value="hello"
        onChange={() => {}}
        handleRemoveValue={handleRemoveValue}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleRemoveValue).toHaveBeenCalledTimes(1);
  });

  it('calls onFocus handler when focused', () => {
    const onFocus = vi.fn();
    render(<InputField value="" onChange={() => {}} onFocus={onFocus} />);
    fireEvent.focus(screen.getByRole('textbox'));
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur handler when blurred', () => {
    const onBlur = vi.fn();
    render(<InputField value="" onChange={() => {}} onBlur={onBlur} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<InputField value="" onChange={() => {}} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
