'use client';

// Bug fix: 원본에 `import { styleText } from 'util'` 불필요 import 존재 → 제거
import CheckIcon from '@/components/icons/CheckIcon';
import React from 'react';
import BaseModal from './BaseModal';

interface ResultModalProps {
  isModalOpen: boolean;
  modalMsg: string;
  modalTitle: string;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ResultModal({
  isModalOpen,
  modalMsg,
  modalTitle,
  setModalOpen,
}: ResultModalProps) {
  return (
    <BaseModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} height={196}>
      <div className="flex h-[108px] flex-col items-center justify-center">
        <CheckIcon size={24} status="done" />
        <p className="my-2 text-xl font-semibold leading-[23.87px] text-text-base">
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
