/**
 * [Draft] enrollment E2E 테스트
 *
 * Phase 4 (pages/widgets 레이어) 완료 후 실제 실행 예정.
 * - 페이지 구조 확정 및 selector 검증 필요
 */
import { test, expect } from '@playwright/test';

test.describe('참가 신청 (Enrollment)', () => {
  test.describe.skip('참가 신청', () => {
    test('로그인한 사용자는 여행에 참가 신청할 수 있다', async ({ page }) => {
      await page.route('**/api/enrollment', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            resultType: 'SUCCESS',
            success: { enrollmentNumber: 10 },
            error: null,
          }),
        })
      );

      await page.goto('/trip/apply/1');
      // TODO: 신청 폼 selector는 페이지 구조 확정 후 추가
    });

    test('참가 신청 취소가 가능하다', async ({ page }) => {
      await page.route('**/api/enrollment/10', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ resultType: 'SUCCESS', success: null, error: null }),
        })
      );

      await page.goto('/trip/detail/1');
      // TODO: 취소 버튼 selector는 페이지 구조 확정 후 추가
    });
  });

  test.describe.skip('신청 목록 (호스트)', () => {
    test('호스트는 신청 목록을 볼 수 있다', async ({ page }) => {
      await page.route('**/api/travel/1/enrollments', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            resultType: 'SUCCESS',
            success: {
              enrollments: [{ enrollmentNumber: 1, userName: '신청자1', ageGroup: '20대', status: 'PENDING' }],
            },
            error: null,
          }),
        })
      );

      await page.goto('/trip/enrollmentList/1');
      await expect(page.getByText('신청자1')).toBeVisible();
    });
  });
});
