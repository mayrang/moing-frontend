/**
 * [Draft] myTrip E2E 테스트
 *
 * Phase 4 (pages/widgets 레이어) 완료 후 실제 실행 예정.
 */
import { test, expect } from '@playwright/test';

test.describe('내 여행 (My Trip)', () => {
  test.describe.skip('만든 여행 목록', () => {
    test('내가 만든 여행 목록이 표시된다', async ({ page }) => {
      await page.route('**/api/my-travels*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            resultType: 'SUCCESS',
            success: {
              content: [{ travelNumber: 1, title: '내가 만든 여행', location: '서울' }],
              page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
            },
            error: null,
          }),
        })
      );

      await page.goto('/myPage/myTrip');
      await expect(page.getByText('내가 만든 여행')).toBeVisible();
    });
  });

  test.describe.skip('참가한 여행 목록', () => {
    test('참가한 여행 목록이 표시된다', async ({ page }) => {
      await page.route('**/api/my-applied-travels*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            resultType: 'SUCCESS',
            success: {
              content: [{ travelNumber: 2, title: '참가한 여행', location: '부산' }],
              page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
            },
            error: null,
          }),
        })
      );

      await page.goto('/myPage/myTrip?tab=apply');
      await expect(page.getByText('참가한 여행')).toBeVisible();
    });
  });
});
