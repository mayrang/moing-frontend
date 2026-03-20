'use client';

import React from 'react';
import BaseToast from './BaseToast';

interface ResultToastProps {
  isShow: boolean;
  setIsShow: React.Dispatch<React.SetStateAction<boolean>> | ((bool: boolean) => void);
  text: string;
  bottom?: string;
  height?: number;
}

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="18" height="18" rx="9" fill="#FDFDFD" />
    <path
      d="M5.40002 9.23286L8.3329 12.1657L13.221 6.29999"
      stroke="rgba(62, 141, 0, 1)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 성공 결과 토스트.
 * BaseToast + CheckIcon 조합.
 *
 * Refactoring notes:
 * - Before: ResultToast / WarningToast 각각 동일한 styled-components 중복
 * - After: BaseToast 컴포지션으로 중복 제거 (차이는 icon 뿐)
 */
export default function ResultToast({ isShow, setIsShow, text, bottom, height }: ResultToastProps) {
  return (
    <BaseToast
      isShow={isShow}
      setIsShow={setIsShow}
      text={text}
      icon={<CheckIcon />}
      portalId="result-toast"
      bottom={bottom}
      height={height}
    />
  );
}
