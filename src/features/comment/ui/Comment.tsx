'use client';
import React, { useEffect, useState } from 'react';
import RoundedImage from '@/shared/ui/profile/RoundedImage';
import EllipsisIcon from '@/components/icons/EllipsisIcon';
import EmptyHeartIcon from '@/components/icons/EmptyHeartIcon';
import CommentIcon from '@/components/icons/CommentIcon';
import EditAndDeleteModal from '@/shared/ui/modal/EditAndDeleteModal';
import CheckingModal from '@/shared/ui/modal/CheckingModal';
import ResultToast from '@/shared/ui/toast/ResultToast';
import { IComment } from '@/model/comment';
import { daysAgoFormatted } from '@/utils/time';
import FullHeartIcon from '@/components/icons/FullHeartIcon';
import useComment from '@/features/comment/hooks/useComment';
import { authStore } from '@/store/client/authStore';
import { commentStore } from '@/store/client/commentStore';
import { COMMENT_MODAL_MESSAGES } from '@/constants/modalMessages';
import ReportModal from '@/shared/ui/modal/ReportModal';
import { isGuestUser } from '@/utils/user';
import { reportStore } from '@/store/client/reportStore';
import NoticeModal from '@/shared/ui/modal/NoticeModal';
import useViewTransition from '@/shared/hooks/useViewTransition';
import { userProfileOverlayStore } from '@/store/client/userProfileOverlayStore';
import { cn } from '@/shared/lib/cn';

interface CommentProps {
  comment: IComment;
  relatedType: 'travel' | 'community';
  relatedNumber: number;
  userNumber: number;
}

const Comment = ({ comment, relatedType, relatedNumber, userNumber }: CommentProps) => {
  const { accessToken, userId } = authStore();
  const [isEditBtnClicked, setIsEditBtnClicked] = useState(false);
  const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);
  const [isReportBtnClicked, setIsReportBtnClicked] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const { setProfileShow, setUserProfileUserId } = userProfileOverlayStore();

  const [checkingModalClicked, setCheckingModalClicked] = useState(false);
  const [successEdit, setSuccessEdit] = useState(false);
  const [isToastShow, setIsToastShow] = useState(false);
  const [threeDotsClick, setThreeDotsClick] = useState(false);
  const [reportThreeDotsClick, setReportThreeDotsClick] = useState(false);
  const { reportSuccess, setReportSuccess, setDetailId, setUserNumber } = reportStore();
  const navigateWithTransition = useViewTransition();

  const {
    setOpenEdit,
    setParentNumber,
    setCommentNumber,
    isEdit,
    isReply,
    parentNumber,
    commentNumber,
  } = commentStore();
  const { removeMutation, remove, like, unlike, updateMutation } = useComment(
    relatedType,
    relatedNumber,
  );

  useEffect(() => {
    if (updateMutation.isSuccess) {
      setSuccessEdit(true);
    }
  }, [updateMutation.isSuccess]);

  useEffect(() => {
    if (successEdit) {
      setTimeout(() => {
        setSuccessEdit(false);
      }, 2000);
    }
  }, [successEdit]);

  useEffect(() => {
    if (isDeleteBtnClicked) {
      setIsResultModalOpen(true);
      setIsDeleteBtnClicked(false);
    }
    if (isEditBtnClicked) {
      setThreeDotsClick(false);
      setIsEditBtnClicked(false);
      setOpenEdit(comment.content);
      setCommentNumber(comment.commentNumber);
    }
    if (isReportBtnClicked) {
      setIsReportBtnClicked(false);
      setDetailId(relatedNumber);
      setUserNumber(userNumber);
      document.documentElement.style.viewTransitionName = 'forward';
      navigateWithTransition(
        `/report/${relatedType === 'community' ? 'communityComment' : 'travelComment'}/${comment.commentNumber}`,
      );
    }
    if (checkingModalClicked) {
      remove({ commentNumber: comment.commentNumber });
      if (removeMutation.isSuccess) {
        setIsToastShow(true);
      }
    }
  }, [isDeleteBtnClicked, isEditBtnClicked, checkingModalClicked, isReportBtnClicked]);

  const onClickThreeDots = () => {
    if (comment.userNumber === userId || comment.travelWriterNumber === userId) {
      setThreeDotsClick(true);
    } else {
      setReportThreeDotsClick(true);
    }
  };

  const onClickReply = () => {
    setParentNumber(comment.commentNumber);
  };

  const onClickLike = () => {
    if (isGuestUser()) return;
    if (comment.liked) {
      unlike({ commentNumber: comment.commentNumber });
    } else {
      like({ commentNumber: comment.commentNumber });
    }
  };

  const moveToUserProfilePage = (userNum: number) => {
    setUserProfileUserId(userNum);
    setProfileShow(true);
  };

  const isCurrentEdit = isEdit && comment.commentNumber === commentNumber;
  const isChild = comment.parentNumber !== 0;
  const isReplied =
    (isReply && parentNumber === comment.commentNumber) || comment.commented;

  return (
    <div
      className={cn(
        'py-4 border-b border-[var(--color-muted4)]',
        isChild ? 'pl-10' : 'pl-0',
        isCurrentEdit
          ? 'bg-[rgba(227,239,217,0.3)]'
          : relatedType === 'community'
            ? 'bg-[#f5f5f5]'
            : 'bg-[var(--color-bg)]',
      )}
    >
      <div className="flex items-center gap-2">
        <RoundedImage size={32} src={comment.imageUrl} />
        <div
          className="flex gap-1 flex-1 items-center text-[var(--color-text-muted)] text-xs text-center font-normal cursor-pointer"
          onClick={() => moveToUserProfilePage(userNumber)}
        >
          {relatedType === 'travel' && comment.travelWriterNumber === comment.userNumber && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18.7384 7.28021C18.5719 7.08903 18.344 6.9513 18.0873 6.88677C17.8415 6.82714 17.5819 6.83777 17.3428 6.91726C17.1037 6.99674 16.8965 7.14132 16.7487 7.33181L14.9557 8.92559L13.092 6.58297C12.9849 6.41562 12.8361 6.27413 12.6579 6.17018C12.5152 6.08933 12.3563 6.0358 12.1907 6.01281C12.025 5.98982 11.8561 5.99783 11.6939 6.03636C11.5316 6.0749 11.3795 6.14316 11.2466 6.23708C11.1137 6.331 11.0027 6.44864 10.9202 6.58297L9.05653 8.92559L7.26353 7.33181C7.11446 7.14281 6.90727 6.99937 6.66875 6.92003C6.43023 6.84069 6.17136 6.8291 5.92561 6.88677C5.65268 6.95486 5.41276 7.10599 5.24486 7.3156C5.07695 7.5252 4.99093 7.78096 5.00076 8.0413L6.11394 15.2639C6.21763 16.0199 6.61726 16.715 7.23782 17.2188C7.85838 17.7226 8.65719 18.0004 9.4843 18H14.5769C15.405 18.0012 16.205 17.7239 16.8267 17.2201C17.4485 16.7163 17.8492 16.0207 17.9536 15.2639L18.9975 8.0355C19.0008 8.00979 19.0008 7.98381 18.9975 7.9581C18.9911 7.71258 18.9004 7.47525 18.7384 7.28021ZM14.8367 15.4961H9.23226C9.14027 15.4961 9.04919 15.4794 8.9642 15.447C8.87922 15.4146 8.802 15.367 8.73695 15.3071C8.67191 15.2472 8.62031 15.1761 8.58511 15.0978C8.54991 15.0195 8.53179 14.9356 8.53179 14.8508C8.53179 14.7661 8.54991 14.6822 8.58511 14.6039C8.62031 14.5256 8.67191 14.4544 8.73695 14.3945C8.802 14.3346 8.87922 14.2871 8.9642 14.2546C9.04919 14.2222 9.14027 14.2055 9.23226 14.2055H14.8367C15.0224 14.2055 15.2004 14.2735 15.3317 14.3944C15.463 14.5154 15.5368 14.6794 15.5368 14.8505C15.5368 15.0216 15.463 15.1856 15.3317 15.3066C15.2004 15.4275 15.0224 15.4961 14.8367 15.4961Z"
                fill="#FDC52A"
              />
            </svg>
          )}
          <span className="text-lg font-semibold leading-[21.48px] text-[var(--color-text-base)]">
            {comment.writer}
          </span>
          <span className="text-sm font-medium text-[var(--color-muted3)]">·</span>
          <span className="text-sm font-normal text-[var(--color-text-muted2)]">
            {daysAgoFormatted(comment.regDate)}
          </span>
        </div>
        {!isGuestUser() && (
          <button type="button" onClick={onClickThreeDots}>
            <EllipsisIcon />
          </button>
        )}
      </div>
      <div className="px-4 pt-1 pb-[10px] pl-10 whitespace-pre-line text-base font-normal leading-[22.4px] tracking-[-0.025em] break-all">
        {comment.content}
      </div>
      <div className="flex items-center gap-6 pl-10">
        <button
          type="button"
          className={cn(
            'text-sm font-normal leading-[16.71px] flex items-center gap-[6px]',
            comment.liked ? 'text-[var(--color-keycolor)]' : 'text-[var(--color-text-muted2)]',
          )}
          onClick={onClickLike}
        >
          {comment.liked ? (
            <FullHeartIcon color="var(--color-keycolor)" width={16} height={14} />
          ) : (
            <EmptyHeartIcon width={16} height={14} stroke="var(--color-text-muted2)" />
          )}
          <div>좋아요{comment.likes > 0 && ` ${comment.likes}`}</div>
        </button>
        {comment.parentNumber === 0 && !isGuestUser() && (
          <button
            type="button"
            className={cn(
              'text-sm font-normal leading-[16.71px] flex items-center',
              isReplied ? 'text-[var(--color-keycolor)]' : 'text-[var(--color-text-muted2)]',
            )}
            onClick={onClickReply}
          >
            <div className="flex items-center justify-center w-6 h-6">
              <CommentIcon
                stroke={isReplied ? 'none' : undefined}
                fill={isReplied ? 'var(--color-keycolor)' : 'transparent'}
              />
            </div>
            {comment.repliesCount > 0 ? (
              <div>{`답글 ${comment.repliesCount}`}</div>
            ) : (
              <div>답글달기</div>
            )}
          </button>
        )}
      </div>
      <EditAndDeleteModal
        setIsEditBtnClicked={setIsEditBtnClicked}
        setIsDeleteBtnClicked={setIsDeleteBtnClicked}
        isOpen={threeDotsClick}
        setIsOpen={setThreeDotsClick}
      />
      <ReportModal
        setIsReportBtnClicked={setIsReportBtnClicked}
        isOpen={reportThreeDotsClick}
        setIsOpen={setReportThreeDotsClick}
      />
      <CheckingModal
        isModalOpen={isResultModalOpen}
        modalMsg={COMMENT_MODAL_MESSAGES.deleteMessage}
        modalTitle={COMMENT_MODAL_MESSAGES.title}
        modalButtonText={COMMENT_MODAL_MESSAGES.text}
        setIsSelected={setCheckingModalClicked}
        setModalOpen={setIsResultModalOpen}
      />
      <NoticeModal
        isModalOpen={reportSuccess}
        modalMsg={'소중한 의견 감사합니다.'}
        modalTitle={'신고 완료'}
        setModalOpen={setReportSuccess}
      />
      <ResultToast
        bottom="80px"
        isShow={isToastShow}
        setIsShow={setIsToastShow}
        text="댓글이 삭제되었어요."
      />
    </div>
  );
};

export default Comment;
