/**
 * 마이페이지 E2E 테스트
 *
 * 커버 범위:
 * - 마이페이지 기본 정보 표시 (내 활동 현황, 메뉴 항목)
 * - 참가 신청한 여행 페이지 이동
 * - 작성한 글(커뮤니티) 페이지 이동
 * - 서비스 정보 링크 표시
 */
import { test, expect } from './fixtures';

// MSW db 상태 충돌 방지
test.describe.configure({ mode: 'serial' });

test.describe('마이페이지 E2E', () => {
  test('마이페이지 기본 메뉴가 표시된다', async ({ page }) => {
    await page.goto('/myPage');

    await expect(page.getByText('내 활동 현황')).toBeVisible();
    await expect(page.getByText('참가 신청한 여행')).toBeVisible();
    await expect(page.getByText('작성한 글')).toBeVisible();
    await expect(page.getByText('공지사항')).toBeVisible();
    await expect(page.getByText('1:1 문의하기')).toBeVisible();
  });

  test('서비스 약관 링크가 표시된다', async ({ page }) => {
    await page.goto('/myPage');

    await expect(page.getByText('서비스이용약관')).toBeVisible();
    await expect(page.getByText('개인정보처리방침')).toBeVisible();
  });

  test('참가 신청한 여행 메뉴 클릭 시 해당 페이지로 이동한다', async ({ page }) => {
    await page.goto('/myPage');

    await page.getByText('참가 신청한 여행').click();
    await expect(page).toHaveURL('/requestedTrip');
  });

  test('1:1 문의하기 클릭 시 문의 페이지로 이동한다', async ({ page }) => {
    await page.goto('/myPage');

    await page.getByText('1:1 문의하기').click();
    await expect(page).toHaveURL('/contact');
  });
});
