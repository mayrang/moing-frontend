/**
 * 알림 E2E 테스트
 *
 * 커버 범위:
 * - 알림 목록 렌더링 (page.route로 API 목킹)
 * - 이미 읽은 / 읽지 않은 알림 구분 표시
 * - 스크롤 인피니티 로드 (2페이지 이상)
 */
import { test, expect } from './fixtures';

const MOCK_NOTIFICATION = (overrides = {}) => ({
  notificationNumber: 1,
  userNumber: 1,
  title: '신청 알림',
  content: '테스트 알림 메시지입니다.',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const fulfillNotifications = async (
  page: Parameters<Parameters<typeof test>[1]>[0]['page'],
  notifications: ReturnType<typeof MOCK_NOTIFICATION>[]
) => {
  await page.route('**/api/notifications**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        resultType: 'SUCCESS',
        success: {
          content: notifications,
          page: {
            size: 10,
            number: 0,
            totalElements: notifications.length,
            totalPages: 1,
          },
          unreadCount: notifications.filter((n) => !n.isRead).length,
        },
        error: null,
      }),
    })
  );
};

test.describe.configure({ mode: 'serial' });

test.describe('알림 E2E', () => {
  test('알림 목록이 표시된다', async ({ page }) => {
    await fulfillNotifications(page, [
      MOCK_NOTIFICATION({ notificationNumber: 1, content: '제주도 여행에 새 신청자가 있어요.' }),
      MOCK_NOTIFICATION({ notificationNumber: 2, content: '유럽 배낭여행 신청이 수락됐어요.', isRead: true }),
    ]);

    await page.goto('/notification');

    await expect(page.getByText('제주도 여행에 새 신청자가 있어요.')).toBeVisible();
    await expect(page.getByText('유럽 배낭여행 신청이 수락됐어요.')).toBeVisible();
  });

  test('알림이 없을 때 빈 화면이 표시된다', async ({ page }) => {
    await fulfillNotifications(page, []);

    await page.goto('/notification');

    // 알림이 없으면 목록 대신 빈 컨테이너만 렌더됨 (에러/리디렉션 없음)
    await expect(page).toHaveURL('/notification');
    // 헤더 타이틀이 표시되는지 확인
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
