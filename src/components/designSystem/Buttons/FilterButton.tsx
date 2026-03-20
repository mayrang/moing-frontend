// 이 파일은 하위 호환성을 위해 유지됩니다.
// 실제 구현은 @/shared/ui/button/FilterButton 에 있습니다.
// API 변경: intializeOnClick(오타) → initializeOnClick 수정됨
import FilterButton from '@/shared/ui/button/FilterButton';
import React from 'react';

interface LegacyFilterButtonProps {
  text: string;
  addStyle?: {
    backgroundColor?: string;
    color?: string;
    boxShadow?: string;
    weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  };
  type?: 'button' | 'reset' | 'submit';
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  intializeOnClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function LegacyFilterButton({
  text,
  type,
  disabled,
  children,
  addStyle,
  onClick,
  intializeOnClick,
}: LegacyFilterButtonProps) {
  return (
    <FilterButton
      text={text}
      type={type}
      disabled={disabled}
      onClick={onClick}
      initializeOnClick={intializeOnClick}
      style={addStyle}
    >
      {children}
    </FilterButton>
  );
}
