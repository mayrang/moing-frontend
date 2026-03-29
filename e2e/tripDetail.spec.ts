/**
 * tripDetail E2E 테스트
 *
 * API mock: MSW HTTP 서버 (localhost:9090)
 *
 * 커버 범위:
 * - 상세 조회 (비로그인): 제목 표시, 참가 신청 하기 버튼
 * - 상세 조회 (호스트): 로그인 후 client-side 이동 → React Query refetch → hostUser=true 확인
 * - 접근성 axe 자동 검사 (/trip/detail/1)
 *
 * 호스트 테스트 설계 배경:
 *   - trip/detail/[id] page.tsx 는 서버사이드 HydrationBoundary 프리페치를 사용한다.
 *   - 서버사이드는 accessToken=null 로 호출 → loginMemberRelatedInfo: null → hostUserCheck: false.
 *   - useTripDetail 쿼리의 enabled 조건: isGuestUser || !!accessToken.
 *   - 비로그인 상태에서는 enabled=false → 클라이언트 refetch 없음.
 *   - 따라서 호스트 버튼은 "로그인 → 홈에서 trip 카드 클릭(client-side 이동)" 방식으로만 표시된다.
 *
 * 실행: yarn test:e2e --project=chromium e2e/tripDetail.spec.ts
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SEED_TRIP_NUMBER = 1;
const SEED_TRIP_TITLE = '제주도 3박4일 같이 가요!';
const DETAIL_URL = `/trip/detail/${SEED_TRIP_NUMBER}`;

const mockTripPage = {
  content: [
    {
      travelNumber: 1,
      userNumber: 1,
      userName: '테스트유저',
      title: '제주도 3박4일 같이 가요!',
      location: '제주도',
      startDate: '2026-04-01',
      endDate: '2026-04-04',
      registerDue: '2026-04-04',
      maxPerson: 4,
      nowPerson: 1,
      tags: ['국내', '단기', '여유'],
      createdAt: new Date().toISOString(),
      bookmarked: false,
      loginMemberRelatedInfo: { hostUser: true, enrollmentNumber: null, bookmarked: false },
    },
  ],
  page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
};

/** 홈 페이지 API 요청을 mock하여 크래시 방지 */
async function mockHomePageRoutes(
  page: Parameters<Parameters<typeof test>[1]>[0]['page'],
) {
  await page.route('**/api/travels/recent**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resultType: 'SUCCESS', success: mockTripPage, error: null }),
    }),
  );
  await page.route('**/api/travels/recommend**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resultType: 'SUCCESS', success: mockTripPage, error: null }),
    }),
  );
  await page.route('**/api/bookmarks**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        resultType: 'SUCCESS',
        success: { content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } },
        error: null,
      }),
    }),
  );
  await page.route('**/api/notifications**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        resultType: 'SUCCESS',
        success: { content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } },
        error: null,
      }),
    }),
  );
}

/** User1(호스트) 로그인 후 홈에서 client-side로 trip detail로 이동 */
async function loginAndNavigateToTripDetail(
  page: Parameters<Parameters<typeof test>[1]>[0]['page'],
) {
  await mockHomePageRoutes(page);
  await page.goto('/login');
  await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
  await page.fill('[placeholder="패스워드"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  // 홈 페이지에서 시드 여행 카드 클릭 (Next.js Link → client-side 이동, Zustand 유지)
  await expect(page.getByText(SEED_TRIP_TITLE).first()).toBeVisible({ timeout: 10000 });
  await page.getByText(SEED_TRIP_TITLE).first().click();
  await page.waitForURL(DETAIL_URL);
}

// ────────────────────────────────────────────────────────────
// 1. 여행 상세 조회 — 비로그인
// ────────────────────────────────────────────────────────────

test.describe('여행 상세 — 비로그인', () => {
  test('여행 제목이 표시된다', async ({ page }) => {
    await page.goto(DETAIL_URL);
    await expect(page.getByText(SEED_TRIP_TITLE)).toBeVisible();
  });

  test('참가 신청 하기 버튼이 표시된다', async ({ page }) => {
    await page.goto(DETAIL_URL);
    await expect(page.getByRole('button', { name: '참가 신청 하기' })).toBeVisible();
  });
});

// ────────────────────────────────────────────────────────────
// 2. 여행 상세 조회 — 호스트 (로그인 후 client-side 이동)
// ────────────────────────────────────────────────────────────

test.describe('여행 상세 — 호스트', () => {
  test('참가 신청 목록 버튼이 표시된다', async ({ page }) => {
    await loginAndNavigateToTripDetail(page);
    await expect(page.getByRole('button', { name: '참가 신청 목록' })).toBeVisible();
  });

  test('여행을 삭제할 수 있다', async ({ page }) => {
    await page.route(`**/api/travel/${SEED_TRIP_NUMBER}`, (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ resultType: 'SUCCESS', success: true, error: null }),
        });
      } else {
        route.fallback();
      }
    });

    await loginAndNavigateToTripDetail(page);
    await expect(page.getByRole('button', { name: '참가 신청 목록' })).toBeVisible();

    // 우상단 ··· 버튼 클릭 → EditAndDeleteModal 오픈 (header 내 마지막 .w-12.h-12 = MoreIcon)
    const moreButton = page.locator('header').locator('.w-12.h-12').last();
    await moreButton.click();

    // EditAndDeleteModal(#end-modal 포탈)에서 "삭제하기" 클릭
    await page.locator('#end-modal').getByRole('button', { name: '삭제하기' }).click();

    // CheckingModal(#checking-modal 포탈)에서 "삭제하기" 클릭
    await page.locator('#checking-modal').getByRole('button', { name: '삭제하기' }).click();

    // 삭제 완료 토스트 확인
    await expect(page.getByText('여행 게시글이 삭제되었어요.')).toBeVisible();
  });
});

// ────────────────────────────────────────────────────────────
// 3. 접근성 (axe)
// ────────────────────────────────────────────────────────────

test.describe('접근성 — 여행 상세 페이지', () => {
  test('/trip/detail/1 비로그인 접근성 위반을 측정한다', async ({ page }) => {
    await page.goto(DETAIL_URL);
    await expect(page.getByText(SEED_TRIP_TITLE)).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    console.log(`[axe] /trip/detail/1 (비로그인) 위반 수: ${results.violations.length}`);
    results.violations.forEach((v) => {
      console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
    });

    expect(results.violations).toBeDefined();
  });

  test('/trip/detail/1 호스트 접근성 위반을 측정한다', async ({ page }) => {
    await loginAndNavigateToTripDetail(page);
    await expect(page.getByRole('button', { name: '참가 신청 목록' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    console.log(`[axe] /trip/detail/1 (호스트) 위반 수: ${results.violations.length}`);
    results.violations.forEach((v) => {
      console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
    });

    expect(results.violations).toBeDefined();
  });
});
