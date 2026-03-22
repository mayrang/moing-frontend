'use client';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import React from 'react';
import Slider from 'react-slick';
import ButtonContainer from './ButtonContainer';
import Button from '@/shared/ui/button/Button';
import { useRouter, usePathname } from 'next/navigation';
import { authStore } from '@/store/client/authStore';

interface ThreeRowCarouselProps {
  children: ReactNode;
  currentSlideNumber?: number;
  setCurrentSlideNumber?: (slideNumber: number) => void | React.Dispatch<React.SetStateAction<boolean>>;
  itemCountProp?: number;
  rowsProp?: number;
  needNextBtn?: boolean;
}

function throttle(func: Function, limit: number) {
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  return function (...args: unknown[]) {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

const ThreeRowCarousel = ({
  children,
  itemCountProp = 3,
  rowsProp = 3,
  needNextBtn = false,
}: ThreeRowCarouselProps) => {
  const settings = useMemo(() => {
    const itemCount = React.Children.count(children);
    return {
      dots: itemCount > itemCountProp,
      infinite: false,
      rows: rowsProp,
      slidesToShow: 1,
      slidesToScroll: 1,
      dotsClass: 'dots-custom',
    };
  }, [children]);

  const { accessToken } = authStore();
  const slickRef = useRef<Slider>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [currentSlideNumber, setCurrentSlideNumber] = useState(0);

  const handleNext = useCallback(
    throttle(() => {
      setCurrentSlideNumber((n) => n + 1);
      slickRef.current?.slickNext();
    }, 300),
    []
  );

  const onClickNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.id === '다음') {
      handleNext();
    } else {
      setTimeout(() => router.push('/'), 300);
    }
  };

  const onClickSkip = () => router.push('/');

  return (
    <div
      className="flex items-center bg-white rounded-[20px] pb-6 -mr-6 w-full overflow-hidden"
      style={{ marginTop: pathname === '/onBoardingOne' ? '0px' : '12px' }}
    >
      <div
        className="w-full"
        style={{
          marginBottom: pathname === '/onBoardingOne' ? '32px' : '0',
          paddingTop: pathname === '/onBoardingOne' ? '0px' : '6px',
        }}
      >
        <Slider
          beforeChange={(currentSlide: number, nextSlide: number) => setCurrentSlideNumber(nextSlide)}
          ref={slickRef}
          {...settings}
        >
          {children}
        </Slider>
        {needNextBtn && (
          <ButtonContainer>
            <div className="w-full flex flex-col items-center">
              <Button
                onClick={onClickNext}
                text={currentSlideNumber === 2 ? '시작하기' : '다음'}
                addStyle={{
                  backgroundColor: 'var(--color-keycolor)',
                  color: 'var(--color-bg)',
                  boxShadow: '-2px 4px 5px 0px rgba(170, 170, 170, 0.1)',
                }}
              />
              <button
                type="button"
                className="font-sans text-base font-normal leading-[22.4px] text-[rgba(171,171,171,1)] underline"
                onClick={onClickSkip}
                style={{ marginTop: '16px', padding: '10px' }}
              >
                건너뛰기
              </button>
            </div>
          </ButtonContainer>
        )}
      </div>
    </div>
  );
};

export default ThreeRowCarousel;
