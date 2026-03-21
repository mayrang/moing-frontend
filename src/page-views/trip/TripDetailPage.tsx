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
import { palette } from "@/styles/palette";
import styled from "@emotion/styled";

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
import MapContainer from "@/page-views/trip/create/CreateTripDetail/MapContainer";
import { formatDateRange } from "@/page-views/trip/create/CalendarClient";
import EveryBodyIcon from "@/components/icons/EveryBodyIcon";
import OnlyMaleIcon from "@/components/icons/OnlyMaleIcon";
import OnlyFemaleIcon from "@/components/icons/OnlyFemaleIcon";
import RegionWrapper from "@/page-views/trip/create/CreateTripDetail/RegionWrapper";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getPlans } from "@/api/trip";
import { useInView } from "react-intersection-observer";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import EmblaCarousel from "@/components/TripCarousel";
import useComment from "@/hooks/comment/useComment";
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
  const [modalTextForLogin, setModalTextForLogin] = useState(LOGIN_ASKING_FOR_WATCHING_COMMENT);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const [isApplyToast, setIsApplyToast] = useState(false);
  const [isCancelToast, setIsCancelToast] = useState(false);
  const { setProfileShow, setUserProfileUserId } = userProfileOverlayStore();

  // 신청 대기 모달
  const [noticeModal, setNoticeModal] = useState(false);

  const [isAccepted, setIsAccepted] = useState(false);
  const { userId, accessToken } = authStore();
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
  const { tripEnrollmentCount } = useTripDetail(parseInt(travelNumber));
  const nowEnrollmentCount = tripEnrollmentCount.data as any;
  const { editToastShow, setEditToastShow } = editStore();
  const { companions } = useTripDetail(parseInt(travelNumber));
  const allCompanions = (companions as any)?.data?.companions;
  const alreadyApplied = !!enrollmentNumber;
  const [ref, inView] = useInView();
  const { data, isLoading, error, fetchNextPage, refetch, isFetching, hasNextPage } = useInfiniteQuery({
    queryKey: ["plans", travelNumber],
    queryFn: ({ pageParam }) => {
      return getPlans(Number(travelNumber), pageParam) as any;
    },
    staleTime: 0,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.nextCursor) {
        return undefined;
      } else {
        return lastPage?.nextCursor;
      }
    },
  });
  const combinedPlans = data?.pages.reduce((acc, page) => acc.concat(page.plans), []);
  useInfiniteScroll(() => {
    if (inView) {
      !isFetching && hasNextPage && fetchNextPage();
    }
  }, [inView, !isFetching, hasNextPage]);

  //북마크
  const { postBookmarkMutation, deleteBookmarkMutation } = useUpdateBookmark(
    accessToken!,
    userId!,
    parseInt(travelNumber)
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
        console.log(err, "cancelMutation ERROR");
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
      <ResultToast height={120} isShow={editToastShow} setIsShow={setEditToastShow} text="게시글이 수정되었어요." />
      <NoticeModal
        isModalOpen={noticeModal}
        modalMsg={`여행에 참가가 확정된\n 멤버만 볼 수 있어요.`}
        modalTitle="참가 신청 대기중"
        setModalOpen={setNoticeModal}
      />
      <ResultToast height={80} isShow={isCancelToast} setIsShow={setIsCancelToast} text="여행 신청이 취소 되었어요." />
      <ResultToast height={80} isShow={isApplyToast} setIsShow={setIsApplyToast} text="여행 신청이 완료 되었어요." />

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

      <TripDetailWrapper ref={containerRef}>
        <TopModal
          isToastShow={false}
          containerRef={containerRef}
          setIsMapFull={setIsMapFull}
          onHeightChange={setTopModalHeight}
        >
          <ModalContainer>
            <MainContent>
              <ProfileContainer onClick={() => moveToUserProfilePage(userNumber)}>
                {/* 프로필 */}
                <RoundedImage src={profileUrl} size={40} />
                <div style={{ marginLeft: "8px" }}>
                  <UserName>{userName}</UserName>
                  <div
                    style={{
                      fontWeight: "400",
                      fontSize: "14px",
                      lineHeight: "16.71px",
                      color: palette.비강조,
                    }}
                  >
                    {daysAgo(createdAt)}
                  </div>
                </div>
              </ProfileContainer>
              {/* 제목  */}
              <Title>{title}</Title>
              {/* 내용 */}
              <Details ref={detailRef}>{details}</Details>
              {/*태그   */}
              <TagContainer>
                {tags.map((tag, idx) => (
                  <Badge
                    key={tag}
                    isDueDate={false}
                    text={tag}
                    height="22px"
                    backgroundColor={palette.비강조4}
                    color={palette.비강조}
                    fontWeight="500"
                  />
                ))}
              </TagContainer>
            </MainContent>
            <ViewsETC>
              <div>신청 {enrollCount}</div>
              <div style={{ margin: "0px 4px" }}> · </div>
              <div>관심 {bookmarkCount}</div>
              <div style={{ margin: "0px 4px" }}> · </div>
              <div>조회수 {viewCount}</div>
            </ViewsETC>

            <Bar />
            <CalendarContainer>
              <CalendarTextContainer>
                <TitleContainer>
                  <PlaceIcon width={21} height={24} />

                  <CalendarTitle>장소</CalendarTitle>
                </TitleContainer>
                <CalendarContent>
                  <RegionWrapper
                    locationName={locationName}
                    addInitGeometry={addInitGeometry}
                    addLocationName={addLocationName}
                    isDetail
                    location={location}
                  />
                </CalendarContent>
              </CalendarTextContainer>
            </CalendarContainer>
            <Bar />

            <CalendarContainer>
              <CalendarTextContainer>
                <TitleContainer>
                  <Calendar />
                  <CalendarTitle>여행 날짜</CalendarTitle>
                </TitleContainer>
                <CalendarContent>
                  {startDate && endDate ? formatDateRange(startDate, endDate) : "날짜를 선택하세요."}
                </CalendarContent>
              </CalendarTextContainer>
            </CalendarContainer>
            <Bar />

            <InfoContainer onClick={companionsViewHandler}>
              <InfoTextContainer>
                <TitleContainer>
                  {genderType === "모두" ? (
                    <EveryBodyIcon selected size={24} />
                  ) : genderType === "남자만" ? (
                    <OnlyMaleIcon selected size={24} />
                  ) : (
                    <OnlyFemaleIcon selected size={24} />
                  )}
                  <InfoTitle>{genderType}</InfoTitle>
                </TitleContainer>
                <InfoContent>
                  {nowPerson} / {maxPerson}
                </InfoContent>
              </InfoTextContainer>
              <ArrowIconContainer>
                <ArrowIcon />
              </ArrowIconContainer>
            </InfoContainer>
          </ModalContainer>
        </TopModal>
        <BottomContainer isMapFull={isMapFull} topModalHeight={topModalHeight}>
          <MapContainer
            plans={combinedPlans ?? []}
            locationName={locationName}
            index={openItemIndex + 1}
            isMapFull={isMapFull}
            lat={initGeometry?.lat || 37.57037778}
            lng={initGeometry?.lng || 126.9816417}
            zoom={9}
          />
          <ScheduleContainer>
            <ScheduleTitle>여행 일정</ScheduleTitle>
            {combinedPlans?.length > 0 ? (
              <>
                <Spacing size={16} />
                <ScheduleList>
                  {!isLoading && startDate && data && (
                    <EmblaCarousel
                      startDate={startDate}
                      setOpenItemIndex={setOpenItemIndex}
                      openItemIndex={openItemIndex}
                      inView={<div ref={ref} style={{ width: 5, height: "100%" }} />}
                      slides={combinedPlans} // 모든 데이터를 하나의 슬라이드 컴포넌트에 전달
                    />
                  )}
                </ScheduleList>
              </>
            ) : (
              <>
                <NoDataContainer>
                  <img alt="댓글이 없습니다" width={80} height={80} src={"/images/noData.png"} />
                  <Spacing size={16} />
                  <NoDataTitle>등록된 일정이 없어요</NoDataTitle>
                </NoDataContainer>
              </>
            )}
          </ScheduleContainer>
        </BottomContainer>
      </TripDetailWrapper>

      <Spacing size={120} />
      <ButtonContainer backgroundColor={palette.검색창}>
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
              ? palette.비강조3
              : !verifyGenderType(genderType, gender) || isAccepted
                ? palette.비강조3
                : hostUserCheck
                  ? nowEnrollmentCount > 0
                    ? palette.keycolor
                    : palette.비강조3
                  : palette.keycolor,
            color: isClosed
              ? palette.비강조4
              : !verifyGenderType(genderType, gender)
                ? palette.비강조
                : hostUserCheck
                  ? nowEnrollmentCount > 0
                    ? palette.비강조4
                    : palette.비강조
                  : palette.비강조4,
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
        ></ApplyListButton>
      </ButtonContainer>
      <CompanionsView isOpen={personViewClicked} setIsOpen={setPersonViewClicked} />

      <CommentWrapper>
        <IconContainer onClick={commentClickHandler}>
          {isCommentUpdated ? (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <circle cx="25" cy="4" r="4" fill="#FF2E2E" stroke="#1A1A1A" strokeWidth="2" />
              </g>
              <defs>
                <clipPath id="clip0_5570_2993">
                  <rect width="28" height="28" fill="white" />
                </clipPath>
              </defs>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </IconContainer>
      </CommentWrapper>
    </>
  );
}

const NoDataContainer = styled.div`
  display: flex;
  padding-top: 52px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const NoDataTitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.025em;
  text-align: center;
`;

const ModalContainer = styled.div`
  padding: 0 24px;
`;

const Bar = styled.div`
  background-color: #e7e7e7;
  width: 100%;
  height: 1px;
`;

const BottomContainer = styled.div<{
  topModalHeight: number;
  isMapFull: boolean;
}>`
  padding-top: ${(props) => `${props.isMapFull ? 32 : props.topModalHeight + 32}px`};
  min-height: 100svh;
  transition: padding-top 0.3s ease-out;
  overscroll-behavior: none;
`;

const ProfileContainer = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
`;
const Title = styled.div`
  margin-top: 32px;
  font-size: 20px;
  font-weight: 600;
  text-align: left;
`;
const Details = styled.div`
  margin-top: 16px;
  font-size: 16px;
  max-height: 100px;
  overflow-y: auto;
  white-space: pre-line;
  font-weight: 400;
  line-height: 22.4px;
  text-align: left;
  color: ${palette.기본};
`;

const TagContainer = styled.div`
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
const TripDetailWrapper = styled.div`
  padding: 0px 24px;
  overflow-y: auto;
  position: relative;
  height: calc(100svh - 116px);
  &::-webkit-scrollbar {
    display: none;
  }
  overscroll-behavior: none;
  padding-bottom: 104px;
`;
const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 19.09px;
  text-align: left;
  color: ${palette.기본};
  margin-bottom: 4px;
`;

const MainContent = styled.div``;

const ViewsETC = styled.div`
  margin: 8px 0;
  height: 38px;
  padding: 16px 0;
  display: flex;
  font-size: 12px;
  font-weight: 400;
  line-height: 14.32px;
  text-align: left;
  color: ${palette.비강조2};
`;

const ScheduleContainer = styled.div`
  margin-top: 24px;
`;
const ScheduleTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #000;
  line-height: 21px;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100px;
  gap: 8px;
  margin-right: 12px;
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentWrapper = styled.div`
  height: 100svh;
  width: 100%;
  pointer-events: none;
  position: fixed;
  top: 0;
  @media (min-width: 440px) {
    width: 390px;
    left: 50%;
    transform: translateX(-50%);
  }
  z-index: 1000;
`;

const IconContainer = styled.button<{ rotated: boolean; right: string }>`
  position: absolute;
  pointer-events: auto;
  right: 24px;
  bottom: 124px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background-color: ${palette.기본};
  z-index: 1000;
  font-size: 32px;
  @media (max-width: 390px) {
    right: ${(props) => props.right};
  }
`;

const CalendarContainer = styled.div`
  padding: 11px 0;
  padding-left: 8px;
  display: flex;
  align-items: center;
  height: 70px;
  justify-content: space-between;
`;

const CalendarTitle = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: ${palette.비강조};
  font-weight: 600;
`;

const CalendarTextContainer = styled.div`
  display: flex;
  align-items: center;
`;

const CalendarContent = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: ${palette.기본};
  font-weight: 500;
`;
const PlaceIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 42px;
`;

const InfoContainer = styled.div`
  padding: 11px 0;
  padding-left: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ArrowIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
`;

const InfoTitle = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: ${palette.비강조};
  font-weight: 600;
`;

const InfoTextContainer = styled.div`
  display: flex;
  align-items: center;
`;

const InfoContent = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: ${palette.기본};
  font-weight: 500;
`;
