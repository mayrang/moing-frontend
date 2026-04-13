'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const BottomModal = ({
  children,
  closeModal,
  initialHeight,
  backdropClick,
}: {
  children: React.ReactNode;
  closeModal: () => void;
  backdropClick?: () => void;
  initialHeight: number | string;
}) => {
  const [touchY, setTouchY] = useState(0);
  const [modalHeight, setModalHeight] = useState(initialHeight);
  const [isClosing, setIsClosing] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 포커스 저장 및 모달 내 첫 focusable 요소로 포커스 이동
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();
    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  // Escape 키 닫기 + Focus Trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsClosing(true);
        setTimeout(() => {
          if (backdropClick) backdropClick();
          else closeModal();
        }, 300);
        return;
      }
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    },
    [backdropClick, closeModal]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height =
        typeof modalHeight === 'string' ? modalHeight : `${modalHeight}%`;
    }
  }, [modalHeight]);

  useEffect(() => {
    if (contentRef.current) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!windowHeight) return;
    const currentY = e.changedTouches[0].pageY;
    const newHeight = Math.max(0, Math.min(100, 100 - (currentY / windowHeight) * 100));
    setModalHeight(newHeight);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchY(e.changedTouches[0].pageY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!windowHeight) return;
    const distanceY = e.changedTouches[0].pageY - touchY;
    const percentMoved = Math.abs(distanceY) / windowHeight;
    if (distanceY > 0 && percentMoved > 0.2) {
      setIsClosing(true);
      setTimeout(() => {
        if (backdropClick) backdropClick();
        else closeModal();
      }, 300);
    } else {
      setModalHeight(100);
    }
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[1005] bg-black/40 min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 w-full"
        onClick={(e) => {
          e.stopPropagation();
          setIsClosing(true);
          setTimeout(() => {
            if (backdropClick) backdropClick();
            else closeModal();
          }, 200);
        }}
        aria-hidden="true"
      >
        <div
          ref={contentRef}
          onClick={handleContentClick}
          className={[
            'w-full flex flex-col bottom-0 left-0 fixed max-h-full',
            'min-[440px]:w-[390px]',
            'z-[2001] rounded-t-[20px] bg-white',
            isClosing
              ? 'animate-[slideDownMobile_0.3s_ease-out_forwards]'
              : 'animate-[slideUpMobile_0.3s_ease-out_forwards]',
            'transition-all duration-100 ease-out',
          ].join(' ')}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex py-[2.84svh] relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="h-[3px] w-[54px] absolute top-1/2 left-1/2 -translate-x-1/2 bg-[rgba(205,205,205,1)] rounded-full" />
          </div>
          {children}
        </div>
      </div>
    </>,
    document.getElementById('end-modal') as HTMLElement
  );
};

export default BottomModal;
