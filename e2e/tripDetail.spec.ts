/**
 * [Draft] tripDetail E2E 테스트
 *
 * Phase 4 (pages/widgets 레이어) 완료 후 실제 실행 예정.
 * - 페이지 구조 확정 및 selector 검증 필요
 * - API 응답 포맷을 실제 서버 스펙에 맞게 조정 필요
 */
import { test, expect } from '@playwright/test';

const mockTripDetail = {
  resultType: 'SUCCESS',
  success: {
    travelNumber: 1,
    title: '유럽 배낭여행',
    location: '프랑스',
    details: '즐거운 유럽 여행입니다.',
    maxPerson: 4,
    nowPerson: 2,
    genderType: '모두',
    startDate: '2024-06-01',
    endDate: '2024-06-10',
    tags: ['유럽', '배낭여행'],
    hostUserCheck: false,
    bookmarked: false,
    userName: '테스터',
  },
  error: null,
};

test.describe('여행 상세 (Trip Detail)', () => {
  test.describe('상세 조회', () => {
    test('여행 제목이 표시된다', async ({ page }) => {
      await page.route('**/api/travel/detail/1', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockTripDetail),
        })
      );
      await page.route('**/api/travel/1/enrollmentCount', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ resultType: 'SUCCESS', success: { count: 2 }, error: null }),
        })
      );
      await page.route('**/api/travel/1/companions', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ resultType: 'SUCCESS', success: { companions: [] }, error: null }),
        })
      );

      await page.goto('/trip/detail/1');
      await expect(page.getByText('유럽 배낭여행')).toBeVisible();
    });

    test('참가 신청 버튼이 표시된다', async ({ page }) => {
      await page.route('**/api/travel/detail/1', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockTripDetail),
        })
      );

      await page.goto('/trip/detail/1');
      await expect(page.getByRole('button', { name: '참가 신청 하기' })).toBeVisible();
    });
  });

  test.describe('여행 삭제', () => {
    test('호스트는 여행을 삭제할 수 있다', async ({ page }) => {
      const hostMockDetail = {
        ...mockTripDetail,
        success: { ...mockTripDetail.success, hostUserCheck: true },
      };

      await page.route('**/api/travel/detail/1', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(hostMockDetail),
        })
      );
      await page.route('**/api/travel/1', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ resultType: 'SUCCESS', success: null, error: null }),
        })
      );

      await page.goto('/trip/detail/1');
      // TODO: 삭제 버튼 selector는 페이지 구조 확정 후 추가
    });
  });
});
