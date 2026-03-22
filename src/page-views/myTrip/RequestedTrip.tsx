"use client";
import MyTripHorizonBoxLayout from "@/components/MyTripHorizonBoxLayout";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import dayjs from "dayjs";
import React from "react";
import { useInView } from "react-intersection-observer";
import BookmarkIconBtns from "./BookmarkIconBtns";
import RoundedImage from "@/components/designSystem/profile/RoundedImage";
import { IMyTripList } from "@/model/myTrip";
import { daysAgo } from "@/utils/time";
import { useRequestedTrip } from "@/hooks/myTrip/useMyRequestedTrip";
import LoginButtonForGuest from "@/components/LoginButtonForGuest";
import { isGuestUser } from "@/utils/user";
import { useBackPathStore } from "@/store/client/backPathStore";
import useViewTransition from "@/hooks/useViewTransition";

export default function RequestedTrip() {
  const [ref, inView] = useInView();
  const { setTravelDetail } = useBackPathStore();
  const navigateWithTransition = useViewTransition();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetching } = useRequestedTrip();
  useInfiniteScroll(() => {
    if (inView) {
      !isFetching && hasNextPage && fetchNextPage();
    }
  }, [inView, !isFetching, fetchNextPage, hasNextPage]);

  const trips = (data?.pages[0].content as IMyTripList["content"]) ?? [];

  const isNoData = trips.length === 0;

  const clickTrip = (travelNumber: number) => {
    setTravelDetail(`/requestedTrip`);
    document.documentElement.style.viewTransitionName = "forward";
    navigateWithTransition(`/trip/detail/${travelNumber}`);
  };

  if (isLoading) {
    return null;
  }
  return (
    <div className={`px-6 relative ${isNoData ? "flex justify-center items-center" : ""}`}>
      {isNoData && (
        <div className="fixed top-0 flex flex-col items-center justify-center h-svh">
          <RoundedImage size={80} src="/images/noData.png" />
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
            }}
            className="text-base font-medium leading-[22.4px] tracking-[-0.025em] text-[var(--color-text-base)]"
          >
            {isGuestUser() ? (
              <>
                <div>로그인 후 이용할 수 있어요</div>
                <LoginButtonForGuest />
              </>
            ) : (
              <>
                아직 신청 대기 중인 <br /> 여행이 없어요
              </>
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
                location,
                title,
                tags,
                maxPerson,
                nowPerson,
                createdAt,
                registerDue,
                bookmarked,
              }) => (
                <div
                  key={travelNumber}
                  className="relative pt-[11px] px-4 pb-4 gap-2 rounded-[20px] shadow-[0px_2px_4px_3px_#aaaaaa14] mb-4 bg-[var(--color-bg)]"
                >
                  <div onClick={() => clickTrip(travelNumber)}>
                    <MyTripHorizonBoxLayout
                      travelNumber={travelNumber}
                      userName={userName}
                      location={location}
                      title={title}
                      tags={tags}
                      total={maxPerson}
                      daysAgo={daysAgo(createdAt)}
                      daysLeft={dayjs(registerDue, "YYYY-MM-DD").diff(dayjs().startOf("day"), "day")}
                      recruits={nowPerson}
                      bookmarked={bookmarked}
                    />
                  </div>
                  <BookmarkIconBtns travelNumber={travelNumber} bookmarked={bookmarked} />
                </div>
              )
            )}
          </React.Fragment>
        ))}

      <div ref={ref} style={{ height: 80 }} />
    </div>
  );
}
