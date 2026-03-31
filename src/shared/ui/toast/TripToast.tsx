'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface TripToastProps {
  isShow: boolean;
  setIsMapFull: React.Dispatch<React.SetStateAction<boolean>> | ((bool: boolean) => void);
  setModalHeight: React.Dispatch<React.SetStateAction<number>> | ((number: number) => void);
  bottom?: string;
  height?: number;
}

/**
 * 여행 일정 추가 유도 토스트 (클릭 가능).
 * 자동 숨김 타이머 없음 - 클릭으로만 상호작용.
 *
 * Refactoring notes:
 * - Bug fix: height prop을 받지만 내부에서 36px 하드코딩 → 실제 prop 적용
 * - Emotion → Tailwind + inline style
 */
export default function TripToast({
  isShow,
  setIsMapFull,
  setModalHeight,
  bottom = '120px',
  height = 36,
}: TripToastProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const portalTarget = mounted ? document.getElementById('trip-toast') : null;
  if (!portalTarget) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed left-0 flex w-full justify-center transition-opacity duration-400 ease-in-out"
      style={{
        bottom: isShow ? bottom : '-100px',
        opacity: isShow ? 1 : 0,
        zIndex: 100,
      }}
    >
      <button
        type="button"
        className="pointer-events-auto absolute bottom-0 flex cursor-pointer items-center justify-center gap-2 rounded-[30px] px-4 py-2"
        style={{
          height: `${height}px`, // Bug fix: 원본 하드코딩 36px → prop 적용
          backgroundColor: 'rgba(26, 26, 26, 1)', // palette.기본
        }}
        onClick={() => {
          setModalHeight(0);
          setIsMapFull(true);
        }}
      >
        <span className="mr-2 text-sm font-normal leading-5 text-white">
          ✨ 여행 일정을 추가해 보세요
        </span>
        <svg width="9" height="6" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 1L4.5 5L0.5 1" stroke="white" strokeLinecap="round" />
        </svg>
      </button>
    </div>,
    portalTarget
  );
}
