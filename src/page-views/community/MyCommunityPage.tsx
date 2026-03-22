"use client";
import Spacing from "@/components/Spacing";
import { useState } from "react";

import Navbar from "@/page-views/home/Navbar";
import SortHeader from "@/components/SortHeader";
import CommunityInfinite from "@/components/community/CommunityInfinite";
import ResultToast from "@/components/designSystem/toastMessage/resultToast";
import { editStore } from "@/store/client/editStore";
import { COMMUNITY_TOAST_MESSAGES } from "@/constants/toastMessages";
import useCommunity from "@/hooks/useCommunity";
import { isGuestUser } from "@/utils/user";
import LoginButtonForGuest from "@/components/LoginButtonForGuest";
import RoundedImage from "@/components/designSystem/profile/RoundedImage";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const LIST = ["최신순", "추천순", "등록일순"];

const MyCommunity = () => {
  const searchParams = useSearchParams();
  const [fixed, setFixed] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const sort = searchParams?.get("sortingTypeName") ?? "최신순";
  const categoryName = searchParams?.get("categoryName") ?? "전체";
  const {
    communityList: { data },
  } = useCommunity(
    undefined,
    {
      sortingTypeName: sort,
      categoryName: categoryName,
    },
    true
  );

  const DATA_COUNT = data?.pages[0].page.totalElements ?? 0;
  const { setRemoveToastShow, removeToastShow } = editStore();
  const onClickSort = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());

    newSearchParams.set("sortingTypeName", value);

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleFixed = (type: boolean) => {
    setFixed(type);
  };

  return (
    <>
      <ResultToast
        bottom="80px"
        isShow={removeToastShow}
        setIsShow={setRemoveToastShow}
        text={COMMUNITY_TOAST_MESSAGES.deletePost}
      />
      <div>
        {isGuestUser() || DATA_COUNT === 0 ? (
          <div className="px-6 relative flex justify-center items-center">
            <div className="fixed top-0 flex flex-col items-center justify-center h-svh">
              <RoundedImage size={80} src="/images/noData.png" />
              <div
                className="text-base font-medium leading-[22.4px] tracking-[-0.025em] text-center text-[var(--color-text-base)]"
                style={{
                  marginTop: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                {isGuestUser() ? (
                  <>
                    <div>로그인 후 이용할 수 있어요</div>
                    <LoginButtonForGuest />
                  </>
                ) : (
                  <>
                    아직 작성한 <br /> 글이 없어요
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <Spacing size={24} />
            {/* SortContainer */}
            <div className="px-6 pb-[11px] border-b border-[rgb(240,240,240)] sticky top-[100px] z-[1001] bg-[var(--color-bg)] box-border">
              <SortHeader
                list={LIST}
                clickSort={onClickSort}
                setFixed={handleFixed}
                sort={sort}
              >
                <div className="text-sm font-medium leading-[16.71px] tracking-[-0.025em]">
                  총&nbsp;
                  <span className="text-[var(--color-keycolor)] font-bold">
                    {DATA_COUNT}건
                  </span>
                </div>
              </SortHeader>
            </div>
            <CommunityInfinite isMine={true} />
          </>
        )}
      </div>
      <Navbar />
    </>
  );
};

export default MyCommunity;
