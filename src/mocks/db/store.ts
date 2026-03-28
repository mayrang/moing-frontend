/**
 * In-memory store for stateful mock server
 * 서버 재시작 시 초기화됨 (프로토타입용)
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type Gender = 'F' | 'M' | '';
export type AgeGroup = '10대' | '20대' | '30대' | '40대' | '50대 이상';
export type TravelStatus = 'IN_PROGRESS' | 'CLOSED' | 'DELETED';
export type UserStatus = 'ABLE' | 'PENDING' | 'BLOCK';

export interface User {
  userNumber: number;
  email: string;
  password: string; // hashed (평문 비교용으로 그냥 저장)
  name: string;
  ageGroup: AgeGroup;
  gender: Gender;
  preferredTags: string[];
  introduction: string;
  profileImageUrl: string | null;
  status: UserStatus;
  socialLogin: null | 'google' | 'kakao' | 'naver';
  socialLoginId: string | null;
  createdAt: string;
}

export interface Session {
  userNumber: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Date.now() + 15분
}

export interface EmailVerification {
  email: string;
  sessionToken: string;
  verifyCode: string;
  expiresAt: number;
}

export interface Trip {
  travelNumber: number;
  userNumber: number;
  title: string;
  details: string;
  locationName: string;
  startDate: string;
  endDate: string;
  maxPerson: number;
  genderType: 'ANY' | 'MALE' | 'FEMALE';
  periodType: 'SHORT' | 'LONG';
  status: TravelStatus;
  tags: string[];
  viewCount: number;
  createdAt: string;
}

export interface Enrollment {
  enrollmentNumber: number;
  travelNumber: number;
  userNumber: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Bookmark {
  userNumber: number;
  travelNumber: number;
  createdAt: string;
}

export interface CommunityPost {
  communityNumber: number;
  userNumber: number;
  title: string;
  content: string;
  categoryNumber: number;
  categoryName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  images: string[];
}

export interface Comment {
  commentNumber: number;
  relatedType: 'TRAVEL' | 'COMMUNITY';
  relatedNumber: number;
  userNumber: number;
  content: string;
  parentNumber: number | null;
  likeCount: number;
  createdAt: string;
}

export interface Notification {
  notificationNumber: number;
  userNumber: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ── Store ──────────────────────────────────────────────────────────────────

let _userCounter = 10;
let _tripCounter = 100;
let _enrollmentCounter = 1000;
let _communityCounter = 200;
let _commentCounter = 500;
let _notificationCounter = 300;

const nextId = (counter: { v: number }) => ++counter.v;
const counters = {
  user: { v: _userCounter },
  trip: { v: _tripCounter },
  enrollment: { v: _enrollmentCounter },
  community: { v: _communityCounter },
  comment: { v: _commentCounter },
  notification: { v: _notificationCounter },
};

export const db = {
  users: new Map<number, User>(),
  sessions: new Map<string, Session>(),         // accessToken → Session
  refreshTokens: new Map<string, number>(),     // refreshToken → userNumber
  emailVerifications: new Map<string, EmailVerification>(), // sessionToken → EmailVerification
  trips: new Map<number, Trip>(),
  enrollments: new Map<number, Enrollment>(),
  bookmarks: new Map<string, Bookmark>(),       // `${userNumber}-${travelNumber}`
  communityPosts: new Map<number, CommunityPost>(),
  communityLikes: new Set<string>(),            // `${userNumber}-${communityNumber}`
  comments: new Map<number, Comment>(),
  commentLikes: new Set<string>(),              // `${userNumber}-${commentNumber}`
  notifications: new Map<number, Notification>(),
  blockedEmails: new Set<string>(),             // 탈퇴 후 3개월 제한 이메일

  // ── Helpers ──

  nextUserId: () => ++counters.user.v,
  nextTripId: () => ++counters.trip.v,
  nextEnrollmentId: () => ++counters.enrollment.v,
  nextCommunityId: () => ++counters.community.v,
  nextCommentId: () => ++counters.comment.v,
  nextNotificationId: () => ++counters.notification.v,

  getUserByEmail: (email: string) =>
    [...db.users.values()].find((u) => u.email === email),

  getUserByToken: (accessToken: string): User | undefined => {
    const session = db.sessions.get(accessToken);
    if (!session) return undefined;
    if (Date.now() > session.expiresAt) {
      db.sessions.delete(accessToken);
      return undefined;
    }
    return db.users.get(session.userNumber);
  },

  createSession: (userNumber: number) => {
    const accessToken = `access-${userNumber}-${Date.now()}`;
    const refreshToken = `refresh-${userNumber}-${Date.now()}`;
    const session: Session = {
      userNumber,
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15분
    };
    db.sessions.set(accessToken, session);
    db.refreshTokens.set(refreshToken, userNumber);
    return { accessToken, refreshToken };
  },

  getBookmarkKey: (userNumber: number, travelNumber: number) =>
    `${userNumber}-${travelNumber}`,

  getTripsByUser: (userNumber: number) =>
    [...db.trips.values()].filter((t) => t.userNumber === userNumber && t.status !== 'DELETED'),

  getEnrollmentsByTravel: (travelNumber: number) =>
    [...db.enrollments.values()].filter((e) => e.travelNumber === travelNumber),

  getCommentsByRelated: (relatedType: string, relatedNumber: number) =>
    [...db.comments.values()].filter(
      (c) => c.relatedType === relatedType && c.relatedNumber === relatedNumber
    ),

  now: () => new Date().toISOString(),
};

// ── Seed Data ──────────────────────────────────────────────────────────────

function seedDatabase() {
  // 기본 유저 (테스트용)
  const testUser: User = {
    userNumber: 1,
    email: 'test@test.com',

    password: 'Password123!',
    name: '테스트유저',
    ageGroup: '20대',
    gender: 'M',
    preferredTags: ['국내', '단기', '액티비티'],
    introduction: '안녕하세요!',
    profileImageUrl: null,
    status: 'ABLE',
    socialLogin: null,
    socialLoginId: null,
    createdAt: new Date().toISOString(),
  };
  db.users.set(1, testUser);

  // 중복 이메일 테스트용 유저
  const duplicateUser: User = {
    userNumber: 2,
    email: 'duplicate@test.com',
    password: 'Password123!',
    name: '중복유저',
    ageGroup: '30대',
    gender: 'F',
    preferredTags: [],
    introduction: '',
    profileImageUrl: null,
    status: 'ABLE',
    socialLogin: null,
    socialLoginId: null,
    createdAt: new Date().toISOString(),
  };
  db.users.set(2, duplicateUser);

  // 샘플 여행
  const sampleTrip: Trip = {
    travelNumber: 1,
    userNumber: 1,
    title: '제주도 3박4일 같이 가요!',
    details: '제주도 여행 동행 구합니다. 20대 위주로 모집합니다.',
    locationName: '제주도',
    startDate: '2026-04-01',
    endDate: '2026-04-04',
    maxPerson: 4,
    genderType: 'ANY',
    periodType: 'SHORT',
    status: 'IN_PROGRESS',
    tags: ['국내', '단기', '여유'],
    viewCount: 12,
    createdAt: new Date().toISOString(),
  };
  db.trips.set(1, sampleTrip);

  // 샘플 커뮤니티 게시글
  const samplePost: CommunityPost = {
    communityNumber: 1,
    userNumber: 1,
    title: '제주도 맛집 추천해주세요',
    content: '4월에 제주도 여행 가는데 맛집 추천 부탁드립니다!',
    categoryNumber: 1,
    categoryName: '여행 정보',
    viewCount: 5,
    likeCount: 2,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    images: [],
  };
  db.communityPosts.set(1, samplePost);
}

seedDatabase();

export default db;
