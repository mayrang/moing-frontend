'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ModalDimmed from './ModalDimmed';

interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  portalId?: string;
  /** 모달 제목 요소 ID (aria-labelledby 연결용). */
  labelId?: string;
  /** 모달 접근성 이름 (제목 요소가 없을 때 aria-label 직접 지정). */
  'aria-label'?: string;
}

/**
 * 바텀시트 모달 베이스.
 * EditAndDeleteModal / ReportModal 공통 래퍼.
 *
 * Refactoring notes:
 * - window.innerWidth 직접 사용 → Tailwind w-[calc(100%-48px)] max-w-[342px] 으로 대체 (SSR 안전)
 * - isListening 패턴 제거 (window.innerWidth 의존성 제거로 불필요해짐)
 *
 * Accessibility notes (Phase 1.5):
 * - role="dialog", aria-modal="true" 추가
 * - Escape 키로 모달 닫기, focus trap 적용
 */
export default function BottomSheetModal({
  isOpen,
  onClose,
  children,
  portalId = 'end-modal',
  labelId,
  'aria-label': ariaLabel,
}: BottomSheetModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Escape 닫기 + focus trap
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  const portalTarget =
    typeof document !== 'undefined' ? document.getElementById(portalId) : null;
  if (!portalTarget) return null;

  return createPortal(
    <div
      className={[
        'fixed inset-0 flex h-svh w-full justify-center z-1001',
        'transition-[opacity,visibility] duration-300 ease-in-out whitespace-pre-line',
        isOpen ? 'visible opacity-100' : 'invisible opacity-0',
      ].join(' ')}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        aria-label={!labelId ? ariaLabel : undefined}
        className={[
          'pointer-events-auto absolute bottom-10 z-1003 rounded-[20px] pt-6',
          'w-[calc(100%-48px)] max-w-[342px]',
          'transition-[transform,opacity] duration-300 ease-in-out',
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-[30%] opacity-0',
        ].join(' ')}
      >
        {children}
      </div>
      <ModalDimmed onClick={onClose} />
    </div>,
    portalTarget
  );
}
