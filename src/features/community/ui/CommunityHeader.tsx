'use client';
import CheckingModal from '@/shared/ui/modal/CheckingModal';
import EditAndDeleteModal from '@/shared/ui/modal/EditAndDeleteModal';
import AlarmIcon from '@/shared/ui/icons/AlarmIcon';
import MoreIcon from '@/components/icons/MoreIcon';
import { COMMUNITY_MODAL_MESSAGES } from '@/constants/modalMessages';
import useCommunity from '@/hooks/useCommunity';
import { authStore } from '@/store/client/authStore';
import { useBackPathStore } from '@/store/client/backPathStore';
import { editStore } from '@/store/client/editStore';
import React, { useEffect, useState } from 'react';
import ShareIcon from '@/components/icons/ShareIcon';
import { useParams, useRouter } from 'next/navigation';
import ReportModal from '@/shared/ui/modal/ReportModal';
import useViewTransition from '@/shared/hooks/useViewTransition';
import { reportStore } from '@/store/client/reportStore';
import NoticeModal from '@/shared/ui/modal/NoticeModal';
import { isGuestUser } from '@/utils/user';

export default function CommunityHeader() {
  const { userId, accessToken } = authStore();
  const params = useParams();
  const { reportSuccess, setReportSuccess, setUserNumber } = reportStore();
  const communityNumber = params?.communityNumber as string;
  const navigateWithTransition = useViewTransition();
  const router = useRouter();
  const [isEditBtnClicked, setIsEditBtnClicked] = useState(false);
  const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isReportBtnClicked, setIsReportBtnClicked] = useState(false);
  const [checkingModalClicked, setCheckingModalClicked] = useState(false);
  const [threeDotsClick, setThreeDotsClick] = useState(false);
  const [reportThreeDotsClick, setReportThreeDotsClick] = useState(false);
  const { removeToastShow, setRemoveToastShow } = editStore();
  const { setNotification } = useBackPathStore();
  const {
    community: { data, isLoading },
    removeMutation,
    remove,
  } = useCommunity(Number(communityNumber));

  const handleNotification = () => {
    setNotification(data?.postNumber ? `/community/${data?.postNumber}` : '/community');
    router.push('/notification');
  };

  useEffect(() => {
    if (isDeleteBtnClicked) { setIsResultModalOpen(true); setIsDeleteBtnClicked(false); }
    if (isEditBtnClicked) { setThreeDotsClick(false); setIsEditBtnClicked(false); router.push(`/community/edit/${communityNumber}`); }
    if (isReportBtnClicked) {
      setIsReportBtnClicked(false);
      setUserNumber(data?.userNumber || null);
      document.documentElement.style.viewTransitionName = 'forward';
      navigateWithTransition(`/report/community/${communityNumber}`);
    }
    if (checkingModalClicked) remove({ communityNumber: Number(communityNumber) });
  }, [isDeleteBtnClicked, isReportBtnClicked, isEditBtnClicked, checkingModalClicked]);

  useEffect(() => {
    if (removeMutation.isSuccess) { setRemoveToastShow(true); router.push('/community'); }
  }, [removeMutation.isSuccess]);

  const onClickThreeDots = () => {
    if (data?.userNumber === userId) setThreeDotsClick(true);
    else setReportThreeDotsClick(true);
  };

  return (
    <div className="flex items-center justify-around">
      {userId && (
        <div className="w-12 h-12 flex items-center justify-center" onClick={handleNotification}>
          <AlarmIcon size={23} stroke="var(--color-text-base)" />
        </div>
      )}
      <div className="w-12 h-12 flex items-center justify-center">
        <ShareIcon />
      </div>
      {!isGuestUser() && (
        <div className="w-12 h-12 flex items-center justify-center" onClick={onClickThreeDots}>
          <MoreIcon />
        </div>
      )}
      <EditAndDeleteModal
        setIsEditBtnClicked={setIsEditBtnClicked}
        setIsDeleteBtnClicked={setIsDeleteBtnClicked}
        isOpen={threeDotsClick}
        setIsOpen={setThreeDotsClick}
      />
      <CheckingModal
        isModalOpen={isResultModalOpen}
        modalMsg={COMMUNITY_MODAL_MESSAGES.deleteMessage}
        modalTitle={COMMUNITY_MODAL_MESSAGES.askingDelete}
        modalButtonText={COMMUNITY_MODAL_MESSAGES.delete}
        setIsSelected={setCheckingModalClicked}
        setModalOpen={setIsResultModalOpen}
      />
      <NoticeModal
        isModalOpen={reportSuccess}
        modalMsg="소중한 의견 감사합니다."
        modalTitle="신고 완료"
        setModalOpen={setReportSuccess}
      />
      <ReportModal
        setIsReportBtnClicked={setIsReportBtnClicked}
        isOpen={reportThreeDotsClick}
        setIsOpen={setReportThreeDotsClick}
      />
    </div>
  );
}
