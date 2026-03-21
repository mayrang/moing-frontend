import { test, expect } from '@playwright/test';

test.describe.skip('MyPage E2E (Phase 4에서 활성화)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mypage');
  });

  test('마이페이지 정보가 표시된다', async ({ page }) => {
    await expect(page.getByText('내 정보')).toBeVisible();
  });

  test('프로필 정보를 수정할 수 있다', async ({ page }) => {
    await page.getByRole('button', { name: '수정' }).click();
    await page.getByPlaceholder('이름').fill('새이름');
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByText('수정이 완료되었습니다')).toBeVisible();
  });

  test('비밀번호를 변경할 수 있다', async ({ page }) => {
    await page.getByRole('button', { name: '비밀번호 변경' }).click();
    await page.getByPlaceholder('현재 비밀번호').fill('currentPw123!');
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByText('비밀번호 변경')).toBeVisible();
  });

  test('회원 탈퇴를 진행할 수 있다', async ({ page }) => {
    await page.getByRole('button', { name: '회원 탈퇴' }).click();
    await page.getByRole('button', { name: '확인' }).click();
    await page.waitForURL('/');
  });
});
