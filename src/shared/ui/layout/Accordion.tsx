'use client';
import React, { useState, useRef, useEffect } from 'react';
import SelectArrow from '@/components/icons/SelectArrow';
import Vector from '@/components/icons/Vector';
import { usePathname } from 'next/navigation';
import { useHeaderNavigation } from '@/hooks/useHeaderNavigation';
import { cn } from '@/shared/lib/cn';

const Accordion = ({
  id,
  title,
  children,
  travelCount,
  initialChecked,
  paddingTop = '1.7svh',
  paddingLeft = '1.7svh',
  paddingRight = '1.7svh',
  paddingBottom = '1.7svh',
  tabPadding = '20px',
  tabLineHeihgt = '19px',
  fontWeight = 600,
  tabBorder = true,
  handleOpen,
  handleClose,
  count,
}: {
  id: string;
  travelCount?: number;
  count: number;
  fontWeight?: number;
  handleOpen?: () => void;
  handleClose?: () => void;
  title: string | React.ReactNode;
  paddingTop?: string;
  paddingLeft?: string;
  paddingRight?: string;
  paddingBottom?: string;
  tabPadding?: string;
  tabLineHeihgt?: string;
  tabBorder?: boolean;
  children: React.ReactNode;
  initialChecked: boolean;
}) => {
  const [isChecked, setIsChecked] = useState(initialChecked);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isCreateTripPage = pathname === '/createTripDetail';
  const { ROUTES, checkRoute } = useHeaderNavigation();
  const isTravelLog = checkRoute.startsWith('/userProfile');
  const isEditTripPage = pathname?.startsWith('/trip/edit');

  useEffect(() => {
    if (contentRef.current) {
      const paddingTopNumber = Number(paddingTop.match(/\d+(\.\d+)?/g));
      const paddingBottomNumber = Number(paddingBottom.match(/\d+(\.\d+)?/g));
      const paddingHeight = paddingTop.includes('vh')
        ? paddingTopNumber * (window.innerHeight / 100) + paddingBottomNumber * (window.innerHeight / 100)
        : paddingTopNumber + paddingBottomNumber;
      setContentHeight(contentRef.current.scrollHeight + paddingHeight);
    }
  }, [isChecked]);

  const isCreateOrEdit = Boolean((isCreateTripPage || isEditTripPage) && isChecked);
  const showBorder = isCreateOrEdit || tabBorder;

  return (
    <li className="overflow-hidden list-none">
      <input
        type="checkbox"
        id={id}
        className="hidden"
        checked={isChecked}
        onChange={() => {
          handleOpen && handleClose && (isChecked ? handleClose() : handleOpen());
          setIsChecked(!isChecked);
        }}
      />
      <label
        htmlFor={id}
        className="flex text-base items-center justify-between cursor-pointer"
        style={{
          fontWeight,
          lineHeight: tabLineHeihgt,
          padding: `${tabPadding} 0`,
        }}
      >
        <div className="flex items-center gap-2">
          {isCreateTripPage ? (
            <div
              className="text-[18px] font-semibold text-[var(--color-text-base)] h-[25px] px-[6px] gap-2"
              style={{ lineHeight: isCreateTripPage || isEditTripPage ? '29.2px' : '25.2px' }}
            >
              {title}
            </div>
          ) : isTravelLog ? (
            <div className="flex flex-col gap-2">
              <div>{title}</div>
              <div className="text-sm leading-4 text-[var(--color-text-muted)]">
                {count}/{travelCount}개
              </div>
            </div>
          ) : (
            <div>{title}</div>
          )}
          {count > 0 && !isTravelLog && (
            <div
              className={cn(
                'w-4 h-4 px-[5px] py-[1px] bg-[var(--color-keycolor)] rounded-[20px]',
                'text-center flex items-center justify-center box-border text-xs font-semibold',
                'text-[var(--color-muted4)]',
              )}
              style={{ lineHeight: isCreateTripPage || Boolean(isEditTripPage) ? '0' : '14.32px' }}
            >
              {count}
            </div>
          )}
        </div>
        <div style={{ transform: isChecked ? 'rotate(180deg)' : 'rotate(0)' }}>
          {isCreateTripPage || isTravelLog ? (
            <Vector stroke="var(--color-text-muted2)" />
          ) : (
            <SelectArrow width={12} height={6} />
          )}
        </div>
      </label>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[height,padding,transform] duration-[400ms] ease-in-out"
        style={{
          height: isChecked ? `${contentHeight}px` : '1px',
          borderBottom: showBorder ? '1px solid rgba(240, 240, 240, 1)' : 'none',
          padding: isChecked
            ? `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`
            : `0 ${paddingRight} 0 ${paddingLeft}`,
          transform: isChecked ? 'translateY(0)' : `translateY(${paddingTop})`,
        }}
      >
        {children}
      </div>
      {isCreateTripPage && isChecked && (
        <div className="mt-6 h-px border border-[rgba(240,240,240,1)] border-[0.5px]" />
      )}
    </li>
  );
};

export default Accordion;
