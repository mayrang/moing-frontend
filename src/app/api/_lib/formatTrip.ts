import db, { Trip } from '@/mocks/db/store';

const GENDER_TYPE_KO: Record<string, string> = {
  ANY: '모두',
  MALE: '남자만',
  FEMALE: '여자만',
};

export const formatTrip = (trip: Trip, userNumber?: number) => {
  const host = db.users.get(trip.userNumber);
  const acceptedEnrollments = db
    .getEnrollmentsByTravel(trip.travelNumber)
    .filter((e) => e.status === 'ACCEPTED');
  const enrollCount = db.getEnrollmentsByTravel(trip.travelNumber).length;

  let loginMemberRelatedInfo: { hostUser: boolean; enrollmentNumber: number | null; bookmarked: boolean } | null = null;
  if (userNumber) {
    const isHost = trip.userNumber === userNumber;
    const enrollment = [...db.enrollments.values()].find(
      (e) => e.travelNumber === trip.travelNumber && e.userNumber === userNumber,
    );
    loginMemberRelatedInfo = {
      hostUser: isHost,
      enrollmentNumber: enrollment?.enrollmentNumber ?? null,
      bookmarked: db.bookmarks.has(db.getBookmarkKey(userNumber, trip.travelNumber)),
    };
  }

  return {
    travelNumber: trip.travelNumber,
    userNumber: trip.userNumber,
    userName: host?.name || '',
    userAgeGroup: host?.ageGroup || '',
    profileUrl: host?.profileImageUrl || null,
    title: trip.title,
    details: trip.details,
    location: trip.locationName,
    startDate: trip.startDate,
    endDate: trip.endDate,
    registerDue: trip.endDate,
    maxPerson: trip.maxPerson,
    nowPerson: acceptedEnrollments.length + 1,
    genderType: GENDER_TYPE_KO[trip.genderType] ?? trip.genderType,
    periodType: trip.periodType,
    postStatus: trip.status,
    tags: trip.tags,
    viewCount: trip.viewCount,
    enrollCount,
    bookmarkCount: [...db.bookmarks.values()].filter((b) => b.travelNumber === trip.travelNumber)
      .length,
    createdAt: trip.createdAt,
    bookmarked: loginMemberRelatedInfo?.bookmarked ?? false,
    loginMemberRelatedInfo,
  };
};
