"use client";
import Badge from "@/components/designSystem/Badge";
import CheckingModal from "@/components/designSystem/modal/CheckingModal";
import ResultToast from "@/components/designSystem/toastMessage/resultToast";
import CameraIconForProfileEdit from "@/components/icons/CameraIconForProfileEdit";
import RightVector from "@/components/icons/RightVector";
import Spacing from "@/components/Spacing";
import useAuth from "@/hooks/user/useAuth";
import { authStore } from "@/store/client/authStore";
import { myPageStore } from "@/store/client/myPageStore";
import React, { useEffect, useState } from "react";
import ProfileEditModal from "./ProfileEditModal";
import { isGuestUser } from "@/utils/user";
import useViewTransition from "@/hooks/useViewTransition";
import TextButton from "@/components/designSystem/text/TextButton";

export default function EditMyInfo() {
  const { addLogoutCheck } = authStore();
  const { logout } = useAuth();
  const {
    name,
    agegroup,
    email,
    preferredTags,
    isNameUpdated,
    isProfileImgUpdated,
    isTagUpdated,
    isPasswordUpdated,
    addIsNameUpdated,
    addIsPasswordUpdated,
    addIsProfileImgUpdated,
    addIsTagUpdated,
    profileUrl,
    userSocialTF,
  } = myPageStore();
  const navigateWithTransition = useViewTransition();
  const [isNameChangeToastShow, setIsNameChangeToastShow] = useState(false); // 변경시 보이게 해줄 토스트 메시지
  const [isProfileChangeToastShow, setIsProfileChangeToastShow] = useState(false); // 변경시 보이게 해줄 토스트 메시지
  const [isTagChangeToastShow, setIsTagChangeToastShow] = useState(false); // 변경시 보이게 해줄 토스트 메시지
  const [isPasswordChangeToastShow, setIsPasswordChangeToastShow] = useState(false); // 변경시 보이게 해줄 토스트 메시지
  // 로그 아웃 관련
  const [checkingLogoutModalClicked, setCheckingLogoutModalClicked] = useState(false);
  const [isLogoutClicked, setIsLogoutClicked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    if (isNameUpdated) {
      setTimeout(() => {
        setIsNameChangeToastShow(true);
        addIsNameUpdated(false);
      }, 500);
    }
    if (isPasswordUpdated) {
      setTimeout(() => {
        setIsPasswordChangeToastShow(true);
        addIsPasswordUpdated(false);
      }, 500);
    }
    if (isProfileImgUpdated) {
      setTimeout(() => {
        setIsProfileChangeToastShow(true);
        addIsProfileImgUpdated(false);
      }, 500);
    }
    if (isTagUpdated) {
      setTimeout(() => {
        setIsTagChangeToastShow(true);
        addIsTagUpdated(false);
      }, 500);
    }
  }, [isNameUpdated, isPasswordUpdated, isProfileImgUpdated, isTagUpdated]);

  useEffect(() => {
    if (isLogoutClicked) {
      addLogoutCheck(true); // 로그아웃 예정 표시 => 자동 토큰 재발급 요청을 막기 위한 값.
      logout();
      setCheckingLogoutModalClicked(false);
    }
  }, [isLogoutClicked]);

  return (
    <div className="px-6">
      <ResultToast
        height={120}
        isShow={isNameChangeToastShow}
        setIsShow={setIsNameChangeToastShow}
        text="이름 변경이 완료되었어요"
      />
      <ResultToast
        height={120}
        isShow={isProfileChangeToastShow}
        setIsShow={setIsProfileChangeToastShow}
        text="프로필 이미지가 변경되었어요"
      />
      <ResultToast
        height={120}
        isShow={isPasswordChangeToastShow}
        setIsShow={setIsPasswordChangeToastShow}
        text="비밀번호가 변경되었어요"
      />
      <ResultToast
        height={120}
        isShow={isTagChangeToastShow}
        setIsShow={setIsTagChangeToastShow}
        text="태그가 변경되었어요"
      />
      <CheckingModal
        isModalOpen={checkingLogoutModalClicked}
        modalMsg="정말 로그아웃 하시겠어요?"
        modalTitle="로그아웃"
        modalButtonText="로그아웃"
        setIsSelected={setIsLogoutClicked}
        setModalOpen={setCheckingLogoutModalClicked}
      />
      <div className="flex justify-center h-20">
        <div onClick={() => setShowModal(true)} style={{ position: "relative" }}>
          <img
            src={profileUrl}
            style={{
              width: "80px",
              height: "100%",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              height: "32px",
              position: "absolute",
              right: "-4px",
              bottom: "-4px",
            }}
          >
            <CameraIconForProfileEdit />
          </div>
        </div>
      </div>
      <div>
        <Spacing size={24} />
        <TextButton
          onClick={() => {
            document.documentElement.style.viewTransitionName = "forward";
            navigateWithTransition("/editMyName");
          }}
          isRightVector
          isLeftVector={false}
          text="이름"
          rightText={name}
          titleWeight="semibold"
        />

        <div className="h-px border-b border-[#e7e7e7]"></div>
        <Spacing size={8} />

        <TextButton isRightVector={false} isLeftVector={false} text="이메일" rightText={email} titleWeight="semibold" />

        <div className="h-px border-b border-[#e7e7e7]"></div>
        {!userSocialTF && (
          <>
            <Spacing size={8} />
            <TextButton
              onClick={() => {
                document.documentElement.style.viewTransitionName = "forward";
                navigateWithTransition("/editMyPassword");
              }}
              isRightVector={true}
              isLeftVector={false}
              text="비밀번호 변경"
              titleWeight="semibold"
            />

            <div className="h-px border-b border-[#e7e7e7]"></div>
          </>
        )}
        <Spacing size={8} />
        <div
          onClick={() => {
            document.documentElement.style.viewTransitionName = "forward";
            navigateWithTransition("/editMyTag");
          }}
        >
          <TextButton isRightVector={true} isLeftVector={false} text="나의 태그" titleWeight="semibold" />
          <div className="px-2 pb-4">
            <div className="flex items-center">
              <div className="text-sm font-semibold w-[52px] leading-[16.71px] tracking-[-0.025em] text-left text-[var(--color-text-muted)]">연령대</div>
              <div className="flex flex-wrap gap-2 ml-2">
                <Badge
                  isDueDate={false}
                  fontWeight="600"
                  color="var(--color-keycolor)"
                  backgroundColor="var(--color-keycolor-bg)"
                  text={agegroup}
                />
              </div>
            </div>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div className="text-sm font-semibold w-[52px] leading-[16.71px] tracking-[-0.025em] text-left text-[var(--color-text-muted)]">선호태그</div>
              <div className="flex flex-wrap gap-2 ml-2">
                {preferredTags.map((text: string) => (
                  <Badge
                    key={text}
                    isDueDate={false}
                    fontWeight="500"
                    color="var(--color-text-muted)"
                    backgroundColor="var(--color-muted4)"
                    text={text}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Spacing size={8} />
        <div className="h-px border-b border-[#e7e7e7]"></div>
        <Spacing size={8} />

        {!isGuestUser() && (
          <div className="h-4 text-sm font-normal leading-4 text-left text-[var(--color-text-muted2)] mt-8 flex justify-center">
            <div className="cursor-pointer" onClick={() => setCheckingLogoutModalClicked(true)}>로그아웃</div>
            <div className="h-4 text-[rgba(231,231,231,1)] mx-4 py-0.5 flex items-center">|</div>
            <div
              className="cursor-pointer"
              onClick={() => {
                document.documentElement.style.viewTransitionName = "forward";
                navigateWithTransition("/withdrawal");
              }}
            >
              탈퇴하기
            </div>
          </div>
        )}
        <Spacing size={150} />
        {showModal && <ProfileEditModal showModal={showModal} setShowModal={setShowModal} />}
      </div>
    </div>
  );
}
