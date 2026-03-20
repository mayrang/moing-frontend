'use client';

import RightVector from '@/components/icons/RightVector';

interface TextButtonProps {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  text: React.ReactNode;
  isRightVector: boolean;
  rightText?: string;
  isLeftVector: boolean;
  leftIconSrc?: string;
  titleWeight?: 'regular' | 'semibold';
}

/**
 * 텍스트 + 화살표로 이루어진 리스트 항목 버튼.
 * 기존 버그 수정: opacity: 0px → 제거
 * onClick 타입 수정: MouseEvent → React.MouseEventHandler<HTMLDivElement>
 */
const TextButton = ({
  onClick,
  isRightVector,
  text,
  rightText = '',
  leftIconSrc = '',
  isLeftVector,
  titleWeight = 'regular',
}: TextButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={[
        'box-border flex h-[52px] w-full cursor-pointer items-center justify-between',
        'px-2 py-[14px]',
        'transition-[background-color] duration-200 ease-in-out',
        'hover:bg-[var(--color-button-hover)] active:bg-[var(--color-button-active)]',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        {isLeftVector && (
          <img
            src={leftIconSrc === '' ? '/images/createTripBtn.png' : leftIconSrc}
            alt="icon"
          />
        )}
        <span
          className={[
            'text-center font-pretendard text-base leading-4 tracking-[-0.25px] text-[var(--color-text-base)]',
            titleWeight === 'semibold' ? 'font-semibold' : 'font-medium',
          ].join(' ')}
        >
          {text}
        </span>
      </div>
      <div className="flex items-center justify-between">
        {rightText !== '' && (
          <span className="mr-2 text-center text-base font-normal leading-4 text-[var(--color-text-muted)]">
            {rightText}
          </span>
        )}
        {isRightVector && (
          <div className="px-[9px] py-2">
            <RightVector />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextButton;
