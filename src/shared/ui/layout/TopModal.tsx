'use client';
import React, { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import TripToast from '@/shared/ui/toast/TripToast';
import { tripPlanStore } from '@/store/client/tripPlanStore';

const TopModal = ({
  children,
  onHeightChange,
  setIsMapFull,
  containerRef,
  isToastShow,
}: {
  children: React.ReactNode;
  onHeightChange: (height: number) => void;
  setIsMapFull: (bool: boolean) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  isToastShow: boolean;
}) => {
  const touchStartY = useRef<number | null>(null);
  const { isChange } = tripPlanStore();
  const [startY, setStartY] = useState(0);
  const [modalHeight, setModalHeight] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const firstTop = useRef(false);

  const SCROLL_THRESHOLD = 30;
  const scrollAttempts = useRef(0);

  const handleInteraction = useCallback(
    (deltaY: number) => {
      const container = containerRef.current;
      if (!container) return;
      const isAtTop = container.scrollTop === 0;
      const isScrollingUp = deltaY < 0;
      if (modalHeight === 0 && isAtTop && isScrollingUp) {
        scrollAttempts.current += Math.abs(deltaY);
        if (scrollAttempts.current > SCROLL_THRESHOLD) {
          setModalHeight(contentHeight);
          setIsMapFull(false);
          onHeightChange(contentHeight);
          scrollAttempts.current = 0;
        }
      } else {
        scrollAttempts.current = 0;
      }
    },
    [modalHeight, contentHeight, onHeightChange]
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const isAtTop = container.scrollTop === 0;
      const isScrollingUp = event.deltaY < 0;
      if (modalHeight === 0 && isAtTop && isScrollingUp) {
        event.preventDefault();
        scrollAttempts.current += Math.abs(event.deltaY);
        if (scrollAttempts.current > SCROLL_THRESHOLD) {
          setModalHeight(contentHeight);
          setIsMapFull(false);
          onHeightChange(contentHeight);
          scrollAttempts.current = 0;
        }
      } else {
        scrollAttempts.current = 0;
      }
    },
    [modalHeight]
  );

  const handleTouchStart = useCallback((event: TouchEvent) => {
    touchStartY.current = event.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      event.preventDefault();
      if (touchStartY.current === null) return;
      const deltaY = touchStartY.current - event.touches[0].clientY;
      handleInteraction(deltaY);
      touchStartY.current = event.touches[0].clientY;
    },
    [handleInteraction]
  );

  useEffect(() => {
    if (isChange) {
      setTimeout(() => {
        setModalHeight(0);
        setIsMapFull(true);
        onHeightChange(0);
      }, 200);
    }
  }, [isChange, setIsMapFull, onHeightChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('wheel', handleWheel);
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [handleWheel, handleTouchStart, handleTouchMove]);

  const handleScroll = useCallback(
    (e: Event) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;
      const currentScrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const modalHeightPercentage = (modalHeight / clientHeight) * 100;
      const scrollPercentage = (currentScrollTop / (scrollHeight - clientHeight)) * 100;
      if (scrollPercentage >= modalHeightPercentage) {
        contentRef.current?.style.setProperty('transition', 'height 0.3s ease-in-out, transform 0.3s ease-in-out');
        setModalHeight(0);
        setIsMapFull(true);
        onHeightChange(48 + currentScrollTop);
        setTimeout(() => {
          if (firstTop.current === false) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
            firstTop.current = true;
          }
        }, 100);
      } else if (scrollPercentage < modalHeightPercentage) {
        if (firstTop.current) firstTop.current = false;
        contentRef.current?.style.setProperty('transition', 'transform 0.3s ease-in-out');
        const newHeight = Math.max(0, modalHeight * (1 - scrollPercentage / modalHeightPercentage));
        setModalHeight(newHeight);
        onHeightChange(Math.max(48, newHeight + currentScrollTop));
      }
      setLastScrollTop(currentScrollTop);
    },
    [modalHeight]
  );

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('scroll', handleScroll);
      return () => currentContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    setIsClient(true);
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (childrenRef.current?.firstChild) {
      const childHeight = (childrenRef.current?.firstChild as HTMLDivElement)?.getBoundingClientRect().height;
      const h = childHeight ? childHeight + 48 : 0;
      setModalHeight(h);
      setContentHeight(h);
      onHeightChange(h);
    }
  }, [(childrenRef.current?.firstChild as HTMLDivElement)?.getBoundingClientRect().height]);

  useEffect(() => {
    if (contentRef.current) setContentHeight(contentRef.current?.getBoundingClientRect().height);
  }, [contentRef.current]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.style.height = `${modalHeight}px`;
  }, [modalHeight]);

  useEffect(() => {
    if (contentRef.current) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape 키로 패널 접기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalHeight > 0) {
        setModalHeight(0);
        setIsMapFull(true);
        onHeightChange(0);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalHeight, setIsMapFull, onHeightChange]);

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    contentRef.current?.style.setProperty('transition', 'height 0.3s ease-in-out, transform 0.3s ease-in-out');
    if ('touches' in e) setStartY(e.touches[0].pageY);
    else setStartY(e.pageY);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !windowHeight) return;
    let currentY: number;
    if ('touches' in e) currentY = e.touches[0].pageY;
    else currentY = e.pageY;
    const newHeight = Math.max(0, Math.min(contentHeight, currentY - 116));
    setModalHeight(newHeight);
  };

  const handleDragEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDragging || !windowHeight) return;
      setIsDragging(false);
      let endY: number;
      if ('changedTouches' in e) endY = e.changedTouches[0].pageY;
      else endY = e.pageY;
      const distanceY = endY - startY;
      if (distanceY < 0) {
        firstTop.current = true;
        setModalHeight(0);
        setIsMapFull(true);
        onHeightChange(48);
      } else {
        firstTop.current = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setModalHeight(contentHeight);
        setIsMapFull(false);
        onHeightChange(contentHeight);
      }
    },
    [isDragging, windowHeight, startY, contentHeight, onHeightChange]
  );

  useEffect(() => {
    if (childrenRef.current) {
      childrenRef.current.addEventListener('scroll', (e) => e.stopPropagation());
    }
  }, [childrenRef.current]);

  if (!isClient || typeof window === 'undefined') return null;

  return (
    <>
      <div
        id="top-scroll"
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label="여행 계획 패널"
        onClick={handleContentClick}
        className={[
          'w-full overflow-hidden flex flex-col relative',
          'min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2',
          'z-[1000] fixed min-h-[48px] left-0',
          'rounded-b-[20px] bg-white pb-12',
          'transition-[height,transform] duration-300 ease-out',
          'shadow-[0px_3px_0_0_rgba(170,170,170,0.15)]',
        ].join(' ')}
        style={{ maxHeight: window.innerHeight - 280 }}
      >
        <div
          ref={childrenRef}
          className="overflow-auto overscroll-none"
          style={{ maxHeight: window.innerHeight - 308 }}
        >
          {children}
        </div>
        <div
          className="flex py-[2.84svh] absolute h-12 w-full bottom-0 bg-white"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div className="h-[3px] w-[54px] absolute top-1/2 left-1/2 -translate-x-1/2 bg-[rgba(205,205,205,1)] rounded-full" />
        </div>
      </div>
      <TripToast setModalHeight={setModalHeight} isShow={isToastShow} setIsMapFull={setIsMapFull} />
    </>
  );
};

export default TopModal;
