"use client";
import useInfiniteScroll from "@/shared/hooks/useInfiniteScroll";
import { useTripList } from "../hooks/useTripList";
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import HorizonBoxLayout from "@/components/HorizonBoxLayout";
import dayjs from "dayjs";
import FullHeartIcon from "@/shared/ui/icons/FullHeartIcon";
import EmptyHeartIcon from "@/shared/ui/icons/EmptyHeartIcon";
import { authStore } from "@/store/client/authStore";
import { useUpdateBookmark } from "@/hooks/bookmark/useUpdateBookmark";
import { daysAgo } from "@/utils/time";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckingModal } from "@/shared/ui";
import { isGuestUser } from "@/utils/user";
import useViewTransition from "@/shared/hooks/useViewTransition";
import { useBackPathStore } from "@/store/client/backPathStore";

const TripInfiniteList = () => {
  const [ref, inView] = useInView();
  const { setTravelDetail } = useBackPathStore();
  const navigateWithTransition = useViewTransition();
  const searchParams = useSearchParams();
  const engSort = (() => {
    const value = searchParams?.get("sort");
    if (!value || (value !== "recent" && value !== "recommend")) {
      return "recent";
    }
    return value;
  })();

  const { data, isFetching, hasNextPage, fetchNextPage, isLoading } =
    useTripList(engSort);
  useInfiniteScroll(() => {
    if (inView) {
      !isFetching && hasNextPage && fetchNextPage();
    }
  }, [inView, !isFetching, fetchNextPage, hasNextPage]);

  const clickTrip = (travelNumber: number) => {
    setTravelDetail(`/trip/list`);
    document.documentElement.style.viewTransitionName = "forward";
    navigateWithTransition(`/trip/detail/${travelNumber}`);
  };

  return (
    <div className="px-6">
      {!isLoading &&
        data &&
        data.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.content.map((content) => (
              <div
                key={content.travelNumber}
                className="py-[11px] border-b border-[rgb(240,240,240)] relative"
              >
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => clickTrip(content.travelNumber)}
                >
                  <HorizonBoxLayout
                    bookmarkNeed={true}
                    bookmarked={content.bookmarked}
                    travelNumber={content.travelNumber}
                    userName={content.userName}
                    title={content.title}
                    tags={content.tags}
                    total={content.maxPerson}
                    location={content.location}
                    daysAgo={daysAgo(content.createdAt)}
                    daysLeft={dayjs(content.registerDue, "YYYY-MM-DD").diff(
                      dayjs().startOf("day"),
                      "day"
                    )}
                    recruits={content.nowPerson}
                  />
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      <div ref={ref} style={{ height: 80 }} />
    </div>
  );
}; // 아래 북마크 버튼은 Link에 구속되지 않도록 하는 버튼.
interface BookmarkButtonProps {
  bookmarked: boolean;
  travelNumber: number;
}
const BookmarkButton = ({ bookmarked, travelNumber }: BookmarkButtonProps) => {
  const { accessToken, userId } = authStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { postBookmarkMutation, deleteBookmarkMutation } = useUpdateBookmark(
    accessToken!,
    userId!,
    travelNumber
  );
  const bookmarkClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isGuestUser()) {
      setShowLoginModal(true);
      return;
    }
    if (bookmarked) {
      deleteBookmarkMutation();
    } else {
      // 북마크 추가.
      postBookmarkMutation();
    }
  };

  return (
    <>
      <CheckingModal
        isModalOpen={showLoginModal}
        onClick={() => {
          localStorage.setItem("loginPath", pathname);
          router.push("/login");
        }}
        modalMsg={`로그인 후 이용할 수 있어요.\n로그인 하시겠어요?`}
        modalTitle="로그인 안내"
        modalButtonText="로그인"
        setModalOpen={setShowLoginModal}
      />
      <button
        type="button"
        className="absolute top-[18px] right-[6px]"
        onClick={bookmarkClickHandler}
      >
        {bookmarked ? (
          <FullHeartIcon width={24} height={21.4} />
        ) : (
          <EmptyHeartIcon
            width={24}
            height={21.4}
            stroke="var(--color-muted3)"
          />
        )}
      </button>
    </>
  );
};

export default TripInfiniteList;
