"use client";
import CheckingModal from "@/components/designSystem/modal/CheckingModal";
import RoundedImage from "@/components/designSystem/profile/RoundedImage";
import TextButton from "@/components/designSystem/text/TextButton";
import RightVector from "@/components/icons/RightVector";
import Spacing from "@/components/Spacing";
import UserProfileDetail from "@/components/userProfile/UserProfileDetail";
import useViewTransition from "@/hooks/useViewTransition";
import { authStore } from "@/store/client/authStore";
import { userProfileOverlayStore } from "@/store/client/userProfileOverlayStore";
import { isGuestUser } from "@/utils/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MyPage() {
  const navigateWithTransition = useViewTransition();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const onLinkAnnouncement = () => {
    document.documentElement.style.viewTransitionName = "forward";
    navigateWithTransition("/announcement");
  };
  const { userId } = authStore();
  const { setUserProfileUserId } = userProfileOverlayStore();
  useEffect(() => {
    if (userId) setUserProfileUserId(userId);
  }, [userId]);
  return (
    <div className="px-6 mt-2">
      {!isGuestUser() ? (
        <UserProfileDetail isMyPage={true} />
      ) : (
        <div className="w-full bg-[var(--color-search-bg)] p-6 px-4 gap-4 rounded-[20px] flex">
          <div>
            <RoundedImage src={"/images/defaultProfile.png"} size={80} />
          </div>
          <div style={{ width: "100%" }}>
            <div className="flex cursor-pointer items-center" onClick={() => setShowLoginModal(true)}>
              <div className="text-xl font-semibold leading-4 text-[var(--color-text-base)] mr-1">로그인 & 회원가입</div>
              <div style={{ display: "flex", padding: "8px 5px" }}>
                <RightVector />
              </div>
            </div>
            <div className="text-sm font-normal leading-[16.8px] tracking-[-0.25px] text-left text-[var(--color-text-muted)]">
              로그인 후 모잉에서
              <br /> 설레는 여행을 떠나보세요.
            </div>
          </div>
        </div>
      )}

      {!isGuestUser() && <div className="h-3 bg-[var(--color-search-bg)]"></div>}

      <div className="mt-6 w-full">
        <div className="border-b border-[#e7e7e7] pt-[14px]">
          <div className="text-sm font-semibold leading-4 text-[var(--color-text-base)] text-left mb-2">내 활동 현황</div>

          <TextButton
            onClick={() => {
              document.documentElement.style.viewTransitionName = "forward";
              navigateWithTransition("/requestedTrip");
            }}
            isLeftVector
            isRightVector={false}
            text="참가 신청한 여행"
            leftIconSrc="/images/createTripBtn.png"
          />
          <Spacing size={8} />

          <TextButton
            onClick={() => {
              document.documentElement.style.viewTransitionName = "forward";
              navigateWithTransition("/myCommunity");
            }}
            isLeftVector
            isRightVector={false}
            text="작성한 글"
            leftIconSrc="/images/createTripBtn.png"
          />
          <Spacing size={8} />
        </div>

        <div className="border-b border-[#e7e7e7] pt-[14px]">
          <div className="text-sm font-semibold leading-4 text-[var(--color-text-base)] text-left mb-2">모잉 소식</div>
          <Spacing size={8} />
          <TextButton
            isLeftVector
            isRightVector={false}
            onClick={onLinkAnnouncement}
            text="공지사항"
            leftIconSrc="/images/createTripBtn.png"
          />
          <TextButton
            onClick={() => {
              router.push("/contact");
            }}
            text="1:1 문의하기"
            isLeftVector={false}
            isRightVector={false}
          />
          <Spacing size={8} />
        </div>

        <div style={{ marginTop: "16px" }}>
          <a href="/pdf/service_terms(241115).pdf" target="_blank">
            <TextButton text="서비스이용약관" isLeftVector={false} isRightVector={false} />
          </a>
          <a href="/pdf/privacy_policy(241006).pdf" target="_blank">
            <TextButton text="개인정보처리방침" isLeftVector={false} isRightVector={false} />
          </a>

          <Spacing size={150} />
        </div>
      </div>

      <CheckingModal
        isModalOpen={showLoginModal}
        onClick={() => router.push("/login")}
        modalMsg={`로그인 후 이용할 수 있어요.\n로그인 하시겠어요?`}
        modalTitle="로그인 안내"
        modalButtonText="로그인"
        setModalOpen={setShowLoginModal}
      />
    </div>
  );
}
