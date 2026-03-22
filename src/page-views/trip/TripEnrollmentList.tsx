"use client";
import useEnrollment from "@/hooks/enrollment/useEnrollment";
import React, { useEffect, useState } from "react";
import TripEnrollmentCard from "./TripEnrollmentCard";
import { tripDetailStore } from "@/store/client/tripDetailStore";
import { todayFormattedDate, isNewApply } from "@/utils/time";
import { useParams } from "next/navigation";
import { getEnrollments } from "@/api/enrollment";
import { useQuery } from "@tanstack/react-query";
import { authStore } from "@/store/client/authStore";
import useTripDetail from "@/hooks/tripDetail/useTripDetail";

interface enrollment {
  enrollmentNumber: number;
  userName: string;
  userAgeGroup: string;
  enrolledAt: string;
  message: string;
  status: string;
  profileUrl: string;
}
export default function TripEnrollmentList() {
  const params = useParams();
  const travelNumber = params?.travelNumber as string;
  const { accessToken } = authStore();
  const { tripDetail } = useTripDetail(parseInt(travelNumber!));
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
    addPeriodType,
    addTags,
    addPostStatus,
    addNowPerson,
    addEnrollCount,
    addBookmarkCount,
    addHostUserCheck,
    addViewCount,
    addTravelNumber,
    addEnrollmentNumber,
    createdAt,
    addUserAgeGroup,
    addBookmarked,
    bookmarked,
  } = tripDetailStore();

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
        profileUrl,
        loginMemberRelatedInfo,
      } = tripInfos;

      if (!loginMemberRelatedInfo) {
        addHostUserCheck(false);
        addEnrollmentNumber(null);
        addBookmarked(false);
      } else {
        addHostUserCheck(loginMemberRelatedInfo.hostUser);
        addEnrollmentNumber(loginMemberRelatedInfo.enrollmentNumber);
        addBookmarked(loginMemberRelatedInfo.bookmarked);
      }
      addProfileUrl(profileUrl);
      addTravelNumber(travelNumber);

      addEnrollCount(enrollCount);
      addCreatedAt(createdAt);
      addUserNumber(userNumber);
      addUserName(userName);
      addLocation(location);
      addTitle(title);
      addDetails(details);
      addMaxPerson(maxPerson);
      addGenderType(genderType);
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
  const { enrollmentsLastViewed, updateLastViewed, enrollmentList } = useEnrollment(parseInt(travelNumber!));

  // 최근에 본 시점.
  const list = enrollmentList.data;

  // 처음에는 null 값이니, 생성했을 때 시간 으로 두기.
  const lastViewed =
    enrollmentsLastViewed?.data?.lastViewedAt === null ? createdAt : enrollmentsLastViewed.data?.lastViewedAt;

  useEffect(() => {
    // 컴포넌트가 언마운트될 때 최근 열람 시간 put API 요청 보내기.
    return () => {
      updateLastViewed(todayFormattedDate());
    };
  }, []);

  return (
    <div className="px-6">
      {list && lastViewed && (
        <>
          <div className="flex text-base font-semibold leading-4 text-left">
            총<p style={{ marginLeft: "4px", color: "var(--color-keycolor)" }}>{!list.totalCount ? 0 : list.totalCount}</p>건
          </div>
          <div style={{ marginTop: "16px" }}>
            {list.enrollments?.map((enrollment: enrollment) => (
              <TripEnrollmentCard
                key={enrollment.enrollmentNumber}
                isNew={isNewApply(lastViewed, enrollment.enrolledAt)}
                enrollmentNumber={enrollment.enrollmentNumber}
                userName={enrollment.userName}
                ageGroup={enrollment.userAgeGroup}
                enrolledAt={enrollment.enrolledAt}
                message={enrollment.message}
                profileUrl={enrollment.profileUrl}
              />
            ))}
          </div>
        </>
      )}
      <div></div>
    </div>
  );
}
