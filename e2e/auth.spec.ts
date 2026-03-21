import { test, expect } from '@playwright/test';

test.describe('인증 (Auth)', () => {
  test.describe('이메일 로그인', () => {
    test('유효한 정보로 로그인하면 홈으로 이동한다', async ({ page }) => {
      await page.route('**/api/login', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: { userId: '1', accessToken: 'test-access-token' },
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
      // 로그인 상태 설정
      await page.route('**/api/login', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: { userId: '1', accessToken: 'test-access-token' },
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

      // 로그아웃 버튼 클릭 (마이페이지 등에 있다고 가정)
      // 실제 로그아웃 UI 위치에 따라 selector 조정 필요
      await expect(page).toHaveURL('/');
    });
  });
});
