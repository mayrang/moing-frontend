/**
 * 내 여행 E2E 테스트
 *
 * 커버 범위:
 * - 내가 만든 여행 목록 (시드 데이터 사용: travelNumber 1, 4 — userNumber 1)
 * - 참가 신청한 여행 목록 (빈 상태)
 * - 여행 카드 클릭 시 상세 페이지 이동
 */
import { test, expect } from './fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('내 여행 (My Trip)', () => {
  test.describe('만든 여행 목록', () => {
    test('내가 만든 여행 목록이 표시된다', async ({ page }) => {
      await page.goto('/myTrip');

      // 기본 탭은 "북마크" — "만든 여행" 탭으로 전환
      await page.getByText('만든 여행').click();

      // 시드 유저(test@test.com, userNumber 1)의 여행 2개
      await expect(page.getByText('제주도 3박4일 같이 가요!')).toBeVisible();
      await expect(page.getByText('유럽 배낭여행 2주 같이해요')).toBeVisible();
    });

    test('여행 카드 클릭 시 여행 상세 페이지로 이동한다', async ({ page }) => {
      await page.goto('/myTrip');

      await page.getByText('만든 여행').click();
      await page.getByText('제주도 3박4일 같이 가요!').click();
      await expect(page).toHaveURL(/\/trip\/detail\/1/);
    });
  });

  test.describe('참가한 여행 목록', () => {
    test('참가한 여행 탭으로 전환하면 해당 목록이 표시된다', async ({ page }) => {
      await page.goto('/myTrip');

      // "참가한 여행" 탭 클릭
      await page.getByText('참가한 여행').click();

      // 시드 데이터에 신청 완료된 여행 없음 → 빈 상태 메시지 표시
      await expect(
        page.getByText(/아직 신청한 여행이 없어요|신청한 여행이 없|등록된 여행이 없|참가한 여행이 없/)
      ).toBeVisible();
    });
  });
});
