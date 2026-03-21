/**
 * [Draft] search E2E 테스트
 *
 * Phase 4 (pages/widgets 레이어) 완료 후 실제 실행 예정.
 */
import { test, expect } from '@playwright/test';

test.describe.skip('검색 (Search)', () => {
  test('키워드 입력 시 자동완성 목록이 표시된다', async ({ page }) => {
    await page.route('**/api/autocomplete**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resultType: 'SUCCESS',
          success: { suggestions: ['서울여행', '서울맛집'] },
          error: null,
        }),
      })
    );

    await page.goto('/search/travel');
    await page.fill('[placeholder*="검색"]', '서울');

    await expect(page.getByText('서울여행')).toBeVisible();
  });

  test('검색 결과가 표시된다', async ({ page }) => {
    await page.route('**/api/travels/search**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resultType: 'SUCCESS',
          success: {
            content: [{ travelNumber: 1, title: '유럽 여행' }],
            page: { number: 0, totalPages: 1, totalElements: 1 },
          },
          error: null,
        }),
      })
    );

    await page.goto('/search/travel?keyword=유럽');
    await expect(page.getByText('유럽 여행')).toBeVisible();
  });
});
