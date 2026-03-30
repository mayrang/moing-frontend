"use client";
import CheckingModal from "@/components/designSystem/modal/CheckingModal";
import EditAndDeleteModal from "@/components/designSystem/modal/EditAndDeleteModal";
import NoticeModal from "@/components/designSystem/modal/NoticeModal";
import ReportModal from "@/components/designSystem/modal/ReportModal";
import ResultToast from "@/components/designSystem/toastMessage/resultToast";
import AlarmIcon from "@/components/icons/AlarmIcon";
import MoreIcon from "@/components/icons/MoreIcon";
import ShareIcon from "@/components/icons/ShareIcon";
import { useUpdateBookmark } from "@/hooks/bookmark/useUpdateBookmark";
import useTripDetail from "@/hooks/tripDetail/useTripDetail";
import useViewTransition from "@/hooks/useViewTransition";
import { authStore } from "@/store/client/authStore";
import { useBackPathStore } from "@/store/client/backPathStore";
import { reportStore } from "@/store/client/reportStore";
import { tripDetailStore } from "@/store/client/tripDetailStore";
import { isGuestUser } from "@/utils/user";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// 헤더부터 주최자인지에 따라 화면이 달라서, 헤더에서 여행 정보를 들고 오기.
export default function TripDetailHeader() {
  const { userId, accessToken, isGuestUser: isGuestUserStore } = authStore();
  const params = useParams();
  const pathname = usePathname();
  const travelNumber = params?.travelNumber as string;
  const { tripDetail } = useTripDetail(parseInt(travelNumber!));
  const isTripDetailEdit = pathname?.startsWith("/trip/edit");

  const router = useRouter();
  const [isEditBtnClicked, setIsEditBtnClicked] = useState(false);
  const [isReportBtnClicked, setIsReportBtnClicked] = useState(false);
  const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [checkingModalClicked, setCheckingModalClicked] = useState(false);
  const [threeDotsClick, setThreeDotsClick] = useState(false);
  const [reportThreeDotsClick, setReportThreeDotsClick] = useState(false);
  const {
    addProfileUrl,
    addLocation,
    addUserName,
    addUserNumber,
    addCreatedAt,
    addTitle,
    addDetails,
    addMaxPerson,
    addGenderType,
    addDueDate,
    addPeriodType,
    addTags,
    addPostStatus,
    addNowPerson,
    addEnrollCount,
    addBookmarkCount,
    addHostUserCheck,
    addViewCount,
    addStartDate,
    addEndDate,
    addTravelNumber,
    addEnrollmentNumber,
    hostUserCheck,
    userNumber,
    addUserAgeGroup,
    addBookmarked,
    bookmarked,
  } = tripDetailStore();
  const { setNotification } = useBackPathStore();
  const tripInfos = tripDetail.data as any;
  useEffect(() => {
    if (tripDetail.isFetched) {
      const {
        travelNumber,
        userNumber,
        userName,
        createdAt,
        location,
        title,
        details,
        maxPerson,
        genderType,

        periodType,
        tags,
        postStatus,
        nowPerson,
        bookmarkCount,
        viewCount,
        enrollCount,
        userAgeGroup,
        startDate,
        endDate,
        profileUrl,
        loginMemberRelatedInfo,
      } = tripInfos;
      // const [year, month, day] = dueDate.split("-").map((v: string) => +v);
      // const DUEDATE = {
      //   year,
      //   month,
      //   day,
      // };
      // 서버 프리페치는 null 토큰으로 실행 → loginMemberRelatedInfo: null
      // AppShell이 토큰을 복구하기 전에 이 값으로 hostUserCheck를 덮어쓰면
      // 호스트도 "참가 신청 하기" 버튼이 표시되는 문제 발생.
      // accessToken이 확정되거나 명시적 게스트일 때만 인증 관련 필드를 업데이트.
      const isAuthResolved = !!accessToken || isGuestUserStore;
      if (isAuthResolved) {
        if (!loginMemberRelatedInfo) {
          addHostUserCheck(false);
          addEnrollmentNumber(null);
          addBookmarked(false);
        } else {
          addHostUserCheck(loginMemberRelatedInfo.hostUser);
          addEnrollmentNumber(loginMemberRelatedInfo.enrollmentNumber);
          addBookmarked(loginMemberRelatedInfo.bookmarked);
        }
      }
      addProfileUrl(profileUrl);
      addTravelNumber(travelNumber);
      addStartDate(startDate);
      addEndDate(endDate);
      addEnrollCount(enrollCount);
      addCreatedAt(createdAt);
      addUserNumber(userNumber);
      addUserName(userName);
      addLocation(location);
      addTitle(title);
      addDetails(details);
      addMaxPerson(maxPerson);
      addGenderType(genderType);
      // addDueDate(DUEDATE);
      addPeriodType(periodType);
      addTags(tags);
      addPostStatus(postStatus);
      addBookmarkCount(bookmarkCount);
      addViewCount(viewCount);

      addNowPerson(nowPerson);
      addUserAgeGroup(userAgeGroup);
      addPostStatus(postStatus);
    }
  }, [tripDetail.isFetched, tripInfos]);
  const navigateWithTransition = useViewTransition();
  const { deleteTripDetailMutation } = useTripDetail(parseInt(travelNumber!));
  const [isToastShow, setIsToastShow] = useState(false); // 삭제 완료 메시지.
  const { reportSuccess, setReportSuccess, setUserNumber } = reportStore();

  const { postBookmarkMutation, deleteBookmarkMutation } = useUpdateBookmark(
    accessToken!,
    userId!,
    parseInt(travelNumber!)
  );

  const handleNotification = () => {
    setNotification(travelNumber ? `/trip/detail/${travelNumber}` : "/trip/list");
    router.push(`/notification`);
  };
  useEffect(() => {
    if (isDeleteBtnClicked) {
      setIsResultModalOpen(true);
      setIsDeleteBtnClicked(false);
    }
    if (isEditBtnClicked) {
      setThreeDotsClick(false);
      setIsEditBtnClicked(false);
      document.documentElement.style.viewTransitionName = "forward";
      navigateWithTransition(`/trip/edit/${travelNumber}`);
    }
    if (isReportBtnClicked) {
      setIsReportBtnClicked(false);
      setUserNumber(userNumber);
      document.documentElement.style.viewTransitionName = "forward";
      navigateWithTransition(`/report/travel/${travelNumber}`);
    }
    if (checkingModalClicked) {
      // 삭제 요청.

      deleteTripDetailMutation().then((res) => {
        setIsToastShow(true);
        setTimeout(() => {
          router.push("/");
        }, 1800);
      });
    }
  }, [isDeleteBtnClicked, isReportBtnClicked, isEditBtnClicked, checkingModalClicked]);

  // 북마크
  const bookmarkClickHandler = () => {
    if (bookmarked) {
      deleteBookmarkMutation();
    } else {
      // 북마크 추가.
      postBookmarkMutation();
    }
  };

  const onClickThreeDots = () => {
    if (hostUserCheck) {
      setThreeDotsClick(true);
    } else {
      setReportThreeDotsClick(true);
    }
  };

  return (
    <div
      className="flex items-center justify-around"
      style={{
        display: isTripDetailEdit ? "none" : "flex",
        width: "auto",
      }}
    >
      {!isGuestUser() && (
        <button
          type="button"
          aria-label="알림"
          className="w-12 h-12 flex items-center justify-center"
          onClick={handleNotification}
        >
          <AlarmIcon size={23} stroke="var(--color-text-base)" />
        </button>
      )}
      <ShareIcon className="w-12 h-12 flex items-center justify-center" />

      {!isGuestUser() && (
        <button
          type="button"
          aria-label={hostUserCheck ? "여행 수정/삭제" : "더 보기"}
          className="w-12 h-12 flex items-center justify-center"
          onClick={onClickThreeDots}
        >
          <MoreIcon />
        </button>
      )}

      <EditAndDeleteModal
        setIsEditBtnClicked={setIsEditBtnClicked}
        setIsDeleteBtnClicked={setIsDeleteBtnClicked}
        isOpen={threeDotsClick}
        setIsOpen={setThreeDotsClick}
      />
      <ReportModal
        setIsReportBtnClicked={setIsReportBtnClicked}
        isOpen={reportThreeDotsClick}
        setIsOpen={setReportThreeDotsClick}
      />
      <NoticeModal
        isModalOpen={reportSuccess}
        modalMsg={"소중한 의견 감사합니다."}
        modalTitle={"신고 완료"}
        setModalOpen={setReportSuccess}
      />
      <CheckingModal
        isModalOpen={isResultModalOpen}
        modalMsg={`여행 멤버나 관심을 가진 분들이 \n 당황할 수 있어요.`}
        modalTitle="정말 삭제할까요?"
        modalButtonText="삭제하기"
        setIsSelected={setCheckingModalClicked}
        setModalOpen={setIsResultModalOpen}
      />
      <ResultToast bottom="80px" isShow={isToastShow} setIsShow={setIsToastShow} text="여행 게시글이 삭제되었어요." />
    </div>
  );
}

