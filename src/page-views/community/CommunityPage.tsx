"use client";
import AlarmIcon from "@/components/icons/AlarmIcon";
import Spacing from "@/components/Spacing";
import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/page-views/home/Navbar";
import SortHeader from "@/components/SortHeader";
import CreateTripButton from "@/page-views/home/CreateTripButton";
import CategoryList from "@/components/community/CategoryList";
import SearchIcon from "@/components/icons/SearchIcon";
import CommunityInfinite from "@/components/community/CommunityInfinite";
import ResultToast from "@/components/designSystem/toastMessage/resultToast";
import { editStore } from "@/store/client/editStore";
import { COMMUNITY_TOAST_MESSAGES } from "@/constants/toastMessages";
import { useBackPathStore } from "@/store/client/backPathStore";
import CustomLink from "@/components/CustomLink";
import { isGuestUser } from "@/utils/user";

const LIST = ["최신순", "추천순", "등록일순"];
const COMMUNITY_CATEGORY = ["전체", "잡담", "여행팁", "후기"];

const Community = () => {
  const searchParams = useSearchParams();
  const [fixed, setFixed] = useState(true);
  const pathname = usePathname();
  const category = searchParams?.get("categoryName") ?? "전체";
  const sort = searchParams?.get("sortingTypeName") ?? "최신순";
  const { setNotification } = useBackPathStore();
  const router = useRouter();
  const { setRemoveToastShow, removeToastShow } = editStore();
  const onClickSort = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());

    newSearchParams.set("sortingTypeName", value);

    router.push(pathname + "?" + newSearchParams);
  };
  const handleNotification = () => {
    setNotification("/community");
    router.push(`/notification`);
  };

  const onClickCategory = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());

    if (value === "잡담") {
      newSearchParams.set("categoryName", "잡담");
    } else if (value === "여행팁") {
      newSearchParams.set("categoryName", "여행팁");
    } else if (value === "후기") {
      newSearchParams.set("categoryName", "후기");
    } else {
      newSearchParams.set("categoryName", "전체");
    }
    router.push(pathname + "?" + newSearchParams);
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
        {/* SearchContainer */}
        <div className="flex px-6 pt-[52px] h-[116px] items-center gap-[22px] sticky top-0 pb-4 bg-[var(--color-bg)] z-[1000]">
          <h1 className="text-xl font-semibold flex-1">커뮤니티</h1>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12">
              <CustomLink to={`/search/community`}>
                <SearchIcon width={24} height={22} />
              </CustomLink>
            </div>
            {!isGuestUser() && (
              <div className="flex items-center justify-center w-12 h-12">
                <div
                  onClick={handleNotification}
                  style={{ cursor: "pointer" }}
                >
                  <AlarmIcon stroke="var(--color-text-base)" />
                </div>
              </div>
            )}
          </div>
        </div>

        <Spacing size={24} />
        {/* SortContainer */}
        <div className="px-6 pb-[11px] border-b border-[rgb(240,240,240)] sticky top-[100px] z-[1001] bg-[var(--color-bg)] box-border">
          <SortHeader
            list={LIST}
            clickSort={onClickSort}
            setFixed={handleFixed}
            sort={sort}
          >
            <CategoryList
              type={category}
              setType={onClickCategory}
              list={COMMUNITY_CATEGORY}
            />
          </SortHeader>
        </div>
        <CommunityInfinite />
      </div>
      {fixed && <CreateTripButton type="community" />}
      <Navbar />
    </>
  );
};

export default Community;
