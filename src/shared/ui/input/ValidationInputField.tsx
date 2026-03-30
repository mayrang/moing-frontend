'use client';

import StateInputField from './StateInputField';
import InfoText from '@/shared/ui/text/InfoText';
import React, { forwardRef } from 'react';

interface ValidationInputFieldProps {
  type: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  shake?: boolean;
  value: string;
  hasError?: boolean;
  success?: boolean;
  placeholder?: string;
  showSuccess?: boolean;
  message: string;
  handleRemoveValue: () => void;
}

/**
 * StateInputField + InfoText를 조합한 유효성 검증 입력 필드.
 * hasError/showSuccess+success 상태에 따라 메시지를 표시한다.
 *
 * forwardRef: react-hook-form register()가 반환하는 ref를 StateInputField → <input>까지
 * 전달해 RHF 필드 등록이 정상 동작하도록 한다.
 */
const ValidationInputField = forwardRef<HTMLInputElement, ValidationInputFieldProps>(
  function ValidationInputField(
    {
      type,
      name,
      onChange,
      onBlur,
      value,
      handleRemoveValue,
      hasError,
      success,
      showSuccess = false,
      placeholder,
      shake,
      message,
    },
    ref
  ) {
  return (
    <>
      <StateInputField
        ref={ref}
        handleRemoveValue={handleRemoveValue}
        type={type}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        hasError={hasError}
        success={success}
        placeholder={placeholder}
        shake={shake}
      />
      <div className="h-2" />
      <div style={{ paddingLeft: 6 }}>
        {hasError ? (
          <InfoText hasError>{message}</InfoText>
        ) : showSuccess && success ? (
          <InfoText success>{message}</InfoText>
        ) : (
          <div className="h-4" />
        )}
      </div>
    </>
  );
  }
);

ValidationInputField.displayName = 'ValidationInputField';

export default ValidationInputField;
