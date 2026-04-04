/**
 * 공유 테스트 픽스처
 *
 * 인증이 필요한 spec 파일에서 import해 사용한다.
 * `test` 객체가 page 픽스처를 override해 매 테스트 시작 전 자동 로그인한다.
 *
 * 사용법:
 *   import { test, expect } from './fixtures';
 */
import { test as base, expect } from '@playwright/test';

/**
 * 로그인된 page를 제공하는 픽스처.
 * 시드 유저(test@test.com / Password123!)로 로그인 후 홈(/)을 대기한다.
 */
export const test = base.extend<{ page: typeof base.info extends () => infer R ? R : never }>({
  page: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
    await page.fill('[placeholder="패스워드"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await use(page);
  },
});

export { expect };
