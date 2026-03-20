'use client';

import React from 'react';
import BaseToast from './BaseToast';

interface WarningToastProps {
  isShow: boolean;
  setIsShow: React.Dispatch<React.SetStateAction<boolean>> | ((bool: boolean) => void);
  text: string;
  bottom?: string;
  height?: number;
}

// Bug fix: 원본에서 clip-path (소문자) → clipPath (JSX camelCase)
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4770_26768)">
      <circle cx="9" cy="9" r="9" fill="#FDFDFD" />
      <rect x="7.5" y="3" width="3" height="8" rx="1.5" fill="#3E8D00" />
      <rect x="7.5" y="12.5703" width="3" height="3" rx="1.5" fill="#3E8D00" />
    </g>
    <defs>
      <clipPath id="clip0_4770_26768">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

/**
 * 경고/안내 토스트.
 * BaseToast + InfoIcon 조합.
 *
 * Refactoring notes:
 * - Bug fix: clip-path (소문자) → clipPath (React JSX camelCase)
 * - ResultToast와 중복 제거 → BaseToast 컴포지션
 */
export default function WarningToast({ isShow, setIsShow, text, bottom, height }: WarningToastProps) {
  return (
    <BaseToast
      isShow={isShow}
      setIsShow={setIsShow}
      text={text}
      icon={<InfoIcon />}
      portalId="result-toast"
      bottom={bottom}
      height={height}
    />
  );
}
