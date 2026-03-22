'use client';
import { cn } from '@/shared/lib/cn';
import useKeyboardResizeEffect from '@/hooks/useKeyboardResizeEffect';
import React from 'react';

interface ButtonContainerProps {
  children: React.ReactNode;
  paddingBottom?: number;
  paddingTop?: number;
  blur?: string;
  isWithdrawal?: boolean;
  backgroundColor?: string;
}

const ButtonContainer = ({
  children,
  paddingBottom = 40,
  paddingTop = 16,
  blur,
  isWithdrawal = false,
  backgroundColor = 'var(--color-bg)',
}: ButtonContainerProps) => {
  useKeyboardResizeEffect();
  return (
    <div
      className={cn(
        'flex items-center gap-4 left-0 bottom-0 fixed w-full',
        'h-[104px] px-6',
        'max-[440px]:w-full',
        'min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2',
        isWithdrawal && 'flex-col',
      )}
      style={{
        backgroundColor,
        backdropFilter: blur ?? 'none',
        paddingTop,
        paddingBottom,
      }}
    >
      {children}
    </div>
  );
};

export default ButtonContainer;
