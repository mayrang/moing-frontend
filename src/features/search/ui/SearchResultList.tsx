"use client";
import { ISearchData } from "@/entities/search";
import React from "react";
import Spacing from "@/components/Spacing";
import HorizonBoxLayout from "@/components/HorizonBoxLayout";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { searchStore } from "@/store/client/searchStore";
import SortHeader from "@/components/SortHeader";
import { formatTime } from "@/utils/time";
import { useSearchParams } from "next/navigation";
import { useBackPathStore } from "@/store/client/backPathStore";
import useViewTransition from "@/shared/hooks/useViewTransition";
dayjs.extend(customParseFormat);

const LIST = ["추천순", "최신순", "등록일순"];

const SearchResultList = ({
  searchResult,
  setBookmarked,
}: {
  searchResult: ISearchData[];
  setBookmarked: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { sort, setSort } = searchStore();
  const { setTravelDetail } = useBackPathStore();
  const navigateWithTransition = useViewTransition();

  const searchParams = useSearchParams();
  const keyword = searchParams?.get("keyword") ?? "";

  const clickSort = (value: string) => {
    setSort(value as "추천순" | "최신순" | "등록일순");
  };

  const clickTrip = (travelNumber: number) => {
    setTravelDetail(`/search/travel`);
    document.documentElement.style.viewTransitionName = "forward";
    navigateWithTransition(`/trip/detail/${travelNumber}?keyword=${keyword}`);
  };

  return (
    <div>
      <Spacing size={15} />
      <SortHeader sort={sort} list={LIST} clickSort={clickSort}>
        <div className="text-sm font-medium leading-[16.71px] tracking-[-0.025em]">
          총&nbsp;
          <span className="text-[var(--color-keycolor)] font-bold">
            {searchResult[0].page.totalElements}건
          </span>
        </div>
      </SortHeader>
      <Spacing size={16} />
      {searchResult.map((page) =>
        page.content.map((content) => (
          <div
            key={content.travelNumber}
            className="py-[11px] border-b border-[rgb(240,240,240)] relative"
          >
            <div onClick={() => clickTrip(content.travelNumber)}>
              <HorizonBoxLayout
                bookmarkNeed={true}
                bookmarked={content.bookmarked}
                travelNumber={content.travelNumber}
                userName={content.userName}
                title={content.title}
                tags={content.tags}
                location={content.location}
                total={content.maxPerson}
                daysAgo={formatTime(content.createdAt)}
                daysLeft={dayjs(content.registerDue, "YYYY-MM-DD").diff(
                  dayjs().startOf("day"),
                  "day"
                )}
                recruits={content.nowPerson}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SearchResultList;
