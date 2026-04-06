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
  travelDistance: number;
  travelBadgeCount: number;
  visitedCountryCount: number;
  userSocialTF: boolean;
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
  likedBy: number[];   // 좋아요 누른 userNumber 목록
  commentCount: number;
  deleted: boolean;    // 소프트 딜리트
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
    if (session) {
      if (Date.now() > session.expiresAt) {
        db.sessions.delete(accessToken);
        // 만료됐어도 데모 모드에서는 아래 토큰 파싱으로 fallback
      } else {
        return db.users.get(session.userNumber);
      }
    }

    // 데모 모드: 콜드스타트로 세션이 날아간 경우 토큰에서 userNumber 복원
    // 토큰 형식: access-{userNumber}-{timestamp}
    const match = accessToken.match(/^access-(\d+)-\d+$/);
    if (match) {
      const userNumber = parseInt(match[1]);
      let user = db.users.get(userNumber);

      // 콜드스타트로 유저가 날아간 경우 데모 유저 복원
      if (!user) {
        user = {
          userNumber,
          email: `user${userNumber}@demo.com`,
          password: '',
          name: `데모유저${userNumber}`,
          ageGroup: '20대',
          gender: '',
          preferredTags: [],
          introduction: '',
          profileImageUrl: null,
          status: 'ABLE',
          socialLogin: null,
          socialLoginId: null,
          createdAt: db.now(),
          travelDistance: 0,
          travelBadgeCount: 0,
          visitedCountryCount: 0,
          userSocialTF: false,
        };
        db.users.set(userNumber, user);
      }

      // 세션 재생성
      const newSession: Session = {
        userNumber,
        accessToken,
        refreshToken: `refresh-${userNumber}-${Date.now()}`,
        expiresAt: Date.now() + 60 * 60 * 1000, // 1시간
      };
      db.sessions.set(accessToken, newSession);
      return user;
    }

    return undefined;
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

  /** E2E 테스트 격리용 — 모든 동적 데이터 삭제 후 시드 데이터 재등록 */
  reset: () => {
    db.users.clear();
    db.sessions.clear();
    db.refreshTokens.clear();
    db.emailVerifications.clear();
    db.trips.clear();
    db.enrollments.clear();
    db.bookmarks.clear();
    db.communityPosts.clear();
    db.communityLikes.clear();
    db.comments.clear();
    db.commentLikes.clear();
    db.notifications.clear();
    db.blockedEmails.clear();
    counters.user.v = 10;
    counters.trip.v = 100;
    counters.enrollment.v = 1000;
    counters.community.v = 200;
    counters.comment.v = 500;
    counters.notification.v = 300;
    seedDatabase();
  },
};

// ── Seed Data ──────────────────────────────────────────────────────────────

function seedDatabase() {
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();

  // ── 유저 ──────────────────────────────────────────────────────────────────

  const users: User[] = [
    {
      userNumber: 1, email: 'test@test.com', password: 'Password123!',
      name: '김여행', ageGroup: '20대', gender: 'M',
      preferredTags: ['국내', '단기', '액티비티'],
      introduction: '여행을 사랑하는 20대입니다. 같이 떠나요!',
      profileImageUrl: 'https://placehold.co/100x100/8B9CF7/ffffff?text=김',
      status: 'ABLE', socialLogin: null, socialLoginId: null, createdAt: daysAgo(30),
      travelDistance: 1240, travelBadgeCount: 3, visitedCountryCount: 5, userSocialTF: false,
    },
    {
      userNumber: 2, email: 'duplicate@test.com', password: 'Password123!',
      name: '이탐험', ageGroup: '30대', gender: 'F',
      preferredTags: ['해외', '장기', '문화'],
      introduction: '세계 여행이 꿈입니다.',
      profileImageUrl: 'https://placehold.co/100x100/F7A28B/ffffff?text=이',
      status: 'ABLE', socialLogin: null, socialLoginId: null, createdAt: daysAgo(20),
      travelDistance: 8500, travelBadgeCount: 7, visitedCountryCount: 12, userSocialTF: false,
    },
    {
      userNumber: 3, email: 'alice@test.com', password: 'Password123!',
      name: '박모험', ageGroup: '20대', gender: 'F',
      preferredTags: ['국내', '자연', '힐링'],
      introduction: '자연 속에서 힐링하는 걸 좋아해요.',
      profileImageUrl: 'https://placehold.co/100x100/8BF7C0/ffffff?text=박',
      status: 'ABLE', socialLogin: null, socialLoginId: null, createdAt: daysAgo(15),
      travelDistance: 320, travelBadgeCount: 1, visitedCountryCount: 2, userSocialTF: false,
    },
  ];
  users.forEach((u) => db.users.set(u.userNumber, u));

  // ── 여행 ──────────────────────────────────────────────────────────────────

  const trips: Trip[] = [
    {
      travelNumber: 1, userNumber: 1,
      title: '제주도 3박4일 같이 가요!',
      details: '제주도 여행 동행 구합니다. 한라산 등반 + 해변 투어 계획입니다. 20대 위주로 모집해요.',
      locationName: '제주도', startDate: '2026-05-01', endDate: '2026-05-04',
      maxPerson: 4, genderType: 'ANY', periodType: 'SHORT', status: 'IN_PROGRESS',
      tags: ['국내', '단기', '액티비티', '자연'], viewCount: 42, createdAt: daysAgo(3),
    },
    {
      travelNumber: 2, userNumber: 2,
      title: '도쿄 일주일 여행 파티원 구해요',
      details: '도쿄 7박8일 일정입니다. 아키하바라, 시부야, 신주쿠 위주로 돌 예정입니다.',
      locationName: '도쿄', startDate: '2026-05-10', endDate: '2026-05-17',
      maxPerson: 3, genderType: 'ANY', periodType: 'LONG', status: 'IN_PROGRESS',
      tags: ['해외', '일본', '도시', '쇼핑'], viewCount: 87, createdAt: daysAgo(5),
    },
    {
      travelNumber: 3, userNumber: 3,
      title: '부산 1박2일 당일치기 하실 분',
      details: '주말 부산 단기 여행입니다. 해운대, 광안리, 국제시장 코스로 갑니다.',
      locationName: '부산', startDate: '2026-04-26', endDate: '2026-04-27',
      maxPerson: 4, genderType: 'FEMALE', periodType: 'SHORT', status: 'IN_PROGRESS',
      tags: ['국내', '단기', '맛집', '바다'], viewCount: 31, createdAt: daysAgo(2),
    },
    {
      travelNumber: 4, userNumber: 1,
      title: '유럽 배낭여행 2주 같이해요',
      details: '프랑스, 이탈리아, 스페인 2주 배낭여행. 유럽 여행 경험자 우대합니다.',
      locationName: '유럽', startDate: '2026-06-01', endDate: '2026-06-15',
      maxPerson: 2, genderType: 'ANY', periodType: 'LONG', status: 'IN_PROGRESS',
      tags: ['해외', '유럽', '배낭', '장기'], viewCount: 56, createdAt: daysAgo(7),
    },
    {
      travelNumber: 5, userNumber: 2,
      title: '강릉 바다 힐링 여행',
      details: '강릉 카페거리, 정동진 일출, 경포대 해변을 즐기는 힐링 여행입니다.',
      locationName: '강릉', startDate: '2026-04-28', endDate: '2026-04-30',
      maxPerson: 3, genderType: 'ANY', periodType: 'SHORT', status: 'IN_PROGRESS',
      tags: ['국내', '바다', '힐링', '카페'], viewCount: 24, createdAt: daysAgo(1),
    },
  ];
  trips.forEach((t) => db.trips.set(t.travelNumber, t));

  // ── 커뮤니티 ──────────────────────────────────────────────────────────────

  const posts: CommunityPost[] = [
    {
      communityNumber: 1, userNumber: 1,
      title: '제주도 맛집 추천해주세요',
      content: '5월에 제주도 여행 가는데 꼭 가봐야 할 맛집 추천 부탁드립니다! 흑돼지 외에도 다양하게 알려주세요.',
      categoryNumber: 1, categoryName: '여행 정보',
      viewCount: 28, likeCount: 5, likedBy: [2, 3], commentCount: 2,
      deleted: false, createdAt: daysAgo(2), images: [],
    },
    {
      communityNumber: 2, userNumber: 2,
      title: '도쿄 교통패스 스이카 vs 파스모 뭐가 나을까요?',
      content: '첫 도쿄 여행인데 교통카드 어떤 걸 써야 할지 모르겠어요. 사용해보신 분들 조언 부탁드려요!',
      categoryNumber: 1, categoryName: '여행 정보',
      viewCount: 45, likeCount: 8, likedBy: [1, 3], commentCount: 3,
      deleted: false, createdAt: daysAgo(4), images: [],
    },
    {
      communityNumber: 3, userNumber: 3,
      title: '혼자 여행 vs 동행 여행 어떤게 더 좋으세요?',
      content: '여행 스타일에 대해 이야기 나눠봐요. 저는 혼자 여행도 좋지만 같이 가면 더 즐거운 것 같아요.',
      categoryNumber: 2, categoryName: '자유게시판',
      viewCount: 62, likeCount: 12, likedBy: [1, 2], commentCount: 5,
      deleted: false, createdAt: daysAgo(6), images: [],
    },
  ];
  posts.forEach((p) => db.communityPosts.set(p.communityNumber, p));

  // ── 댓글 ──────────────────────────────────────────────────────────────────

  const comments: Comment[] = [
    {
      commentNumber: 1, relatedType: 'COMMUNITY', relatedNumber: 1,
      userNumber: 2, content: '흑돼지거리 꼭 가보세요! 이호테우해변 근처 고기집도 맛있어요.',
      parentNumber: null, likeCount: 2, createdAt: daysAgo(1),
    },
    {
      commentNumber: 2, relatedType: 'COMMUNITY', relatedNumber: 1,
      userNumber: 3, content: '성산일출봉 근처 해녀촌 전복죽도 꼭 드셔보세요!',
      parentNumber: null, likeCount: 1, createdAt: daysAgo(1),
    },
    {
      commentNumber: 3, relatedType: 'COMMUNITY', relatedNumber: 2,
      userNumber: 1, content: '스이카 추천합니다! JR 포함해서 어디든 쓸 수 있어요.',
      parentNumber: null, likeCount: 3, createdAt: daysAgo(3),
    },
  ];
  comments.forEach((c) => db.comments.set(c.commentNumber, c));
}

// ── Dev 싱글톤 (Next.js Route Handler 모듈 격리 우회) ──────────────────────
// Next.js dev 모드에서 동적 Route Handler([param])는 별도 모듈 컨텍스트로
// 컴파일되어, 같은 파일을 import해도 Map 인스턴스가 분리된다.
// globalThis를 통해 프로세스 전체에서 단일 db 인스턴스를 공유한다.
declare global {
  // eslint-disable-next-line no-var
  var __moingDb: typeof db | undefined;
}

if (!globalThis.__moingDb) {
  globalThis.__moingDb = db;
  seedDatabase();
}

// if 블록에서 반드시 초기화되므로 undefined가 될 수 없음
export default globalThis.__moingDb!;
