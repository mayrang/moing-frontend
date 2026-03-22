"use client";
import { useMyApplyTrip } from "@/hooks/myTrip/useMyApplyTrip";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import dayjs from "dayjs";
import React from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import ApplyTripIconBtns from "./ApplyTripIconBtns";
import RoundedImage from "@/components/designSystem/profile/RoundedImage";

import { IMyTripList } from "@/model/myTrip";
import { daysAgo } from "@/utils/time";
import { isGuestUser } from "@/utils/user";
import LoginButtonForGuest from "@/components/LoginButtonForGuest";
import { useRouter } from "next/navigation";
import { useBackPathStore } from "@/store/client/backPathStore";
import HorizonBoxLayout from "@/components/HorizonBoxLayout";

export default function ApplyTrip() {
  const [ref, inView] = useInView();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetching } = useMyApplyTrip();
  const { setTravelDetail } = useBackPathStore();
  const router = useRouter();
  useInfiniteScroll(() => {
    if (inView) {
      !isFetching && hasNextPage && fetchNextPage();
    }
  }, [inView, !isFetching, fetchNextPage, hasNextPage]);
  const clickTrip = (travelNumber: number) => {
    setTravelDetail(`/myTrip`);
    router.push(`/trip/detail/${travelNumber}`);
  };

  const trips = (data?.pages[0].content as IMyTripList["content"]) ?? [];

  const isNoData = trips.length === 0;
  if (isLoading) {
    return null;
  }
  return (
    <div className={`px-6 relative ${isNoData ? "flex justify-center items-center" : ""}`}>
      {isNoData && (
        <div className="fixed top-0 w-full flex flex-col items-center justify-center h-svh">
          <RoundedImage size={80} src="/images/noData.png" />
          <div className="mt-4 flex flex-col items-center justify-center text-center text-base font-semibold leading-[22.4px] tracking-[-0.025em] text-[var(--color-text-base)]">
            {isGuestUser() ? (
              <>
                로그인 후 <br />
                설레는 여행에 참가해 보세요
                <LoginButtonForGuest />
              </>
            ) : (
              <div>
                아직 신청한 여행이 없어요 <br /> 지금 설레는 첫 여행을 찾아볼까요?
              </div>
            )}
          </div>
        </div>
      )}
      {!isLoading &&
        data &&
        data.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.content?.map(
              ({
                travelNumber,
                userName,
                title,
                tags,
                maxPerson,
                location,
                createdAt,
                registerDue,
                nowPerson,
                bookmarked,
              }) => (
                <div
                  key={travelNumber}
                  className="p-4 gap-2 pt-[11px] rounded-[20px] shadow-[0px_2px_4px_3px_#aaaaaa14] mb-4 bg-[var(--color-bg)] relative"
                >
                  <div onClick={() => clickTrip(travelNumber)}>
                    <HorizonBoxLayout
                      isBookmark={true}
                      bookmarked={bookmarked}
                      travelNumber={travelNumber}
                      bookmarkNeed={false}
                      isBar={true}
                      bookmarkPosition="top"
                      userName={userName}
                      title={title}
                      tags={tags}
                      total={maxPerson}
                      location={location}
                      daysAgo={daysAgo(createdAt)}
                      daysLeft={dayjs(registerDue, "YYYY-MM-DD").diff(dayjs().startOf("day"), "day")}
                      recruits={nowPerson}
                    />
                  </div>
                  <ApplyTripIconBtns travelNumber={travelNumber} bookmarked={bookmarked} />
                </div>
              )
            )}
          </React.Fragment>
        ))}
      <div ref={ref} style={{ height: 80 }} />
    </div>
  );
}
