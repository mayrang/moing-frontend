'use client';

import UpArrowIcon from '@/shared/ui/icons/UpArrowIcon';
import { forwardRef, useEffect, useState } from 'react';

interface CommentInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  setReset: () => void;
}

/**
 * 댓글 입력 컴포넌트.
 * - forwardRef로 부모에서 textarea DOM 접근 가능
 * - 포커스 상태에 따라 테두리/배경 색상 변경
 * - 값이 있을 때만 submit 버튼이 활성화 (keycolor 배경)
 * - blur 후 값이 비어있으면 setReset() 호출
 *
 * Refactoring notes:
 * - Emotion styled-components → Tailwind (구조) + inline style (상태 색상)
 * - Bug fix: 원본 Input styled.textarea에 height: 32px 두 번 중복 선언 → 한 번만
 */
const CommentInput = forwardRef<HTMLTextAreaElement, CommentInputProps>(
  ({ setReset, placeholder, value, onChange, 'aria-label': ariaLabel }, ref) => {
    const [focused, setFocused] = useState(false);

    useEffect(() => {
      if (!focused && value === '') {
        setReset();
      }
    }, [focused, value]);

    const canSubmit = value !== '';

    return (
      <div
        className="w-full rounded-[30px] flex items-center p-2 min-h-12 max-h-[100px] h-auto box-border"
        style={{
          boxShadow: `0 0 0 1px ${focused ? 'rgba(62, 141, 0, 1)' : 'rgba(205, 205, 205, 1)'} inset`,
          backgroundColor: focused ? 'rgba(252, 255, 250, 1)' : 'white',
        }}
      >
        <textarea
          ref={ref}
          aria-label={ariaLabel ?? '댓글 입력'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          className="flex-1 w-full border-none outline-none bg-transparent h-8 text-base font-normal leading-[22px] font-[Pretendard] px-4 py-[5px] resize-none overflow-y-auto"
        />
        <button
          type="submit"
          aria-label="댓글 등록"
          className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-keycolor)] focus-visible:ring-offset-2"
          style={{
            backgroundColor: canSubmit ? 'rgba(62, 141, 0, 1)' : 'rgba(205, 205, 205, 1)',
          }}
        >
          <UpArrowIcon />
        </button>
      </div>
    );
  }
);

CommentInput.displayName = 'CommentInput';

export default CommentInput;
