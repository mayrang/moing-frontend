'use client';

import React, { FocusEventHandler, forwardRef, useState } from 'react';
import RemoveButton from './RemoveButton';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  handleRemoveValue?: () => void;
  icon?: React.ReactNode;
  isRemove?: boolean;
  isHome?: boolean;
}

/**
 * 기본 텍스트 입력 필드.
 * 포커스 상태에 따라 배경/테두리 색이 바뀌며, 아이콘 슬롯과 RemoveButton을 지원한다.
 * forwardRef로 부모가 내부 input DOM에 접근할 수 있다.
 *
 * Refactoring notes:
 * - Emotion → Tailwind (레이아웃/타이포) + inline style (상태 기반 색상)
 * - Bug fix: 원본의 `border: #cdcdcd` (단위 없음) → 실제로 적용이 안 되던 버그 제거
 */
const InputField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { icon, handleRemoveValue = () => {}, isRemove = true, onFocus, onBlur, isHome = false, ...props },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    // 색상 우선순위: isHome > focused > empty > hasValue
    const bgColor = isHome
      ? '#fff'
      : focused
        ? 'rgba(252, 255, 250, 1)'   // palette.greenVariant
        : props.value === ''
          ? 'rgba(245, 245, 245, 1)' // palette.검색창
          : 'rgba(240, 240, 240, 1)'; // palette.비강조4

    const borderColor = focused ? 'rgba(62, 141, 0, 1)' : bgColor; // palette.keycolor

    const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
      setFocused(true);
      onFocus?.(event);
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
      setFocused(false);
      onBlur?.(event);
    };

    return (
      <div
        className="flex items-center w-full h-12 px-4 rounded-[50px] overflow-x-hidden box-border border"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        {icon && <div className="mr-[11px]">{icon}</div>}
        <input
          ref={ref}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="flex-1 w-full h-full outline-none border-none bg-transparent font-[Pretendard] font-normal text-base tracking-[-0.04px] placeholder:text-text-muted2"
          {...props}
        />
        <div>
          {props.value === '' ? (
            <> </>
          ) : (
            isRemove && <RemoveButton onClick={handleRemoveValue} />
          )}
        </div>
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
