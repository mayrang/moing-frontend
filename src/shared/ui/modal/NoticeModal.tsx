'use client';

import React from 'react';
import BaseModal from './BaseModal';

interface NoticeModalProps {
  isModalOpen: boolean;
  modalMsg: string;
  modalTitle: string;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>> | ((bool: boolean) => void);
}

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2950_12210)">
      <circle cx="12" cy="12" r="12" fill="#3E8D00" />
      <rect x="11" y="5" width="2" height="10" rx="1" fill="#FDFDFD" />
      <path
        d="M11 18C11 17.4477 11.4477 17 12 17C12.5523 17 13 17.4477 13 18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18Z"
        fill="#FDFDFD"
      />
    </g>
    <defs>
      <clipPath id="clip0_2950_12210">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default function NoticeModal({
  isModalOpen,
  modalMsg,
  modalTitle,
  setModalOpen,
}: NoticeModalProps) {
  return (
    <BaseModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} height={196} zIndex={1005} labelId="notice-modal-title">
      <div className="flex h-[108px] flex-col items-center justify-center">
        <InfoIcon />
        <p id="notice-modal-title" className="my-2 text-xl font-semibold leading-[23.87px] text-text-base">
          {modalTitle}
        </p>
        <p className="text-base font-normal leading-[22.4px] text-center text-text-muted whitespace-pre-line">
          {modalMsg}
        </p>
      </div>
      <div className="mt-4 flex h-12 w-full border-t border-muted5">
        <button
          onClick={() => setModalOpen(false)}
          className="flex w-full cursor-pointer items-center justify-center text-base font-normal text-text-muted2 active:bg-button-active"
        >
          닫기
        </button>
      </div>
    </BaseModal>
  );
}
