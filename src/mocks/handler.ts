/**
 * E2E 테스트용 MSW HTTP mock 서버 핸들러
 *
 * - Vitest 단위 테스트 핸들러(src/test/msw/handlers/)를 그대로 재사용
 * - `yarn mock` 으로 로컬 9090 포트에서 실행
 * - playwright.config.ts의 webServer에서 API_BASE_URL=http://localhost:9090 으로 연결
 */
import {
  authHandlers,
  searchHandlers,
  tripHandlers,
  tripDetailHandlers,
  enrollmentHandlers,
  bookmarkHandlers,
  myTripHandlers,
  commentHandlers,
  communityHandlers,
  notificationHandlers,
  myPageHandlers,
  userProfileHandlers,
} from '@/test/msw/handlers';

export const handlers = [
  ...authHandlers,
  ...searchHandlers,
  ...tripHandlers,
  ...tripDetailHandlers,
  ...enrollmentHandlers,
  ...bookmarkHandlers,
  ...myTripHandlers,
  ...commentHandlers,
  ...communityHandlers,
  ...notificationHandlers,
  ...myPageHandlers,
  ...userProfileHandlers,
];
