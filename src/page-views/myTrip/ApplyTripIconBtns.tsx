"use client";
import CheckingModal from "@/components/designSystem/modal/CheckingModal";
import EditAndDeleteModal from "@/components/designSystem/modal/EditAndDeleteModal";
import ResultToast from "@/components/designSystem/toastMessage/resultToast";
import EmptyHeartIcon from "@/components/icons/EmptyHeartIcon";
import FullHeartIcon from "@/components/icons/FullHeartIcon";
import MoreIcon from "@/components/icons/MoreIcon";
import { useUpdateBookmark } from "@/hooks/bookmark/useUpdateBookmark";
import { useMyApplyTrip } from "@/hooks/myTrip/useMyApplyTrip";
import { authStore } from "@/store/client/authStore";
import React, { useEffect, useState } from "react";

interface ApplyTripIconBtnsProps {
  bookmarked: boolean;
  travelNumber: number;
}
export default function ApplyTripIconBtns({ bookmarked, travelNumber }: ApplyTripIconBtnsProps) {
  const { accessToken, userId } = authStore();
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [bookmarkCancelClicked, setBookmarkCancelClicked] = useState(false);
  const [bookmarkCancelToast, setBookmarkCancelToast] = useState(false);

  const { deleteMyApplyTripsMutation } = useMyApplyTrip();

  const [isEditBtnClicked, setIsEditBtnClicked] = useState(false);
  const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [checkingModalClicked, setCheckingModalClicked] = useState(false);
  const [threeDotsClick, setThreeDotsClick] = useState(false);
  const [isToastShow, setIsToastShow] = useState(false);

  const { postBookmarkMutation, deleteBookmarkMutation } = useUpdateBookmark(accessToken!, userId!, travelNumber);
  const bookmarkClickHandler = () => {
    if (bookmarked) {
      setBookmarkModalOpen(true);
    } else {
      postBookmarkMutation();
    }
  };

  useEffect(() => {
    if (bookmarked && bookmarkCancelClicked) {
      deleteBookmarkMutation().then((res: any) => {
        setBookmarkCancelToast(true);
      });
    }
  }, [bookmarked, bookmarkCancelClicked]);

  useEffect(() => {
    if (isDeleteBtnClicked) {
      setIsResultModalOpen(true);
      setIsDeleteBtnClicked(false);
    }
    if (checkingModalClicked) {
      deleteMyApplyTripsMutation(travelNumber).then((res) => {
        setIsToastShow(true);
      });
    }
  }, [isDeleteBtnClicked, isEditBtnClicked, checkingModalClicked]);

  const editOrDeleteClickHandler = () => {
    setThreeDotsClick(true);
    setBookmarkModalOpen(false);
  };

  return (
    <div>
      <div className="absolute top-[18px] right-[22px]" style={{ display: "flex" }}>
        {bookmarked ? (
          <div onClick={bookmarkClickHandler}>
            <FullHeartIcon width={24} height={21.4} />
          </div>
        ) : (
          <div onClick={bookmarkClickHandler}>
            <EmptyHeartIcon width={24} height={21.4} stroke="var(--color-muted3)" />
          </div>
        )}
      </div>

      <EditAndDeleteModal
        deleteText="여행 참가 취소"
        isMyApplyTrip={true}
        setIsEditBtnClicked={setIsEditBtnClicked}
        setIsDeleteBtnClicked={setIsDeleteBtnClicked}
        isOpen={threeDotsClick}
        setIsOpen={setThreeDotsClick}
      />
      <CheckingModal
        isModalOpen={isResultModalOpen}
        modalMsg={`아쉬워요🥺\n 정말 여행을 취소하시겠어요? `}
        modalTitle="참가 취소"
        modalButtonText="취소하기"
        setIsSelected={setCheckingModalClicked}
        setModalOpen={setIsResultModalOpen}
      />
      <ResultToast height={120} isShow={isToastShow} setIsShow={setIsToastShow} text="여행 게시글이 삭제되었어요." />

      <CheckingModal
        isModalOpen={bookmarkModalOpen && !threeDotsClick}
        modalMsg={"북마크를 해제할까요?"}
        modalTitle="북마크 해제"
        modalButtonText="해제하기"
        setIsSelected={setBookmarkCancelClicked}
        setModalOpen={setBookmarkModalOpen}
      />
      <ResultToast
        height={120}
        isShow={bookmarkCancelToast}
        setIsShow={setBookmarkCancelToast}
        text="북마크가 해제되었어요."
      />
    </div>
  );
}
