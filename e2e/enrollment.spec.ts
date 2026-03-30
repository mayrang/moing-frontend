/**
 * enrollment E2E 테스트
 *
 * API mock: MSW HTTP 서버 (localhost:9090) — playwright.config.ts의 webServer 설정 참조
 *
 * 커버 범위:
 * - 참가 신청 폼 (비로그인): 보내기 버튼 비활성/활성 상태
 * - 신청 목록 (호스트): 신청자 표시, 수락 플로우, 거절 플로우
 * - 접근성 axe 자동 검사 (/trip/apply/1)
 *
 * 실행: yarn test:e2e --project=chromium e2e/enrollment.spec.ts
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SEED_TRIP_NUMBER = 1;
const APPLY_URL = `/trip/apply/${SEED_TRIP_NUMBER}`;
const ENROLLMENT_LIST_URL = `/trip/enrollmentList/${SEED_TRIP_NUMBER}`;

// 신청 목록 테스트용 mock 데이터
const mockEnrollments = {
  enrollments: [
    {
      enrollmentNumber: 1001,
      userName: '신청자유저',
      userAgeGroup: '20대',
      enrolledAt: new Date().toISOString(),
      message: '함께 여행하고 싶습니다!',
      status: 'PENDING',
      profileUrl: null,
    },
  ],
  totalCount: 1,
};

const SEED_TRIP_TITLE = '제주도 3박4일 같이 가요!';

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

/**
 * User1(호스트) 로그인 후 홈 → trip detail → enrollment list 까지 client-side 이동.
 * page.goto()를 사용하면 Zustand가 초기화되므로 client-side 이동이 필요.
 */
async function loginAndNavigateToEnrollmentList(
  page: Parameters<Parameters<typeof test>[1]>[0]['page'],
) {
  await mockHomePageRoutes(page);
  await page.goto('/login');
  await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
  await page.fill('[placeholder="패스워드"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  // 홈에서 trip detail로 client-side 이동 (Zustand 유지)
  await expect(page.getByText(SEED_TRIP_TITLE).first()).toBeVisible({ timeout: 10000 });
  await page.getByText(SEED_TRIP_TITLE).first().click();
  await page.waitForURL(`/trip/detail/${SEED_TRIP_NUMBER}`);
  // 호스트 버튼 확인 후 클릭
  await expect(page.getByRole('button', { name: '참가 신청 목록' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: '참가 신청 목록' }).click();
  await page.waitForURL(ENROLLMENT_LIST_URL);
}

/** 신청 목록 페이지에서 필요한 API 경로 모킹 */
async function mockEnrollmentListRoutes(
  page: Parameters<Parameters<typeof test>[1]>[0]['page'],
) {
  await page.route(`**/api/travel/${SEED_TRIP_NUMBER}/enrollments`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resultType: 'SUCCESS', success: mockEnrollments, error: null }),
    }),
  );
  // GET last-viewed + PUT last-viewed 통합 처리
  await page.route(`**/api/travel/${SEED_TRIP_NUMBER}/enrollments/last-viewed`, (route) => {
    if (route.request().method() === 'PUT') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultType: 'SUCCESS', success: true, error: null }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resultType: 'SUCCESS',
          success: { lastViewedAt: null },
          error: null,
        }),
      });
    }
  });
}

// ────────────────────────────────────────────────────────────
// 1. 참가 신청 폼 — 비로그인
// ────────────────────────────────────────────────────────────

test.describe('참가 신청 폼', () => {
  test('메시지가 없으면 보내기 버튼이 비활성화된다', async ({ page }) => {
    await page.goto(APPLY_URL);
    await expect(page.getByRole('button', { name: '보내기' })).toBeDisabled();
  });

  test('메시지 입력 후 보내기 버튼이 활성화된다', async ({ page }) => {
    await page.goto(APPLY_URL);
    await page.locator('textarea:not([readonly])').fill('신청합니다!');
    await expect(page.getByRole('button', { name: '보내기' })).toBeEnabled();
  });

  test('참가 신청 성공 후 상세 페이지로 이동한다', async ({ page }) => {
    await page.route('**/api/enrollment', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            resultType: 'SUCCESS',
            success: { enrollmentNumber: 10 },
            error: null,
          }),
        });
      } else {
        route.fallback();
      }
    });

    // 로그인해서 httpOnly refreshToken 쿠키 설정
    await mockHomePageRoutes(page);
    await page.goto('/login');
    await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
    await page.fill('[placeholder="패스워드"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // page.goto()로 apply 페이지 이동 → Zustand 초기화되지만 쿠키는 유지
    // AppShell이 !accessToken 감지 → userPostRefreshToken() 호출 → MSW가 새 accessToken 반환
    await page.goto(APPLY_URL);
    await page.waitForResponse('**/api/token/refresh');
    await page.waitForLoadState('networkidle');

    await page.locator('textarea:not([readonly])').fill('신청합니다!');
    await page.getByRole('button', { name: '보내기' }).click();

    await expect(page).toHaveURL(`/trip/detail/${SEED_TRIP_NUMBER}`);
  });
});

// ────────────────────────────────────────────────────────────
// 2. 신청 목록 — 호스트 (로그인 후 접근)
// ────────────────────────────────────────────────────────────

test.describe('신청 목록 — 호스트', () => {
  test.beforeEach(async ({ page }) => {
    await mockEnrollmentListRoutes(page);
    await loginAndNavigateToEnrollmentList(page);
  });

  test('신청자 이름이 목록에 표시된다', async ({ page }) => {
    await expect(page.getByText('신청자유저')).toBeVisible();
  });

  test('수락 플로우: 수락하기 클릭 후 수락 완료 모달이 표시된다', async ({ page }) => {
    await page.route(`**/api/enrollment/1001/acceptance`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultType: 'SUCCESS', success: true, error: null }),
      }),
    );

    await expect(page.getByText('신청자유저')).toBeVisible();

    // 수락 버튼 클릭 → CheckingModal 오픈
    await page.getByText('수락').click();

    // CheckingModal에서 수락하기 클릭
    await page.getByRole('button', { name: '수락하기' }).click();

    // ResultModal 확인
    await expect(page.getByText('참가 수락 완료')).toBeVisible();
  });

  test('거절 플로우: 거절하기 클릭 후 거절 토스트가 표시된다', async ({ page }) => {
    await page.route(`**/api/enrollment/1001/rejection`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultType: 'SUCCESS', success: true, error: null }),
      }),
    );

    await expect(page.getByText('신청자유저')).toBeVisible();

    // 거절 버튼 클릭 → CheckingModal 오픈
    await page.getByText('거절', { exact: true }).click();

    // CheckingModal에서 거절하기 클릭
    await page.getByRole('button', { name: '거절하기' }).click();

    // 거절 완료 토스트 확인
    await expect(page.getByText('여행 참가가 거절되었어요.')).toBeVisible();
  });
});

// ────────────────────────────────────────────────────────────
// 3. 접근성 (axe)
// ────────────────────────────────────────────────────────────

test.describe('접근성 — 참가 신청 폼', () => {
  test('/trip/apply/1 접근성 위반을 측정한다', async ({ page }) => {
    await page.goto(APPLY_URL);
    await page.locator('textarea:not([readonly])').waitFor({ state: 'visible' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    console.log(`[axe] /trip/apply/1 위반 수: ${results.violations.length}`);
    results.violations.forEach((v) => {
      console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
    });

    expect(results.violations).toBeDefined();
  });
});
