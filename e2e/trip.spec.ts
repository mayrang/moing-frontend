/**
 * [Draft] trip E2E 테스트
 *
 * Phase 4 (pages/widgets 레이어) 완료 후 실제 실행 예정.
 * - 페이지 구조 확정 및 selector 검증 필요
 * - API 응답 포맷을 실제 서버 스펙에 맞게 조정 필요
 */
import { test, expect } from '@playwright/test';

const mockTripList = {
  resultType: 'SUCCESS',
  success: {
    content: [
      {
        travelNumber: 1,
        title: '유럽 배낭여행',
        userNumber: 1,
        userName: '테스터',
        tags: ['유럽', '배낭여행'],
        nowPerson: 2,
        maxPerson: 4,
        createdAt: '2024-01-01T00:00:00',
        registerDue: '2024-12-31',
        location: '프랑스',
        bookmarked: false,
      },
    ],
    page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
  },
  error: null,
};

test.describe('여행 목록 (Trip List)', () => {
  test.describe.skip('홈 여행 목록', () => {
    test('최근 여행 목록이 표시된다', async ({ page }) => {
      await page.route('**/api/travels/recent*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockTripList),
        })
      );

      await page.goto('/trip/list');
      await expect(page.getByText('유럽 배낭여행')).toBeVisible();
    });

    test('추천 여행 탭 클릭 시 추천 목록이 표시된다', async ({ page }) => {
      await page.route('**/api/travels/recommend*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockTripList),
        })
      );

      await page.goto('/trip/list?sort=recommend');
      await expect(page.getByText('유럽 배낭여행')).toBeVisible();
    });

    test('여행 아이템 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
      await page.route('**/api/travels/recent*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockTripList),
        })
      );

      await page.goto('/trip/list');
      await page.click('text=유럽 배낭여행');
      await expect(page).toHaveURL('/trip/detail/1');
    });
  });

  test.describe.skip('인기 여행 장소', () => {
    test('5개의 인기 장소가 표시된다', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('뉴욕')).toBeVisible();
      await expect(page.getByText('제주도')).toBeVisible();
      await expect(page.getByText('도쿄')).toBeVisible();
      await expect(page.getByText('파리')).toBeVisible();
      await expect(page.getByText('서울')).toBeVisible();
    });

    test('장소 클릭 시 검색 페이지로 이동한다', async ({ page }) => {
      await page.goto('/');
      await page.click('text=뉴욕');
      await expect(page).toHaveURL('/search/travel?keyword=뉴욕');
    });
  });
});
