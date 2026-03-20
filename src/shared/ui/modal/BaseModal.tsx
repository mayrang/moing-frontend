'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ModalDimmed from './ModalDimmed';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  portalId?: string;
  height?: number;
  zIndex?: number;
  /** 모달 제목 요소 ID (aria-labelledby 연결용). 모달 내부 제목에 이 id를 부여하면 됩니다. */
  labelId?: string;
}

/**
 * 중앙 다이얼로그 모달 베이스.
 * CheckingModal / NoticeModal / ResultModal 공통 래퍼.
 *
 * Refactoring notes:
 * - 3개 모달의 ModalContainer + Modal + DarkWrapper 중복 제거
 * - Bug fix: opacity: 0px (CSS 무효 단위) → opacity: 0 / translateY 트랜지션
 * - Bug fix: white-space: "pre-line" (JS 문자열로 감싸져 무효) → whitespace-pre-line Tailwind 클래스
 *
 * Accessibility notes (Phase 1.5):
 * - role="dialog", aria-modal="true" 추가
 * - aria-labelledby: 모달 내부 제목 요소 ID 연결
 * - Escape 키로 모달 닫기
 * - focus trap: 모달 열릴 때 첫 번째 포커스 가능 요소로 이동, 닫힐 때 복귀
 */
export default function BaseModal({
  isOpen,
  onClose,
  children,
  portalId = 'checking-modal',
  height = 196,
  zIndex = 1001,
  labelId,
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Escape 닫기 + focus trap
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    // 첫 번째 포커스 가능 요소로 이동
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Tab focus trap
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
  if (!portalTarget || !isOpen) return null;

  return createPortal(
    <div
      className={[
        'pointer-events-none fixed inset-0 flex items-center justify-center px-[45px]',
        'transition-[opacity,visibility] duration-300 ease-in-out whitespace-pre-line',
        isOpen ? 'visible opacity-100' : 'invisible opacity-0',
      ].join(' ')}
      style={{ zIndex }}
    >
      <ModalDimmed onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        onClick={(e) => e.stopPropagation()}
        className={[
          'pointer-events-auto absolute w-75 bg-white rounded-[20px] z-1003 pt-6',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-y-0' : 'translate-y-[30%]',
        ].join(' ')}
        style={{ height: `${height}px` }}
      >
        {children}
      </div>
    </div>,
    portalTarget
  );
}
