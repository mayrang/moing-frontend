'use client';
import React from 'react';
import InfoIcon from '@/shared/ui/icons/InfoIcon';
import { errorStore } from '@/store/client/errorStore';
import Image from 'next/image';

const Fallback = () => {
  const { error } = errorStore();

  return (
    <div className="h-svh w-svw overflow-x-hidden flex justify-center items-center">
      <div
        className="w-svw h-full relative flex items-center justify-center gap-4 flex-col bg-[var(--color-search-bg)] [&::-webkit-scrollbar]:hidden min-[440px]:w-[390px] min-[440px]:overflow-x-hidden"
      >
        <InfoIcon size={24} color="var(--color-text-muted2)" />
        <Image src="/images/noData.png" width={80} height={80} alt="No Data Logo Image" />
        <h2 className="block text-[18px] font-medium leading-[25.2px] text-center">
          {error?.message}
        </h2>
        <a
          href="/"
          className="block px-3 py-[9px] bg-[var(--color-keycolor)] flex gap-1 text-white text-sm font-semibold leading-[16.71px] items-center rounded-[20px] border-0"
        >
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10L0.5 5.5L5 1" stroke="#FEFEFE" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>돌아가기</div>
        </a>
      </div>
    </div>
  );
};

export default Fallback;
