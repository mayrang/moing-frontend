'use client';

import {
  FocusEvent,
  FocusEventHandler,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  RefObject,
  useCallback,
  useState,
} from 'react';

interface CodeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  refs: RefObject<(HTMLInputElement | null)[]>;
  onValueChange: (values: string[]) => void;
}

/**
 * 6자리 인증 코드 입력 컴포넌트 (OTP 스타일).
 * - 숫자만 입력 가능
 * - 각 셀에 입력 시 다음 셀로 자동 포커스
 * - Backspace로 이전 셀로 이동 및 삭제
 * - 붙여넣기 지원
 * - 빈 셀에는 bar placeholder 표시
 *
 * Refactoring notes:
 * - Emotion → Tailwind (레이아웃/구조) + inline style (상태 기반 색상)
 * - input-bar 숨김 CSS → globals.css .code-input-cell 클래스로 분리
 * - 숫자 스피너 제거 → globals.css .code-number-input 클래스
 */
const CodeInput = ({ refs, onBlur, onFocus, onValueChange, ...props }: CodeInputProps) => {
  const [focused, setFocused] = useState(-1);

  const bgColor = focused >= 0
    ? 'rgba(252, 255, 250, 1)'   // palette.greenVariant
    : props.value === ''
      ? 'rgba(245, 245, 245, 1)' // palette.검색창
      : 'rgba(240, 240, 240, 1)'; // palette.비강조4

  const borderColor = focused >= 0 ? 'rgba(62, 141, 0, 1)' : bgColor; // palette.keycolor

  const isValidIndex = (index: number) => index >= 0 && index < 6;

  const updateValues = () => {
    if (!refs.current) return;
    const newValues = refs.current.map((input) => input?.value || '');
    onValueChange(newValues);
  };

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>, index: number) => {
      event.stopPropagation();
      setFocused(index);
      onFocus?.(event);
    },
    [onFocus]
  );

  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    setFocused(-1);
    onBlur?.(event);
  };

  const handleInput = (e: FormEvent<HTMLInputElement>, index: number) => {
    if (!refs.current) return;
    const currentInput = refs.current[index];
    // 숫자가 아니면 클리어
    if (currentInput?.value && isNaN(parseInt(currentInput.value))) {
      currentInput.value = '';
      return;
    }
    // 두 자리 이상이면 마지막 문자만 유지
    if (currentInput && currentInput.value.length > 1) {
      currentInput.value = currentInput.value[currentInput.value.length - 1];
    }
    // 다음 셀로 이동
    if (currentInput?.value.length === 1 && isValidIndex(index + 1)) {
      refs.current[index + 1]?.focus({ preventScroll: true });
    }
    updateValues();
  };

  const clickContainer = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const firstEmptyRef = refs.current?.find((ref) => ref?.value === '');
    if (firstEmptyRef) {
      firstEmptyRef.focus({ preventScroll: true });
    } else {
      refs.current[refs.current.length - 1]?.focus({ preventScroll: true });
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (!refs.current) return;
    const currentInput = refs.current[index];
    if (e.key === 'Backspace' && currentInput?.value === '') {
      e.preventDefault();
      if (isValidIndex(index - 1)) {
        const prevInput = refs.current[index - 1];
        if (prevInput) prevInput.value = '';
        prevInput?.focus({ preventScroll: true });
      }
    }
    updateValues();
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6 - index);
    if (!refs.current || !pastedData) return;
    [...pastedData].forEach((char, i) => {
      const targetIndex = index + i;
      if (isValidIndex(targetIndex)) {
        const input = refs.current[targetIndex];
        if (input) input.value = char;
      }
    });
    updateValues();
    refs.current[Math.min(pastedData.length + index, 5)]?.focus({ preventScroll: true });
  };

  return (
    <div
      className="flex items-center justify-center w-full gap-1 h-12 px-4 rounded-[50px] overflow-x-hidden box-border border"
      style={{ backgroundColor: bgColor, borderColor }}
      onClick={clickContainer}
    >
      {[...Array(6)].map((_, index) => (
        <div key={index} className="w-10 h-[42px]">
          {/* .code-input-cell: globals.css에서 input-bar 숨김 CSS 트리거 */}
          <div className="code-input-cell relative block w-full h-full">
            <input
              placeholder=""
              aria-label={`${index + 1}번째 숫자`}
              onBlur={handleBlur}
              onFocus={(e) => handleFocus(e, index)}
              {...props}
              type="number"
              id={String(index)}
              ref={(el) => {
                if (refs.current) refs.current[index] = el;
              }}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              className="code-number-input w-full h-full text-center border-none font-semibold outline-none block p-0 text-[30px] leading-4 text-black bg-transparent placeholder:opacity-0"
            />
            {/* bar: 빈 셀임을 나타내는 placeholder 바 */}
            <div
              className="input-bar w-4 h-[3px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 block rounded-[3px] z-10"
              style={{ backgroundColor: 'rgba(205, 205, 205, 1)' }} // palette.비강조3
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CodeInput;
