'use client';
import React from 'react';
import InfoIcon from '@/shared/ui/icons/InfoIcon';
import Image from 'next/image';

const NotFound = () => {
  return (
    <a
      href="/"
      className="block h-svh w-svw top-0 left-0 bottom-0 right-0 fixed z-[9999] overflow-x-hidden flex justify-center items-center"
    >
      <div
        className="w-svw h-full relative flex items-center justify-center gap-4 flex-col bg-[var(--color-search-bg)] [&::-webkit-scrollbar]:hidden min-[440px]:w-[390px] min-[440px]:overflow-x-hidden"
      >
        <InfoIcon size={24} color="var(--color-text-muted2)" />
        <Image src="/images/noData.png" width={80} height={80} alt="No Data Logo Image" />
        <h2 className="block text-[18px] font-medium leading-[25.2px] text-center">
          페이지를 찾을 수 없습니다.
        </h2>
        <button
          type="button"
          className="px-3 py-[9px] bg-[var(--color-keycolor)] flex gap-1 text-white text-sm font-semibold leading-[16.71px] items-center rounded-[20px] border-0 cursor-pointer"
        >
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10L0.5 5.5L5 1" stroke="#FEFEFE" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>돌아가기</div>
        </button>
      </div>
    </a>
  );
};

export default NotFound;
