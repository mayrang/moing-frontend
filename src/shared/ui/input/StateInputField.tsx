'use client';

import CheckIcon from '@/shared/ui/icons/CheckIcon';
import React, { FocusEventHandler, forwardRef, useState } from 'react';
import RemoveButton from './RemoveButton';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  success?: boolean;
  shake?: boolean;
  height?: number;
  showSuccessIcon?: boolean;
  showIcon?: boolean;
  handleRemoveValue: () => void;
  /** 에러 메시지 요소 ID (aria-describedby 연결용). ValidationInputField에서 주입. */
  errorMessageId?: string;
}

/**
 * 유효성 상태를 표시하는 입력 필드.
 * - hasError: 에러 상태 (빨간 배경/테두리, aria-invalid)
 * - success: 성공 상태 (체크 아이콘 또는 RemoveButton)
 * - shake: 흔들기 애니메이션 (globals.css .animate-shake)
 *
 * Refactoring notes:
 * - Emotion keyframes shake → globals.css @keyframes + .animate-shake 클래스
 * - SuccessIcon = React.Fragment 패턴 → 명시적 renderIcon() 헬퍼로 교체 (가독성 개선)
 * - Bug fix: 원본의 `border: #cdcdcd` (단위 없음) 잔재 제거
 */
const StateInputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      hasError = false,
      success = false,
      shake = false,
      showSuccessIcon = true,
      handleRemoveValue,
      onFocus,
      showIcon = true,
      onBlur,
      height = 48,
      errorMessageId,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    // 색상 우선순위: hasError > focused > empty > hasValue
    const bgColor = hasError
      ? '#FFF7F7'                    // palette.errorVariant
      : focused
        ? 'rgba(252, 255, 250, 1)'   // palette.greenVariant
        : props.value === ''
          ? 'rgba(245, 245, 245, 1)' // palette.검색창
          : '#F5F5F5';

    const borderColor = hasError
      ? '#ED1E1E'                    // palette.errorBorder
      : focused
        ? 'rgba(62, 141, 0, 1)'      // palette.keycolor
        : bgColor;

    const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
      setFocused(true);
      onFocus?.(event);
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
      setFocused(false);
      onBlur?.(event);
    };

    // 우측 아이콘 렌더링 로직 (원본의 React.Fragment 트릭 → 명시적 함수로 개선)
    const renderIcon = () => {
      if (!showIcon) return null;
      if (success) {
        return focused ? (
          <RemoveButton onClick={handleRemoveValue} />
        ) : showSuccessIcon ? (
          <CheckIcon status="done" />
        ) : null;
      }
      if (props.value === '') {
        return showSuccessIcon ? <CheckIcon /> : null;
      }
      return <RemoveButton onClick={handleRemoveValue} />;
    };

    return (
      <div
        className={[
          'flex items-center w-full px-4 rounded-[50px] overflow-x-hidden box-border border',
          shake ? 'animate-shake' : '',
        ].join(' ')}
        style={{ backgroundColor: bgColor, borderColor, height: `${height}px` }}
      >
        <input
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={errorMessageId && hasError ? errorMessageId : undefined}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="flex-1 w-full h-full outline-none border-none bg-transparent font-[Pretendard] font-normal text-base tracking-[-0.04px] placeholder:text-[#cdcdcd] placeholder:font-light"
          style={{ backgroundColor: bgColor }}
          {...props}
        />
        <div className="box-border">{renderIcon()}</div>
      </div>
    );
  }
);

StateInputField.displayName = 'StateInputField';

export default StateInputField;
