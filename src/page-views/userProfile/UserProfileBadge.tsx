"use client";

import BadgeLockIcon from "@/components/icons/BadgeLockIcon";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { myPageStore } from "@/store/client/myPageStore";
import { authStore } from "@/store/client/authStore";
import useUserProfile from "@/hooks/userProfile/useUserProfile";

export function UserProfileBadge() {
  // API 요청. hooks 캐시 값 이용.
  const tempBadgeArray = new Array(12).fill({ Icon: BadgeLockIcon, name: "배지 이름" });
  const params = useParams();
  const ID = params.userId as string; // 혹은 params['id'
  const { userProfileInfo } = useUserProfile();

  // params에서 userId가 내 꺼랑 같으면 배지 그거 쓰고, 아니라면 userProfile()쓰기.

  const profileData =
    ID === authStore().userId?.toString()
      ? {
          travelBadgeCount: myPageStore().travelBadgeCount,
        }
      : {
          travelBadgeCount: userProfileInfo!.travelBadgeCount,
        };

  const { travelBadgeCount } = profileData;
  return (
    <div className="px-6">
      <p className="mt-10 mb-6 pl-1 leading-[140%] tracking-[-2.5%] text-[var(--color-text-base)] font-semibold text-lg">
        현재
        <span className="font-bold text-[var(--color-keycolor)] mx-1">{travelBadgeCount}</span>
        개의 배지를 획득했어요.
      </p>
      <div className="grid max-[360px]:grid-cols-2 grid-cols-3 gap-x-[27px] gap-y-8">
        {tempBadgeArray.map((badge) => (
          <div key={badge.name} className="w-full rounded-[12px] flex flex-col items-center justify-center">
            <BadgeLockIcon />
            <div className="text-center mt-3 font-normal text-xs" style={{ color: "#000000" }}>{badge.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
