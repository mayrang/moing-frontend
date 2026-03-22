"use client";
import Badge from "@/components/designSystem/Badge";
import CheckingModal from "@/components/designSystem/modal/CheckingModal";
import ResultModal from "@/components/designSystem/modal/ResultModal";
import RoundedImage from "@/components/designSystem/profile/RoundedImage";
import ResultToast from "@/components/designSystem/toastMessage/resultToast";
import useEnrollment from "@/hooks/enrollment/useEnrollment";

import { daysAgo } from "@/utils/time";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface enrollmentCardProps {
  enrollmentNumber: number;
  userName: string;
  ageGroup: string;
  enrolledAt: string;
  profileUrl: string;
  message: string;
  isNew: boolean;
}
export default function TripEnrollmentCard({
  enrollmentNumber,
  userName,
  ageGroup,
  enrolledAt,
  message,
  isNew,
  profileUrl,
}: enrollmentCardProps) {
  const params = useParams();
  const travelNumber = params?.travelNumber as string;
  const { enrollmentAcceptanceMutate, enrollmentRejectionMutate } = useEnrollment(parseInt(travelNumber!));
  // 수락 모달
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isAcceptBtnClicked, setIsAcceptBtnClicked] = useState(false);
  // 거절 모달
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRejectBtnClicked, setIsRejecttBtnClicked] = useState(false);
  // 거절 완료 토스트 메시지
  const [isToastShow, setIsToastShow] = useState(false);
  // 수락 후 완료 모달
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // 현재 유저가 주최자 인지 확인.

  useEffect(() => {
    if (isAcceptBtnClicked) {
      // 수락 요청.

      enrollmentAcceptanceMutate(enrollmentNumber).then((res) => {
        setIsResultModalOpen(true);
      });
    } else if (isRejectBtnClicked) {
      // 거절 요청
      enrollmentRejectionMutate(enrollmentNumber).then((res) => {
        setIsToastShow(true);
      });
    }
  }, [isAcceptBtnClicked, isRejectBtnClicked]);

  return (
    <div className="p-6 gap-4 rounded-[20px] bg-[var(--color-search-bg)] mb-4">
      <div className="flex justify-between">
        <div className="flex items-center">
          <RoundedImage src={profileUrl} size={36} />
          <div className="ml-2 mr-1 text-lg font-semibold leading-[21.48px] text-left text-[var(--color-text-base)]">{userName}</div>
          {/* 뱃지. */}
          <Badge
            isDueDate={false}
            text={ageGroup}
            height={"22px"}
            color="var(--color-keycolor)"
            backgroundColor="var(--color-keycolor-bg)"
          />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="text-sm font-normal leading-[16.71px] text-left text-[var(--color-text-muted2)]">{daysAgo(enrolledAt)}</div>
          {/* 최신인가 아닌가 부분. */}
          {isNew && <div className="ml-[3px] w-2 h-2 rounded-full bg-[var(--color-like)]"></div>}
        </div>
      </div>
      <div className="mt-4 text-base font-normal leading-[22.4px] text-left text-[var(--color-text-base)]">{message}</div>
      <div className="flex items-center mt-4 w-full">
        <div className="mr-2 w-1/2 h-[42px] px-5 py-[10px] gap-[10px] rounded-[40px] bg-[#e7e7e7] text-[var(--color-text-muted)] flex items-center justify-center cursor-pointer" onClick={() => setIsRejectModalOpen(true)}>거절</div>
        <div className="flex items-center justify-center w-1/2 h-[42px] px-5 py-[10px] gap-[10px] rounded-[40px] bg-[var(--color-keycolor)] text-[var(--color-muted4)] cursor-pointer" onClick={() => setIsAcceptModalOpen(true)}>수락</div>
      </div>
      <CheckingModal
        isModalOpen={isAcceptModalOpen}
        modalMsg={`정말 ${userName}의\n여행 참가를 수락하시겠어요?`}
        modalTitle="참가 수락"
        modalButtonText="수락하기"
        setIsSelected={setIsAcceptBtnClicked}
        setModalOpen={setIsAcceptModalOpen}
      />
      <CheckingModal
        isModalOpen={isRejectModalOpen}
        modalMsg={`정말 ${userName}님의\n여행 참가를 거절하시겠어요?`}
        modalTitle="참가 거절"
        modalButtonText="거절하기"
        setIsSelected={setIsRejecttBtnClicked}
        setModalOpen={setIsRejectModalOpen}
      />
      <ResultModal
        isModalOpen={isResultModalOpen}
        modalMsg={`${userName}님의 여행 참가 요청이 \n수락되었어요`}
        modalTitle="참가 수락 완료"
        setModalOpen={setIsResultModalOpen}
      />
      <ResultToast isShow={isToastShow} setIsShow={setIsToastShow} text="여행 참가가 거절되었어요." />
    </div>
  );
}
