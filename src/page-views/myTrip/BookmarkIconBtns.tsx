"use client";
import CheckingModal from "@/components/designSystem/modal/CheckingModal";
import ResultToast from "@/components/designSystem/toastMessage/resultToast";
import EmptyHeartIcon from "@/components/icons/EmptyHeartIcon";
import FullHeartIcon from "@/components/icons/FullHeartIcon";
import { useUpdateBookmark } from "@/hooks/bookmark/useUpdateBookmark";
import { authStore } from "@/store/client/authStore";
import React, { useEffect, useState } from "react";

interface BookmarkIconBtnsProps {
  bookmarked: boolean;
  travelNumber: number;
}
export default function BookmarkIconBtns({ bookmarked, travelNumber }: BookmarkIconBtnsProps) {
  const { accessToken, userId } = authStore();
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [bookmarkCancelClicked, setBookmarkCancelClicked] = useState(false);
  const [bookmarkCancelToast, setBookmarkCancelToast] = useState(false);
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
      deleteBookmarkMutation().then((res) => {
        setBookmarkCancelToast(true);
      });
    }
  }, [bookmarked, bookmarkCancelClicked]);

  return (
    <div>
      <div className="absolute top-[18px] right-[22px]" style={{ display: "flex" }} onClick={bookmarkClickHandler}>
        {bookmarked ? (
          <div>
            <FullHeartIcon width={24} height={21.4} />
          </div>
        ) : (
          <div>
            <EmptyHeartIcon width={24} height={21.4} stroke="var(--color-muted3)" />
          </div>
        )}
      </div>
      <CheckingModal
        isModalOpen={bookmarkModalOpen}
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
