'use client';

import React from 'react';
import BaseModal from './BaseModal';

interface CheckingModalProps {
  isModalOpen: boolean;
  modalMsg: string;
  modalTitle: string;
  modalButtonText: string;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>> | ((bool: boolean) => void);
  setIsSelected?: React.Dispatch<React.SetStateAction<boolean>>;
  onClick?: () => void;
}

export default function CheckingModal({
  isModalOpen,
  modalMsg,
  modalTitle,
  modalButtonText,
  setIsSelected,
  setModalOpen,
  onClick,
}: CheckingModalProps) {
  const handleConfirm = () => {
    if (setIsSelected) {
      setIsSelected(true);
    } else if (onClick) {
      onClick();
    }
    setModalOpen(false);
  };

  return (
    <BaseModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} height={164}>
      <div className="flex h-[76px] flex-col items-center justify-center">
        <p className="mb-2 text-xl font-semibold leading-[23.87px] text-text-base">
          {modalTitle}
        </p>
        <p className="mx-8 text-base font-normal leading-[22.4px] text-center text-text-muted whitespace-pre-line word-break-keep-all">
          {modalMsg}
        </p>
      </div>
      <div className="mt-4 flex h-12 w-full border-t border-muted5">
        <button
          onClick={() => setModalOpen(false)}
          className="flex w-1/2 cursor-pointer items-center justify-center text-base font-normal text-text-muted2 active:bg-button-active"
        >
          닫기
        </button>
        <button
          onClick={handleConfirm}
          className="flex w-1/2 cursor-pointer items-center justify-center text-base font-semibold text-keycolor active:bg-button-active"
        >
          {modalButtonText}
        </button>
      </div>
    </BaseModal>
  );
}
