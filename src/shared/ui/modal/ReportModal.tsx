'use client';

import React, { SetStateAction } from 'react';
import CloseButton from '@/shared/ui/button/CloseButton';
import ReportButton from '@/shared/ui/button/ReportButton';
import BottomSheetModal from './BottomSheetModal';

interface ReportModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  setIsReportBtnClicked: React.Dispatch<SetStateAction<boolean>>;
  reportText?: string;
}

export default function ReportModal({
  setIsReportBtnClicked,
  isOpen,
  setIsOpen,
  reportText = '신고하기',
}: ReportModalProps) {
  const reportHandler = () => {
    setIsReportBtnClicked(true);
    setIsOpen(false);
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={() => setIsOpen(false)} portalId="checking-modal" aria-label="신고 메뉴">
      <ReportButton isOpen={isOpen} reportClickHandler={reportHandler} reportText={reportText} />
      <CloseButton onClick={() => setIsOpen(false)} />
    </BottomSheetModal>
  );
}
