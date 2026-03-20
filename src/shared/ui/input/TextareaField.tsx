'use client';

import { useTextAreaScroll } from '@/hooks/createTrip/useInputScroll';
import { ChangeEvent, FocusEventHandler, useRef, useState } from 'react';

interface TextareaFieldProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  height?: number | string;
  padding?: string;
  fontSize?: string;
  lineHeight?: string;
  color?: string;
  isReport?: boolean;
  minRows?: number;
  maxRows?: number;
  placeholderColor?: string;
  isFlexible?: boolean;
}

/**
 * 유연한 높이를 지원하는 텍스트에어리어.
 * 숨겨진 clone textarea를 이용해 실제 텍스트 높이를 계산한다.
 * 터치 스크롤 시 자동 blur를 위해 useTextAreaScroll 훅을 사용한다.
 *
 * Refactoring notes:
 * - Emotion styled Clone/DetailTextArea → 하나의 패턴으로 통합 (공통 CSS 중복 제거)
 * - 커스텀 스크롤바 → globals.css .textarea-scrollbar 클래스
 * - Bug fix: height가 number일 때 단위('px') 누락 → `${height}px` 수정
 */
const TextareaField = ({
  height = '31svh',
  padding = '16px',
  fontSize = '16px',
  lineHeight = '22px',
  minRows,
  maxRows,
  isFlexible = false,
  isReport = false,
  placeholderColor = 'rgba(171, 171, 171, 1)', // palette.비강조2
  color = 'rgba(26, 26, 26, 1)',                // palette.기본
  onChange,
  ...rest
}: TextareaFieldProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const cloneRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  useTextAreaScroll(textAreaRef);

  const borderColor = focused ? 'rgba(62, 141, 0, 1)' : 'rgba(245, 245, 245, 1)'; // keycolor : 검색창
  const bgColor = focused ? 'rgba(252, 255, 250, 1)' : 'rgba(245, 245, 245, 1)';   // greenVariant : 검색창

  const computedHeight = isFlexible
    ? 'auto'
    : typeof height === 'number'
      ? `${height}px` // Bug fix: 원본은 `${height}` (단위 없음) → `${height}px`
      : height;

  const handleFocus: FocusEventHandler<HTMLTextAreaElement> = () => {
    setFocused(true);
  };

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = () => {
    setFocused(false);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const elem = textAreaRef.current;
    const cloneElem = cloneRef.current;
    if (!elem || !cloneElem) return;
    if (isFlexible && minRows && maxRows) {
      cloneElem.value = elem.value;
      elem.rows = Math.min(
        Math.max(Math.ceil((cloneElem.scrollHeight - 32) / (cloneElem.clientHeight - 32)), minRows),
        maxRows
      );
    }
    onChange?.(e);
  };

  // Clone/DetailTextArea가 동일한 CSS를 공유하므로 공통 스타일 객체로 추출
  const sharedTextareaStyle: React.CSSProperties = {
    padding,
    fontSize,
    lineHeight,
    letterSpacing: '-0.025em',
    fontFamily: '"Pretendard"',
    height: computedHeight,
    color,
  };

  return (
    <>
      {/* 높이 계산용 숨겨진 clone textarea */}
      <textarea
        ref={cloneRef}
        readOnly
        rows={1}
        aria-hidden="true"
        className="textarea-scrollbar absolute top-[-9999px] left-[-9999px] -z-10 invisible overflow-y-scroll w-full resize-none rounded-[20px] border-0 outline-none"
        style={{ ...sharedTextareaStyle, backgroundColor: bgColor }}
      />
      {/* 실제 사용자에게 보이는 textarea */}
      <textarea
        wrap="hard"
        ref={textAreaRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        rows={minRows}
        className="textarea-scrollbar w-full resize-none rounded-[20px] outline-none border text-left"
        style={{
          ...sharedTextareaStyle,
          borderColor,
          backgroundColor: bgColor,
          color: isReport && !focused ? placeholderColor : color,
          // placeholder 색상은 CSS 변수로 처리할 수 없어 inline style 대신 globals.css 활용
        }}
        {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    </>
  );
};

export default TextareaField;
