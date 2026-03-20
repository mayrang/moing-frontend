import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ValidationInputField from './ValidationInputField';

describe('ValidationInputField', () => {
  const baseProps = {
    type: 'text',
    name: 'test',
    onChange: () => {},
    value: '',
    message: '에러 메시지',
    handleRemoveValue: () => {},
  };

  it('renders an input element', () => {
    render(<ValidationInputField {...baseProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows error message when hasError is true', () => {
    render(<ValidationInputField {...baseProps} hasError message="잘못된 입력입니다" />);
    expect(screen.getByText('잘못된 입력입니다')).toBeInTheDocument();
  });

  it('shows success message when showSuccess and success are both true', () => {
    render(
      <ValidationInputField
        {...baseProps}
        success
        showSuccess
        message="사용 가능합니다"
      />
    );
    expect(screen.getByText('사용 가능합니다')).toBeInTheDocument();
  });

  it('shows nothing when neither hasError nor success', () => {
    render(<ValidationInputField {...baseProps} message="조건부 메시지" />);
    expect(screen.queryByText('조건부 메시지')).not.toBeInTheDocument();
  });
});
