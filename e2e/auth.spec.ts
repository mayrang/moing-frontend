/**
 * [Draft] auth E2E 테스트
 *
 * Phase 4 (pages/widgets 레이어) 완료 후 실제 실행 예정.
 * - 페이지 구조 확정 및 selector 검증 필요
 * - API 응답 포맷을 실제 서버 스펙에 맞게 조정 필요
 */
import { test, expect } from '@playwright/test';

test.describe('인증 (Auth)', () => {
  test.describe('이메일 로그인', () => {
    test('유효한 정보로 로그인하면 홈으로 이동한다', async ({ page }) => {
      await page.route('**/api/login', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            resultType: 'SUCCESS',
            success: { userId: '1', accessToken: 'test-access-token' },
            error: null,
          }),
        })
      );

      await page.goto('/login');
      await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
      await page.fill('[placeholder="패스워드"]', 'Password123!');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL('/');
    });

    test('잘못된 정보로 로그인하면 에러 메시지가 표시된다', async ({ page }) => {
      await page.route('**/api/login', (route) =>
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid credentials' }),
        })
      );

      await page.goto('/login');
      await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
      await page.fill('[placeholder="패스워드"]', 'Password123!');
      await page.click('button[type="submit"]');

      await expect(page.getByText('로그인 정보를 다시 확인해주세요.')).toBeVisible();
    });

    test('이메일과 패스워드가 모두 유효할 때만 로그인 버튼이 활성화된다', async ({ page }) => {
      await page.goto('/login');

      const loginButton = page.getByRole('button', { name: '로그인' });
      await expect(loginButton).toBeDisabled();

      await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
      await page.fill('[placeholder="패스워드"]', 'Password123!');

      await expect(loginButton).toBeEnabled();
    });
  });

  test.describe('로그아웃', () => {
    test('로그아웃 후 홈으로 이동한다', async ({ page }) => {
      await page.route('**/api/login', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            resultType: 'SUCCESS',
            success: { userId: '1', accessToken: 'test-access-token' },
            error: null,
          }),
        })
      );
      await page.route('**/api/logout', (route) =>
        route.fulfill({ status: 200, body: '{}' })
      );

      await page.goto('/login');
      await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
      await page.fill('[placeholder="패스워드"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/');

      // TODO: 로그아웃 버튼 selector는 페이지 구조 확정 후 추가
      await expect(page).toHaveURL('/');
    });
  });
});
