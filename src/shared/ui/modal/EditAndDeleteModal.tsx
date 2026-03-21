'use client';

import React, { SetStateAction } from 'react';
import CloseButton from '@/shared/ui/button/CloseButton';
import EditAndDeleteButton from '@/shared/ui/button/EditAndDeleteButton';
import BottomSheetModal from './BottomSheetModal';

interface EditAndDeleteModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  setIsEditBtnClicked: React.Dispatch<SetStateAction<boolean>>;
  setIsDeleteBtnClicked: React.Dispatch<SetStateAction<boolean>>;
  isMyApplyTrip?: boolean;
  deleteText?: string;
}

export default function EditAndDeleteModal({
  setIsEditBtnClicked,
  setIsDeleteBtnClicked,
  isOpen,
  setIsOpen,
  isMyApplyTrip = false,
  deleteText = '삭제하기',
}: EditAndDeleteModalProps) {
  const deleteHandler = () => {
    setIsDeleteBtnClicked(true);
    setIsOpen(false);
  };
  const editHandler = () => {
    setIsEditBtnClicked(true);
    setIsOpen(false);
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={() => setIsOpen(false)} portalId="end-modal" aria-label="수정/삭제 메뉴">
      <EditAndDeleteButton
        isOpen={isOpen}
        isMyApplyTrip={isMyApplyTrip}
        editClickHandler={editHandler}
        deleteClickHandler={deleteHandler}
        deleteText={deleteText}
      />
      <CloseButton onClick={() => setIsOpen(false)} />
    </BottomSheetModal>
  );
}
