'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const MapBottomModal = ({
  children,
  initialHeight,
}: {
  children: React.ReactNode;
  initialHeight: number;
}) => {
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [modalHeight, setModalHeight] = useState(initialHeight);
  const [windowHeight, setWindowHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = `${modalHeight}px`;
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

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    if ('touches' in e) {
      setStartY(e.touches[0].pageY);
    } else {
      setStartY(e.pageY);
    }
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !windowHeight) return;

    let currentY: number;
    if ('touches' in e) {
      currentY = e.touches[0].pageY;
    } else {
      currentY = e.pageY;
    }

    const newHeight = Math.max(0, windowHeight - currentY);
    setModalHeight(newHeight);
  };

  const handleDragEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDragging || !windowHeight) return;

      setIsDragging(false);
      let endY: number;
      if ('changedTouches' in e) {
        endY = e.changedTouches[0].pageY;
      } else {
        endY = e.pageY;
      }

      const distanceY = endY - startY;

      if (distanceY < 0) {
        setModalHeight(initialHeight);
      } else {
        setModalHeight(0);
      }
    },
    [isDragging, windowHeight, startY, initialHeight],
  );

  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      ref={contentRef}
      className="w-full flex flex-col overflow-hidden min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 z-[1000] fixed max-h-full min-h-12 left-0 bottom-0 rounded-tl-[20px] rounded-tr-[20px] bg-white pb-12 transition-[height,transform] duration-300 ease-out shadow-[0px_3px_0_0_rgba(170,170,170,0.15)]"
      onClick={handleContentClick}
    >
      <div
        className="flex py-[2.84svh] absolute top-0 z-[5] left-0 right-0 bg-[var(--color-bg)]"
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div className="h-[3px] w-[54px] absolute top-1/2 left-1/2 -translate-x-1/2 bg-[rgba(205,205,205,1)]" />
      </div>
      {children}
    </div>,
    document.getElementById('end-modal') as HTMLElement,
  );
};

export default MapBottomModal;
