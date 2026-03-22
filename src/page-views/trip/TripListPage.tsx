"use client";
import InputField from "@/components/designSystem/input/InputField";
import AlarmIcon from "@/components/icons/AlarmIcon";
import RelationSearchIcon from "@/components/icons/RelationSearchIcon";
import Spacing from "@/components/Spacing";
import PopularPlaceList from "@/components/triplist/PopularPlaceList";

import { authStore } from "@/store/client/authStore";
import React, { useState } from "react";
import Navbar from "@/page-views/home/Navbar";
import TripInfiniteList from "@/components/triplist/TripInfiniteList";
import SortHeader from "@/components/SortHeader";
import { useTripList } from "@/hooks/useTripList";
import CreateTripButton from "@/page-views/home/CreateTripButton";
import { useBackPathStore } from "@/store/client/backPathStore";
import useViewTransition from "@/hooks/useViewTransition";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isGuestUser } from "@/utils/user";

const LIST = ["최신순", "추천순"];

const TripList = () => {
  const searchParams = useSearchParams();
  const [fixed, setFixed] = useState(true);
  const { setSearchTravel, setNotification } = useBackPathStore();
  const router = useRouter();
  const pathname = usePathname();

  const sort = (() => {
    const value = searchParams?.get("sort");
    if (!value || (value !== "recent" && value !== "recommend")) {
      return "최신순";
    }
    return value === "recent" ? "최신순" : "추천순";
  })();
  const engSort = (() => {
    const value = searchParams?.get("sort");
    if (!value || (value !== "recent" && value !== "recommend")) {
      return "recent";
    }
    return value;
  })();

  const navigateWithTransition = useViewTransition();
  const { data } = useTripList(engSort);
  const onClickSort = (value: string) => {
    if (value === "추천순") {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("sort", "recommend");

      router.push(`${pathname}?${params.toString()}`);
    } else {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("sort", "recent");

      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleNotification = () => {
    if (isGuestUser()) {
      return;
    }
    setNotification("/community");
    document.documentElement.style.viewTransitionName = "forward";
    navigateWithTransition(`/notification`);
  };

  const onClickSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSearchTravel("/trip/list");
    document.documentElement.style.viewTransitionName = "forward";
    navigateWithTransition("/search/travel");
  };

  const handleFixed = (type: boolean) => {
    setFixed(type);
  };
  return (
    <>
      <div>
        <div className="flex px-6 pt-[52px] pb-4 items-center gap-[22px] sticky top-0 h-[116px] bg-[var(--color-bg)] z-[1000] justify-between">
          <div style={{ flex: 1 }}>
            <button style={{ width: "100%" }} onClick={onClickSearch}>
              <InputField
                isRemove={false}
                placeholder="어디로 여행을 떠날까요?"
                icon={<RelationSearchIcon />}
                handleRemoveValue={() => {}}
                disabled
                style={{ pointerEvents: "none" }}
              />
            </button>
          </div>

          {!isGuestUser() && (
            <div className="cursor-pointer w-12 flex items-center justify-center" onClick={handleNotification}>
              <AlarmIcon />
            </div>
          )}
        </div>
        <Spacing size={8} />
        <PopularPlaceList />
        <Spacing size={31} />
        <div className="px-6 pb-[11px] border-b border-[rgb(240,240,240)] sticky top-[116px] z-[1001] bg-[var(--color-bg)]">
          <SortHeader
            list={LIST}
            clickSort={onClickSort}
            setFixed={handleFixed}
            sort={sort}
          >
            <div className="text-sm font-medium leading-[16.71px] tracking-[-0.025em]">
              총&nbsp;<span className="text-[#3e8d00] font-bold">{data?.pages[0].page.totalElements ?? 0}건</span>
            </div>
          </SortHeader>
        </div>
        <TripInfiniteList />
      </div>
      {fixed && <CreateTripButton />}
      <Navbar />
    </>
  );
};


export default TripList;
