"use client";
import { myPageStore } from "@/store/client/myPageStore";
import React from "react";
import useViewTransition from "@/shared/hooks/useViewTransition";
import CloverIcon from "@/components/icons/CloverIcon";
import RoundedImage from "@/shared/ui/profile/RoundedImage";
import Badge from "@/shared/ui/badge/Badge";
import { formatNumberWithComma } from "@/utils/formatNumberWithComma";
import WarningIcon from "@/components/icons/WarningIcon";
import { userProfileOverlayStore } from "@/store/client/userProfileOverlayStore";
import useUserProfile from "@/features/userProfile/hooks/useUserProfile";
import ProfileRightVectorIcon from "@/components/icons/ProfileRightVectorIcon";
import { authStore } from "@/store/client/authStore";
import { usePathname } from "next/navigation";

interface UserProfileDetailProps {
  isMyPage?: boolean;
}

export default function UserProfileDetail({
  isMyPage = false,
}: UserProfileDetailProps) {
  const { setProfileShow, userProfileUserId } = userProfileOverlayStore();
  const { userProfileInfo } = useUserProfile();
  const navigateWithTransition = useViewTransition();
  const pathname = usePathname();

  if (!isMyPage && !userProfileInfo) return null;
  const profileData = isMyPage
    ? {
        ageGroup: myPageStore().agegroup,
        name: myPageStore().name,
        recentReportCount: 0,
        userRegDate: "",
        preferredTags: myPageStore().preferredTags,
        travelDistance: myPageStore().travelDistance,
        travelBadgeCount: myPageStore().travelBadgeCount,
        visitedCountryCount: myPageStore().visitedCountryCount,
        profileImageUrl: myPageStore().profileUrl,
      }
    : {
        ageGroup: userProfileInfo!.ageGroup,
        name: userProfileInfo!.name,
        recentReportCount: userProfileInfo!.recentReportCount,
        userRegDate: userProfileInfo!.userRegDate,
        preferredTags: userProfileInfo!.preferredTags,
        travelDistance: userProfileInfo!.travelDistance,
        travelBadgeCount: userProfileInfo!.travelBadgeCount,
        visitedCountryCount: userProfileInfo!.visitedCountryCount,
        profileImageUrl: userProfileInfo!.profileImageUrl,
      };

  const {
    ageGroup,
    name,
    recentReportCount,
    userRegDate,
    preferredTags,
    travelDistance,
    travelBadgeCount,
    visitedCountryCount,
    profileImageUrl,
  } = profileData;

  const TravelMenuList = [
    {
      Icon: CloverIcon,
      label: "방문한 국가",
      count: visitedCountryCount,
      nextLink: `/userProfile/${isMyPage ? authStore().userId : userProfileUserId}/log`,
    },
    {
      Icon: CloverIcon,
      label: "여행 배지",
      count: travelBadgeCount,
      nextLink: `/userProfileBadge/${isMyPage ? authStore().userId : userProfileUserId}`,
    },
  ];

  const cutTags =
    preferredTags.length > 2 ? preferredTags.slice(0, 2) : preferredTags;

  const moveToNextLink = (link: string) => {
    localStorage.setItem("profilePath", pathname);
    navigateWithTransition(link);
    setTimeout(() => {
      setProfileShow(false);
    }, 50);
  };

  const IS_REPORTED = recentReportCount > 0;

  const editMyProfileInfo = () => {
    document.documentElement.style.viewTransitionName = "forward";
    navigateWithTransition("/editMyInfo");
  };

  return (
    <div className="mt-1 bg-white">
      <div className="flex flex-col justify-center items-center">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
          <RoundedImage src={profileImageUrl} size={80} />
        </div>
        <div className="flex flex-col gap-[6px]">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex items-center font-semibold text-xl leading-[16px] tracking-[-0.25px] text-center cursor-pointer text-[var(--color-text-base)]"
              onClick={isMyPage ? editMyProfileInfo : undefined}
            >
              {name}
              {isMyPage && <ProfileRightVectorIcon />}
            </div>
            <div className="font-normal text-xs leading-[16px] tracking-[-0.25px] text-center text-[var(--color-text-muted2)]">
              {isMyPage ? myPageStore().email : userRegDate + "가입"}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge
              isDueDate={false}
              fontWeight="600"
              color="var(--color-keycolor)"
              backgroundColor="var(--color-keycolor-bg)"
              text={ageGroup}
            />
            {cutTags.map((text: string) => (
              <Badge
                key={text}
                isDueDate={false}
                fontWeight="500"
                color="var(--color-text-muted)"
                backgroundColor="var(--color-search-bg)"
                text={text}
              />
            ))}
            {preferredTags.length > cutTags.length ? (
              <Badge
                isDueDate={false}
                fontWeight="500"
                color="var(--color-text-muted)"
                backgroundColor="var(--color-search-bg)"
                text={`+${preferredTags.length - cutTags.length}`}
              />
            ) : null}
          </div>
        </div>
        {IS_REPORTED && !isMyPage && (
          <div className="mt-3 flex h-[26px] gap-1 rounded-[20px] pt-1 pr-3 pb-1 pl-2 bg-[var(--color-text-base)] text-white font-normal text-xs items-center">
            <WarningIcon />
            최근 신고가 {recentReportCount}회 누적된 회원이에요
          </div>
        )}
      </div>
      <div className="mt-4 p-6 bg-[var(--color-search-bg)] h-[88px] flex flex-col gap-2 rounded-[20px]">
        <div className="text-sm text-[#333] mb-1">총 여행한 거리✨</div>
        <div className="font-semibold text-xl leading-[16px]">
          {formatNumberWithComma(Math.ceil(travelDistance))}km
        </div>
      </div>
      <div className="flex flex-col gap-3 my-4">
        {TravelMenuList.map(({ Icon, label, count, nextLink }) => (
          <div
            key={label}
            className="flex justify-between items-center py-[9px] h-[52px] font-normal text-base cursor-pointer"
            onClick={() => moveToNextLink(nextLink)}
          >
            <div className="flex items-center gap-2">
              <div className="w-[34px] h-[34px] rounded-[12px] bg-[var(--color-search-bg)] flex justify-center items-center p-2">
                <Icon />
              </div>
              <div className="text-[var(--color-text-base)]">{label}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[var(--color-text-muted)]">{count}</div>
              <div className="w-6 h-6 flex items-center justify-center">
                <ProfileRightVectorIcon />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
