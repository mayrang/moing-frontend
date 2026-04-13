'use client';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const { accessToken } = authStore();
  const slickRef = useRef<Slider>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [currentSlideNumber, setCurrentSlideNumber] = useState(0);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // aria-hidden="true" 슬라이드 안의 포커스 가능 요소를 inert로 차단 (접근성)
  // slick은 초기화 시 aria-hidden을 DOM 생성과 동시에 부여하므로
  // onInit 콜백 + MutationObserver 조합으로 초기 및 슬라이드 변경 시 모두 처리
  const updateInert = useCallback(() => {
    const container = sliderContainerRef.current;
    if (!container) return;
    container.querySelectorAll<HTMLElement>('.slick-slide[aria-hidden="true"]').forEach((slide) => {
      slide.setAttribute('inert', '');
      // axe-core aria-hidden-focus 규칙 대응: inert 외 tabindex=-1 직접 설정
      slide.querySelectorAll<HTMLElement>('a, button, input, select, textarea, [tabindex]').forEach((el) => {
        el.setAttribute('tabindex', '-1');
      });
    });
    container.querySelectorAll<HTMLElement>('.slick-slide:not([aria-hidden="true"])').forEach((slide) => {
      slide.removeAttribute('inert');
      slide.querySelectorAll<HTMLElement>('a, button, input, select, textarea').forEach((el) => {
        el.removeAttribute('tabindex');
      });
    });
  }, []);

  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    // 초기 실행: slick이 onInit보다 늦게 aria-hidden을 세팅하는 경우 대비
    updateInert();
    const timer = setTimeout(updateInert, 50);
    const observer = new MutationObserver(updateInert);
    observer.observe(container, { attributes: true, subtree: true, attributeFilter: ['aria-hidden'] });
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [updateInert]);

  const settings = useMemo(() => {
    const itemCount = React.Children.count(children);
    return {
      dots: itemCount > itemCountProp,
      infinite: false,
      rows: rowsProp,
      slidesToShow: 1,
      slidesToScroll: 1,
      dotsClass: 'dots-custom',
      onInit: updateInert,
      afterChange: updateInert,
    };
  }, [children, itemCountProp, rowsProp, updateInert]);

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
        ref={sliderContainerRef}
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
