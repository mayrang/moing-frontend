'use client';

import Warning from '@/shared/ui/icons/Warning';
import React, { useEffect } from 'react';

interface ErrorToastProps {
  isShow: boolean;
  message?: string;
  onHide: () => void;
}

/**
 * 에러 토스트 컴포넌트.
 * Portal 없이 직접 렌더링 (fixed 포지션).
 *
 * Refactoring notes (FSD 위반 제거):
 * - Before: errorStore / errorToastUI Zustand 스토어를 직접 import → shared가 상위 레이어에 의존
 * - After: isShow / message / onHide props 기반으로 변경 → 순수 UI 컴포넌트
 * - 스토어 연결은 사용처(feature/widget)에서 담당
 *
 * Bug fix:
 * - 404 에러는 별도 페이지에서 처리하므로 toast 숨김 (원본 로직 유지, props로 message 받아 처리)
 */
export default function ErrorToast({ isShow, message, onHide }: ErrorToastProps) {
  useEffect(() => {
    if (!isShow) return;
    const timer = setTimeout(() => onHide(), 1500);
    return () => clearTimeout(timer);
  }, [isShow]);

  const is404 = message?.includes('404') ?? false;
  const visible = isShow && !is404;

  return (
    <div
      className="pointer-events-none fixed left-0 flex w-full justify-center transition-[bottom,opacity] duration-400 ease-in-out"
      style={{
        bottom: visible ? '250px' : '-100px',
        opacity: visible ? 1 : 0,
        zIndex: 1000,
      }}
    >
      <div
        className="absolute bottom-[50px] flex h-[42px] items-center justify-center rounded-[20px] px-4 py-[10px]"
        style={{ backgroundColor: 'rgba(26, 26, 26, 1)' }} // palette.기본
      >
        <Warning />
        <span className="ml-2 text-base font-normal leading-[22.4px] text-white">
          {message}
        </span>
      </div>
    </div>
  );
}
