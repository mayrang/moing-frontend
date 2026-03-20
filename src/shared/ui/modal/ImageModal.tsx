'use client';

import React from 'react';

interface ImageModalProps {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  image: string;
  count: number;
  allCount: number;
}

/**
 * 이미지 전체화면 모달.
 * Portal 없이 fixed 포지션으로 직접 렌더링.
 * 클릭 시 닫힘.
 */
const ImageModal = ({ setModalOpen, image, count, allCount }: ImageModalProps) => {
  return (
    <div
      onClick={() => setModalOpen(false)}
      className={[
        'fixed inset-0 z-[9999] flex h-svh w-full flex-col items-center justify-center',
        'bg-[rgba(0,0,0,0.6)]',
        'min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2',
      ].join(' ')}
    >
      <button
        type="button"
        className="absolute top-[6.2svh] left-1/2 -translate-x-1/2 text-base font-semibold leading-5 text-white"
      >
        사진 <span className="font-normal">{count}/{allCount}</span>
      </button>
      <img
        src={image}
        alt="big image"
        className="mx-auto w-full max-h-[80vh] object-contain"
      />
    </div>
  );
};

export default ImageModal;
