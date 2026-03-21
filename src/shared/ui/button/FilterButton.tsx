'use client';

import ResetIcon from '@/shared/ui/icons/ResetIcon';
import Button from './Button';

interface FilterButtonProps {
  text: string;
  type?: 'button' | 'reset' | 'submit';
  children?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  initializeOnClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * 필터 버튼 (리셋 아이콘 + 메인 버튼).
 * Button 컴포넌트를 내부에서 재사용.
 * 기존 오타 intializeOnClick → initializeOnClick 수정.
 */
const FilterButton = ({
  text = '다음',
  type = 'submit',
  disabled = false,
  children,
  style,
  onClick,
  initializeOnClick,
}: FilterButtonProps) => {
  return (
    <div className="flex w-full items-center justify-center gap-4">
      <button
        type="button"
        aria-label="초기화"
        onClick={initializeOnClick}
        className="cursor-pointer border-none bg-transparent"
      >
        <ResetIcon />
      </button>
      <Button
        text={text}
        type={type}
        disabled={disabled}
        onClick={onClick}
        style={style}
      >
        {children}
      </Button>
    </div>
  );
};

export default FilterButton;
