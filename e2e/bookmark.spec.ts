/**
 * [Draft] bookmark E2E 테스트
 *
 * Phase 4 (pages/widgets 레이어) 완료 후 실제 실행 예정.
 * - 페이지 구조 확정 및 selector 검증 필요
 */
import { test, expect } from '@playwright/test';

test.describe('북마크 (Bookmark)', () => {
  test.describe('북마크 목록', () => {
    test('북마크한 여행 목록이 표시된다', async ({ page }) => {
      await page.route('**/api/bookmarks*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            resultType: 'SUCCESS',
            success: {
              content: [
                {
                  travelNumber: 1,
                  title: '유럽 배낭여행',
                  userName: '테스터',
                  tags: ['유럽'],
                  nowPerson: 2,
                  maxPerson: 4,
                  location: '프랑스',
                  bookmarked: true,
                },
              ],
              page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
            },
            error: null,
          }),
        })
      );

      await page.goto('/myPage/bookmark');
      await expect(page.getByText('유럽 배낭여행')).toBeVisible();
    });
  });

  test.describe('북마크 토글', () => {
    test('북마크 버튼 클릭 시 북마크가 추가된다', async ({ page }) => {
      await page.route('**/api/bookmarks', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ resultType: 'SUCCESS', success: null, error: null }),
        })
      );

      await page.goto('/trip/detail/1');
      // TODO: 북마크 버튼 selector는 페이지 구조 확정 후 추가
    });
  });
});
