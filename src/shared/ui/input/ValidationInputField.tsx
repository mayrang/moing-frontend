'use client';

import StateInputField from './StateInputField';
import InfoText from '@/shared/ui/text/InfoText';
import React from 'react';

interface ValidationInputFieldProps {
  type: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
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
 */
export default function ValidationInputField({
  type,
  name,
  onChange,
  value,
  handleRemoveValue,
  hasError,
  success,
  showSuccess = false,
  placeholder,
  shake,
  message,
}: ValidationInputFieldProps) {
  return (
    <>
      <StateInputField
        handleRemoveValue={handleRemoveValue}
        type={type}
        name={name}
        onChange={onChange}
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
