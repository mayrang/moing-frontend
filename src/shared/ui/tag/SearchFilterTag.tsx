'use client';

import { forwardRef } from 'react';
import { usePathname } from 'next/navigation';

interface SearchFilterTagProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  iconPosition?: 'start' | 'end';
  idx: number;
  active?: boolean;
  icon?: React.ReactNode;
  addStyle?: React.CSSProperties;
}

/**
 * 검색 필터 태그 버튼.
 * active 상태에 따라 배경색/테두리가 변경됨.
 * TODO: isCreateTrip 페이지 의존 로직은 추후 FSD features 레이어에서 처리 필요
 */
const SearchFilterTag = forwardRef<HTMLButtonElement, SearchFilterTagProps>(
  (
    {
      text,
      idx,
      active = false,
      onClick,
      disabled = false,
      icon,
      iconPosition = 'start',
      addStyle,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname();
    const isCreateTrip = pathname === '/createTripDetail';

    const defaultStyle: React.CSSProperties = {
      backgroundColor: active ? '#E3EFD9' : 'rgba(245, 245, 245, 1)',
      color: active ? 'rgba(62, 141, 0, 1)' : 'rgba(26, 26, 26, 1)',
      boxShadow: active ? `0 0 0 1px rgba(62, 141, 0, 1) inset` : 'none',
      ...addStyle,
    };

    return (
      <button
        ref={ref}
        id={`${idx}`}
        disabled={disabled}
        onClick={onClick}
        style={defaultStyle}
        className={[
          'flex min-w-fit cursor-pointer items-center gap-2 whitespace-nowrap',
          'box-border rounded-[16px] px-[14px] py-2',
          'border-none text-sm font-semibold leading-[17px]',
          'transition-[background-color] duration-300 ease-in-out',
          isCreateTrip ? 'h-[42px] leading-[22px]' : '',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {iconPosition === 'start' && icon}
        <span className="overflow-hidden text-ellipsis transition-all duration-200 ease-in-out">
          {text}
        </span>
        {iconPosition === 'end' && icon}
      </button>
    );
  }
);

export default SearchFilterTag;
