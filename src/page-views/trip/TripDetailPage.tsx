"use client";
import ButtonContainer from "@/components/ButtonContainer";
import Badge from "@/components/designSystem/Badge";
import CheckingModal from "@/components/designSystem/modal/CheckingModal";
import RoundedImage from "@/components/designSystem/profile/RoundedImage";
import ResultToast from "@/components/designSystem/toastMessage/resultToast";

import ArrowIcon from "@/components/icons/ArrowIcon";
import Calendar from "@/components/icons/Calendar";
import PlaceIcon from "@/components/icons/PlaceIcon";
import Spacing from "@/components/Spacing";
import { authStore } from "@/store/client/authStore";
import useEnrollment from "@/hooks/enrollment/useEnrollment";
import { tripDetailStore } from "@/store/client/tripDetailStore";
import React, { useEffect, useRef, useState } from "react";
import CompanionsView from "./CompanionsView";
import { daysAgo } from "@/utils/time";
import useTripDetail from "@/hooks/tripDetail/useTripDetail";
import NoticeModal from "@/components/designSystem/modal/NoticeModal";
import { editStore } from "@/store/client/editStore";
import { isGuestUser } from "@/utils/user";
import { useUpdateBookmark } from "@/hooks/bookmark/useUpdateBookmark";
import ApplyListButton from "@/components/designSystem/Buttons/ApplyListButton";
import useViewTransition from "@/hooks/useViewTransition";
import { useParams, usePathname, useRouter } from "next/navigation";
import { myPageStore } from "@/store/client/myPageStore";
import TopModal from "@/components/TopModal";
import { formatDateRange } from "@/page-views/trip/create/CalendarClient";
import EveryBodyIcon from "@/components/icons/EveryBodyIcon";
import OnlyMaleIcon from "@/components/icons/OnlyMaleIcon";
import OnlyFemaleIcon from "@/components/icons/OnlyFemaleIcon";
import RegionWrapper from "@/page-views/trip/create/CreateTripDetail/RegionWrapper";
import dynamic from "next/dynamic";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPlans } from "@/api/trip";
import { useInView } from "react-intersection-observer";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useComment from "@/hooks/comment/useComment";

const MapContainer = dynamic(
  () => import("@/page-views/trip/create/CreateTripDetail/MapContainer"),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-gray-200 animate-pulse" /> }
);
const EmblaCarousel = dynamic(() => import("@/components/TripCarousel"), {
  ssr: false,
  loading: () => <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded-xl" />,
});
import { userProfileOverlayStore } from "@/store/client/userProfileOverlayStore";

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

function verifyGenderType(genderType: string | null, gender: string) {
  if (!genderType || genderType === "모두") {
    return true;
  } else {
    if (genderType === "남자만" && gender === "M") {
      return true;
    } else if (genderType === "여자만" && gender === "F") {
      return true;
    }
    return false;
  }
}

interface Companion {
  userNumber: number;
  userName: string;
  ageGroup: string;
}
const LOGIN_ASKING_FOR_WATCHING_COMMENT = `여행에 참여한 멤버만 볼 수 있어요.\n로그인 하시겠어요?`;
const LOGIN_ASKING_FOR_APPLY_TRIP = `로그인하여 설레는 여행에\n참가해 보세요!`;

export default function TripDetail() {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalTextForLogin, setModalTextForLogin] = useState(
    LOGIN_ASKING_FOR_WATCHING_COMMENT,
  );
  const detailRef = useRef<HTMLDivElement | null>(null);
  const [isApplyToast, setIsApplyToast] = useState(false);
  const [isCancelToast, setIsCancelToast] = useState(false);
  const { setProfileShow, setUserProfileUserId } = userProfileOverlayStore();

  // 신청 대기 모달
  const [noticeModal, setNoticeModal] = useState(false);

  const [isAccepted, setIsAccepted] = useState(false);
  const { userId, accessToken, isGuestUser: isGuestUserStore } = authStore();
  const { gender } = myPageStore();
  const [isCommentUpdated, setIsCommentUpdated] = useState(false);
  const [isKakaoMapLoad, setIsKakaooMapLoad] = useState(false);
  const { travelNumber } = useParams<{ travelNumber: string }>();
  const {
    location,
    userName,
    createdAt,
    title,
    startDate,
    endDate,
    details,
    tags,
    bookmarkCount,
    locationName,
    addInitGeometry,
    initGeometry,
    addLocationName,
    enrollCount,
    viewCount,
    maxPerson,
    genderType,
    hostUserCheck,
    enrollmentNumber,
    nowPerson,
    applySuccess,
    setApplySuccess,
    profileUrl,
    bookmarked,
    userNumber,
  } = tripDetailStore();
  const router = useRouter();
  if (isNaN(parseInt(travelNumber))) {
    router.replace("/");
  }

  const {
    commentList: { data: commentData },
  } = useComment("travel", Number(travelNumber));
  useEffect(() => {
    if (commentData && commentData?.pages[0]?.page?.totalElements > 0) {
      setIsCommentUpdated(true);
    }
  }, [JSON.stringify(commentData)]);

  // const isClosed = !Boolean(daysLeft(`${dueDate.year}-${dueDate.month}-${dueDate.day}`) > 0) || maxPerson === nowPerson;
  const isClosed = false;
  const { cancel, cancelMutation } = useEnrollment(parseInt(travelNumber));
  const { tripEnrollmentCount, companions } = useTripDetail(
    parseInt(travelNumber),
  );
  const nowEnrollmentCount = tripEnrollmentCount.data as any;
  const { editToastShow, setEditToastShow } = editStore();
  const allCompanions = (companions as any)?.data?.companions;
  const alreadyApplied = !!enrollmentNumber;
  const [ref, inView] = useInView();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    refetch,
    isFetching,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["plans", travelNumber],
    queryFn: ({ pageParam }) => {
      return getPlans(Number(travelNumber), pageParam) as any;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!travelNumber,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.nextCursor) {
        return undefined;
      } else {
        return lastPage?.nextCursor;
      }
    },
  });
  const combinedPlans = data?.pages.reduce(
    (acc, page) => acc.concat(page.plans),
    [],
  );
  useInfiniteScroll(() => {
    if (inView) {
      !isFetching && hasNextPage && fetchNextPage();
    }
  }, [inView, !isFetching, hasNextPage]);

  //북마크
  const { postBookmarkMutation, deleteBookmarkMutation } = useUpdateBookmark(
    accessToken!,
    userId!,
    parseInt(travelNumber),
  );
  const bookmarkClickHandler = () => {
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

  const companionsViewHandler = () => {
    setPersonViewClicked(true);
  };

  useEffect(() => {
    const handleLoad = () => {
      window.kakao.maps.load(() => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(location, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK && result?.[0]) {
            addLocationName({
              locationName: location,
              mapType: "kakao",
              countryName: "대한민국",
            });
          } else {
            addLocationName({
              locationName: location,
              mapType: "google",
              countryName: "",
            });
          }
        });
      });
    };
    if (isKakaoMapLoad) {
      handleLoad();
    }
  }, [isKakaoMapLoad, location]);

  useEffect(() => {
    if (detailRef.current) {
      detailRef.current.addEventListener("scroll", (e) => {
        e.stopPropagation();
      });
    }
  }, [detailRef.current]);

  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`;

    script.addEventListener("load", () => {
      setIsKakaooMapLoad(true);
    });
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", () => {
        setIsKakaooMapLoad(false);
      });
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (applySuccess) {
      setIsApplyToast(true);
      setApplySuccess(false);
    }
  }, [applySuccess]);

  useEffect(() => {
    allCompanions?.map((company: Companion) => {
      if (company.userNumber === userId) {
        setIsAccepted(true);
      }
    });
  }, [JSON.stringify(allCompanions)]);

  const navigateWithTransition = useViewTransition();
  // const { year, month, day } = dueDate;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMapFull, setIsMapFull] = useState(false);
  const [openItemIndex, setOpenItemIndex] = useState(0);
  const [topModalHeight, setTopModalHeight] = useState(0);
  // const DAY = new Date(`${year}/${month}/${day}`);
  //const dayOfWeek = WEEKDAY[DAY.getDay()];
  const [personViewClicked, setPersonViewClicked] = useState(false);
  const pathname = usePathname();
  const buttonClickHandler = () => {
    if (isGuestUser()) {
      setShowLoginModal(true);
      setModalTextForLogin(LOGIN_ASKING_FOR_APPLY_TRIP);
    } else if (hostUserCheck) {
      document.documentElement.style.viewTransitionName = "forward";
      navigateWithTransition(`/trip/enrollmentList/${travelNumber}`);
    } else {
      if (enrollmentNumber) {
        setShowCancelModal(true);
      } else {
        // 신청하러 바로 이동.
        document.documentElement.style.viewTransitionName = "forward";
        navigateWithTransition(`/trip/apply/${travelNumber}`);
      }
    }
  };
  const onClickCancelApply = async () => {
    if (enrollmentNumber) {
      try {
        await cancel(enrollmentNumber);
      } catch (err) {
        // cancelMutation ERROR
      }
    }
  };

  const moveToUserProfilePage = (userNumber: number) => {
    setUserProfileUserId(userNumber);
    setProfileShow(true);
  };

  useEffect(() => {
    if (cancelMutation.isSuccess) {
      setIsCancelToast(true);
    }
  }, [cancelMutation.isSuccess]);

  const commentClickHandler = () => {
    if (isGuestUser()) {
      // 로그인을 하지 않은 게스트 유저.
      setShowLoginModal(true);
      setModalTextForLogin(LOGIN_ASKING_FOR_WATCHING_COMMENT);
      return;
    } else if (isAccepted || hostUserCheck) {
      document.documentElement.style.viewTransitionName = "forward";
      navigateWithTransition(`/trip/comment/${travelNumber}`);
      return;
    } else if (!hostUserCheck && !enrollmentNumber) {
      // 주최자가 아니며, 신청 번호가 없는 사람은 댓글을 볼 수 없음.
      setShowApplyModal(true);
    } else {
      // 신청 대기중인 경우.
      setNoticeModal(true);
    }
  };

  return (
    <>
      <ResultToast
        height={120}
        isShow={editToastShow}
        setIsShow={setEditToastShow}
        text="게시글이 수정되었어요."
      />
      <NoticeModal
        isModalOpen={noticeModal}
        modalMsg={`여행에 참가가 확정된\n 멤버만 볼 수 있어요.`}
        modalTitle="참가 신청 대기중"
        setModalOpen={setNoticeModal}
      />
      <ResultToast
        height={80}
        isShow={isCancelToast}
        setIsShow={setIsCancelToast}
        text="여행 신청이 취소 되었어요."
      />
      <ResultToast
        height={80}
        isShow={isApplyToast}
        setIsShow={setIsApplyToast}
        text="여행 신청이 완료 되었어요."
      />

      <CheckingModal
        isModalOpen={showLoginModal}
        onClick={() => {
          localStorage.setItem("loginPath", pathname);
          router.replace("/login");
        }}
        modalMsg={"로그인 후 여행을 즐겨찾기 해보세요."}
        modalTitle="로그인 안내"
        modalButtonText="로그인"
        setModalOpen={setShowLoginModal}
      />

      <CheckingModal
        isModalOpen={showApplyModal}
        onClick={() => {
          document.documentElement.style.viewTransitionName = "forward";
          navigateWithTransition(`/trip/apply/${travelNumber}`);
        }}
        modalMsg="여행에 참여한 멤버만 볼 수 있어요.
여행 참가 신청을 할까요?"
        modalTitle="참가 신청 안내"
        modalButtonText="신청하기"
        setModalOpen={setShowApplyModal}
      />

      <CheckingModal
        isModalOpen={showCancelModal}
        onClick={onClickCancelApply}
        modalMsg="아쉬워요🥺
정말 여행을 취소하시겠어요?"
        modalTitle="참가 취소"
        modalButtonText="취소하기"
        setModalOpen={setShowCancelModal}
      />

      <div
        ref={containerRef}
        role="region"
        tabIndex={0}
        aria-label="여행 상세 내용"
        className="px-6 overflow-y-auto relative h-[calc(100svh-116px)] no-scrollbar overscroll-none pb-[104px]"
      >
        <TopModal
          isToastShow={false}
          containerRef={containerRef}
          setIsMapFull={setIsMapFull}
          onHeightChange={setTopModalHeight}
        >
          <div className="px-6">
            <div>
              <div
                className="mt-2 flex items-center cursor-pointer"
                onClick={() => moveToUserProfilePage(userNumber)}
              >
                {/* 프로필 */}
                <RoundedImage src={profileUrl} size={40} />
                <div style={{ marginLeft: "8px" }}>
                  <div className="text-base font-semibold leading-[19.09px] text-left text-[var(--color-text-base)] mb-1">
                    {userName}
                  </div>
                  <div className="font-normal text-sm leading-[16.71px] text-[var(--color-text-muted)]">
                    {daysAgo(createdAt)}
                  </div>
                </div>
              </div>
              {/* 제목  */}
              <div className="mt-8 text-xl font-semibold text-left">
                {title}
              </div>
              {/* 내용 */}
              <div
                ref={detailRef}
                tabIndex={0}
                aria-label="여행 상세 설명"
                className="mt-4 text-base max-h-[100px] overflow-y-auto whitespace-pre-line font-normal leading-[22.4px] text-left text-[var(--color-text-base)]"
              >
                {details}
              </div>
              {/*태그   */}
              <div className="mt-8 flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <Badge
                    key={tag}
                    isDueDate={false}
                    text={tag}
                    height="22px"
                    backgroundColor="var(--color-muted4)"
                    color="var(--color-text-muted)"
                    fontWeight="500"
                  />
                ))}
              </div>
            </div>
            <div className="my-2 h-[38px] py-4 flex text-xs font-normal leading-[14.32px] text-left text-[var(--color-text-muted2)]">
              <div>신청 {enrollCount}</div>
              <div style={{ margin: "0px 4px" }}> · </div>
              <div>관심 {bookmarkCount}</div>
              <div style={{ margin: "0px 4px" }}> · </div>
              <div>조회수 {viewCount}</div>
            </div>

            <div className="bg-[#e7e7e7] w-full h-[1px]" />
            <div className="py-[11px] pl-2 flex items-center h-[70px] justify-between">
              <div className="flex items-center">
                <div className="flex items-center w-[100px] gap-2 mr-3">
                  <PlaceIcon width={21} height={24} />

                  <div className="text-sm leading-5 text-[var(--color-text-muted)] font-semibold">
                    장소
                  </div>
                </div>
                <div className="text-sm leading-5 text-[var(--color-text-base)] font-medium">
                  <RegionWrapper
                    locationName={locationName}
                    addInitGeometry={addInitGeometry}
                    addLocationName={addLocationName}
                    isDetail
                    location={location}
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#e7e7e7] w-full h-[1px]" />

            <div className="py-[11px] pl-2 flex items-center h-[70px] justify-between">
              <div className="flex items-center">
                <div className="flex items-center w-[100px] gap-2 mr-3">
                  <Calendar />
                  <div className="text-sm leading-5 text-[var(--color-text-muted)] font-semibold">
                    여행 날짜
                  </div>
                </div>
                <div className="text-sm leading-5 text-[var(--color-text-base)] font-medium">
                  {startDate && endDate
                    ? formatDateRange(startDate, endDate)
                    : "날짜를 선택하세요."}
                </div>
              </div>
            </div>
            <div className="bg-[#e7e7e7] w-full h-[1px]" />

            <button
              type="button"
              className="py-[11px] pl-2 w-full flex items-center justify-between"
              onClick={companionsViewHandler}
            >
              <div className="flex items-center">
                <div className="flex items-center w-[100px] gap-2 mr-3">
                  {genderType === "모두" ? (
                    <EveryBodyIcon selected size={24} />
                  ) : genderType === "남자만" ? (
                    <OnlyMaleIcon selected size={24} />
                  ) : (
                    <OnlyFemaleIcon selected size={24} />
                  )}
                  <div className="text-sm leading-5 text-[var(--color-text-muted)] font-semibold">
                    {genderType}
                  </div>
                </div>
                <div className="text-sm leading-5 text-[var(--color-text-base)] font-medium">
                  {nowPerson} / {maxPerson}
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12">
                <ArrowIcon />
              </div>
            </button>
          </div>
        </TopModal>
        <div
          className="min-h-svh transition-[padding-top] duration-300 ease-out overscroll-none"
          style={{
            paddingTop: isMapFull ? "0px" : `0px`,
          }}
        >
          <MapContainer
            plans={combinedPlans ?? []}
            locationName={locationName}
            index={openItemIndex + 1}
            isMapFull={isMapFull}
            lat={initGeometry?.lat || 37.57037778}
            lng={initGeometry?.lng || 126.9816417}
            zoom={9}
          />
          <div className="mt-6">
            <div className="text-lg font-medium text-black leading-[21px]">
              여행 일정
            </div>
            {combinedPlans?.length > 0 ? (
              <>
                <Spacing size={16} />
                <div className="flex flex-col gap-4">
                  {!isLoading && startDate && data && (
                    <EmblaCarousel
                      startDate={startDate}
                      setOpenItemIndex={setOpenItemIndex}
                      openItemIndex={openItemIndex}
                      inView={
                        <div ref={ref} style={{ width: 5, height: "100%" }} />
                      }
                      slides={combinedPlans} // 모든 데이터를 하나의 슬라이드 컴포넌트에 전달
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex pt-[52px] flex-col items-center justify-center h-full">
                  <img
                    alt="댓글이 없습니다"
                    width={80}
                    height={80}
                    src={"/images/noData.png"}
                  />
                  <Spacing size={16} />
                  <div className="text-sm font-normal leading-5 tracking-[-0.025em] text-center">
                    등록된 일정이 없어요
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Spacing size={120} />
      <ButtonContainer backgroundColor="var(--color-search-bg)">
        {/* auth 복구 대기 중 (서버 프리페치 null토큰 → AppShell 토큰 복구 전) 스켈레톤 */}
        {!(!!accessToken || isGuestUserStore) ? (
          <div
            className="h-[54px] w-full rounded-[12px] bg-[var(--color-muted3)] animate-pulse"
            aria-hidden="true"
          />
        ) : (
          <ApplyListButton
            hostUserCheck={hostUserCheck}
            nowEnrollmentCount={nowEnrollmentCount}
            bookmarkOnClick={bookmarkClickHandler}
            bookmarked={bookmarked}
            onClick={buttonClickHandler}
            disabled={
              (hostUserCheck && nowEnrollmentCount === 0) ||
              (!hostUserCheck && !verifyGenderType(genderType, gender)) ||
              isAccepted ||
              isClosed
            }
            addStyle={{
              backgroundColor: isClosed
                ? "var(--color-muted3)"
                : !verifyGenderType(genderType, gender) || isAccepted
                  ? "var(--color-muted3)"
                  : hostUserCheck
                    ? nowEnrollmentCount > 0
                      ? "var(--color-keycolor)"
                      : "var(--color-muted3)"
                    : "var(--color-keycolor)",
              color: isClosed
                ? "var(--color-muted4)"
                : !verifyGenderType(genderType, gender)
                  ? "var(--color-text-muted)"
                  : hostUserCheck
                    ? nowEnrollmentCount > 0
                      ? "var(--color-muted4)"
                      : "var(--color-text-muted)"
                    : "var(--color-muted4)",
            }}
            text={
              hostUserCheck
                ? "참가 신청 목록"
                : isAccepted
                  ? "참가 중인 여행"
                  : alreadyApplied
                    ? "참가 신청 취소"
                    : "참가 신청 하기"
            }
          />
        )}
      </ButtonContainer>
      <CompanionsView
        isOpen={personViewClicked}
        setIsOpen={setPersonViewClicked}
      />

      <div className="h-svh w-full pointer-events-none fixed top-0 min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 z-[1000]">
        <button
          type="button"
          aria-label={isCommentUpdated ? "새 댓글 보기" : "댓글 보기"}
          className="absolute pointer-events-auto right-6 bottom-[124px] w-[70px] h-[70px] rounded-full flex justify-center items-center text-white bg-[var(--color-text-base)] z-[1000] text-[32px]"
          onClick={commentClickHandler}
        >
          {isCommentUpdated ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_5570_2993)">
                <path
                  d="M25 18.6667C25 19.315 24.7425 19.9367 24.284 20.3952C23.8256 20.8536 23.2039 21.1111 22.5556 21.1111H7.88889L3 26V6.44444C3 5.79614 3.25754 5.17438 3.71596 4.71596C4.17438 4.25754 4.79614 4 5.44444 4H22.5556C23.2039 4 23.8256 4.25754 24.284 4.71596C24.7425 5.17438 25 5.79614 25 6.44444V18.6667Z"
                  fill="#FEFEFE"
                />
                <path
                  d="M9.625 12.8267H18.375"
                  stroke="#1A1A1A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.625 8.75H18.375"
                  stroke="#1A1A1A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.625 16.625H18.375"
                  stroke="#1A1A1A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="25"
                  cy="4"
                  r="4"
                  fill="#FF2E2E"
                  stroke="#1A1A1A"
                  strokeWidth="2"
                />
              </g>
              <defs>
                <clipPath id="clip0_5570_2993">
                  <rect width="28" height="28" fill="white" />
                </clipPath>
              </defs>
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M25 18.6667C25 19.315 24.7425 19.9367 24.284 20.3952C23.8256 20.8536 23.2039 21.1111 22.5556 21.1111H7.88889L3 26V6.44444C3 5.79614 3.25754 5.17438 3.71596 4.71596C4.17438 4.25754 4.79614 4 5.44444 4H22.5556C23.2039 4 23.8256 4.25754 24.284 4.71596C24.7425 5.17438 25 5.79614 25 6.44444V18.6667Z"
                fill="#FEFEFE"
              />
              <path
                d="M9.625 12.8267H18.375"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.625 8.75H18.375"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.625 16.625H18.375"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
