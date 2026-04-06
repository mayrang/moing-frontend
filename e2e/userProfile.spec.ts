/**
 * 유저 프로필 E2E 테스트
 *
 * 커버 범위:
 * - 여행 상세 페이지에서 작성자 프로필 오버레이 오픈
 * - "만든 여행" 탭 표시 및 여행 목록
 * - "신청한 여행" 탭 전환
 *
 * 시드 데이터:
 *   travelNumber 1 — 작성자: 김여행 (userNumber 1)
 *   userNumber 1 — 만든 여행: travelNumber 1, 4
 */
import { test, expect } from './fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('유저 프로필 E2E', () => {
  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:8080/api/test/reset');
    await request.post('http://localhost:9090/api/test/reset');
  });

  test('여행 상세에서 작성자 이름 클릭 시 프로필 오버레이가 열린다', async ({ page }) => {
    await page.goto('/trip/detail/1');
    await page.waitForLoadState('networkidle');

    // 여행 작성자 이름 "김여행" 클릭 → userProfileOverlayStore.setProfileShow(true)
    await page.getByText('김여행').first().click();

    // 오버레이: position:absolute, z-[1001], 슬라이드 애니메이션
    // 프로필 오버레이 내 닫기 버튼 또는 탭이 보이면 오픈된 것
    await expect(page.getByText('만든 여행')).toBeVisible();
  });

  test('프로필 오버레이에서 만든 여행 목록이 표시된다', async ({ page }) => {
    await page.goto('/trip/detail/1');
    await page.waitForLoadState('networkidle');

    await page.getByText('김여행').first().click();

    // 기본 탭 "만든 여행" — 시드 여행 목록 확인
    await expect(page.getByText('만든 여행')).toBeVisible();
    await expect(page.getByText('제주도 3박4일 같이 가요!').first()).toBeVisible();
  });

  test('프로필 오버레이에서 신청한 여행 탭으로 전환할 수 있다', async ({ page }) => {
    await page.goto('/trip/detail/1');
    await page.waitForLoadState('networkidle');

    await page.getByText('김여행').first().click();

    // "참가한 여행" 탭 클릭 (UI 표기: 신청한 여행 → 참가한 여행)
    await page.getByRole('button', { name: '참가한 여행' }).click();

    // 시드 데이터에 userNumber 1의 참가한 여행 없음 → 빈 상태
    await expect(page.getByText('아직 참가한 여행이 없어요').first()).toBeVisible();
  });
});
