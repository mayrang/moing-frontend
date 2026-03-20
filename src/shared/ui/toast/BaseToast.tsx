'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BaseToastProps {
  isShow: boolean;
  setIsShow: ((bool: boolean) => void) | React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
  icon: React.ReactNode;
  portalId: string;
  bottom?: string;
  height?: number;
  zIndex?: number;
  bgColor?: string;
}

/**
 * ResultToast / WarningToast 공통 베이스.
 * 아이콘과 포털 ID만 달라지므로 조합(composition)으로 재사용.
 *
 * Refactoring notes:
 * - ResultToast / WarningToast 중복 제거 (유일한 차이: icon)
 * - Emotion styled → Tailwind + inline style (상태 기반 bottom/opacity)
 */
export default function BaseToast({
  isShow,
  setIsShow,
  text,
  icon,
  portalId,
  bottom = '20px',
  height = 20,
  zIndex = 4000,
  bgColor = 'rgba(62, 141, 0, 1)', // palette.keycolor
}: BaseToastProps) {
  useEffect(() => {
    if (!isShow) return;
    const timer = setTimeout(() => setIsShow(false), 1500);
    return () => clearTimeout(timer);
  }, [isShow]);

  const portalTarget =
    typeof document !== 'undefined' ? document.getElementById(portalId) : null;
  if (!portalTarget) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed left-0 flex w-full justify-center transition-[bottom,opacity] duration-400 ease-in-out"
      style={{
        bottom: isShow ? bottom : '-100px',
        opacity: isShow ? 1 : 0,
        zIndex,
      }}
    >
      <div
        className="absolute flex h-[42px] items-center justify-center rounded-[20px] px-4 py-[10px]"
        style={{ bottom: `${height}px`, backgroundColor: bgColor }}
      >
        {icon}
        <span className="ml-2 text-base font-normal leading-[22.4px] text-white">
          {text}
        </span>
      </div>
    </div>,
    portalTarget
  );
}
