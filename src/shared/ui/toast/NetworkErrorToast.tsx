'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { errorToastStore } from '@/shared/lib/errors/errorToastStore';

/**
 * 네트워크/시스템 에러 전용 토스트.
 * - onRetry가 있으면 "다시 시도" 버튼 포함
 * - onRetry가 없으면 일반 메시지 토스트
 * - WarningToast와 달리 자동 닫힘 없음 (retry는 사용자가 명시적으로 처리)
 *
 * 사용: app/layout.tsx 또는 RootLayout에서 한 번만 렌더링
 */
export default function NetworkErrorToast() {
  const { message, onRetry, dismiss } = errorToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isShow = !!message;
  const portalTarget = mounted ? document.getElementById('result-toast') : null;
  if (!portalTarget) return null;

  return createPortal(
    <div
      className="fixed left-0 flex w-full justify-center transition-[bottom,opacity] duration-400 ease-in-out"
      style={{
        bottom: isShow ? '20px' : '-100px',
        opacity: isShow ? 1 : 0,
        zIndex: 4000,
        pointerEvents: isShow ? 'auto' : 'none',
      }}
    >
      <div
        className="absolute flex items-center justify-center gap-3 rounded-[20px] px-4 py-[10px]"
        style={{ bottom: '20px', backgroundColor: 'rgba(62, 141, 0, 1)' }}
      >
        {/* 경고 아이콘 */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="9" r="9" fill="#FDFDFD" />
          <rect x="7.5" y="3" width="3" height="8" rx="1.5" fill="#3E8D00" />
          <rect x="7.5" y="12.5703" width="3" height="3" rx="1.5" fill="#3E8D00" />
        </svg>
        <span className="text-base font-normal leading-[22.4px] text-white">{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={() => { onRetry(); dismiss(); }}
            className="rounded-[12px] bg-white px-3 py-1 text-sm font-semibold text-[rgba(62,141,0,1)] active:opacity-70"
            aria-label="네트워크 오류 다시 시도"
          >
            다시 시도
          </button>
        )}
        {!onRetry && (
          <button
            type="button"
            onClick={dismiss}
            className="ml-1 text-white opacity-70 active:opacity-100"
            aria-label="토스트 닫기"
          >
            ✕
          </button>
        )}
      </div>
    </div>,
    portalTarget
  );
}
