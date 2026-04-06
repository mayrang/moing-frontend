/**
 * 댓글 E2E 테스트
 *
 * 커버 범위:
 * - 여행 상세 댓글 페이지 진입
 * - 댓글 작성 및 목록 표시
 * - 작성한 댓글 삭제 (serial — 작성 후 삭제)
 */
import { test, expect } from './fixtures';

// 댓글 작성 → 삭제를 순서대로 실행
test.describe.configure({ mode: 'serial' });

test.describe('댓글 E2E', () => {
  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:8080/api/test/reset');
    await request.post('http://localhost:9090/api/test/reset');
  });

  test('댓글 입력 폼이 표시된다', async ({ page }) => {
    await page.goto('/trip/comment/1');

    // 로그인 상태 → 편집 가능한 입력창
    await expect(page.getByPlaceholder('댓글을 입력해주세요.')).toBeVisible();
    await expect(page.getByRole('button', { name: '댓글 등록' })).toBeVisible();
  });

  test('댓글을 작성하면 목록에 표시된다', async ({ page }) => {
    await page.goto('/trip/comment/1');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('댓글을 입력해주세요.').fill('E2E 테스트 댓글입니다.');
    await page.getByRole('button', { name: '댓글 등록' }).click();

    await expect(page.getByText('E2E 테스트 댓글입니다.')).toBeVisible();
  });

  test('작성한 댓글을 삭제할 수 있다', async ({ page }) => {
    await page.goto('/trip/comment/1');

    // 방금 작성된 댓글의 줄임표(...) 버튼 클릭 → EditAndDeleteModal
    const commentText = page.getByText('E2E 테스트 댓글입니다.');
    await expect(commentText).toBeVisible();

    // 댓글 컨테이너 내 줄임표 버튼 — border-b 클래스를 가진 외부 컨테이너에서 탐색
    const commentContainer = page.locator('div.border-b').filter({ hasText: 'E2E 테스트 댓글입니다.' });
    await commentContainer.getByRole('button').first().click();

    // EditAndDeleteModal 바텀시트에서 "삭제하기" 클릭
    await page.getByRole('dialog', { name: '수정/삭제 메뉴' }).getByRole('button', { name: '삭제하기' }).click();

    // CheckingModal 확인 (COMMENT_MODAL_MESSAGES.text = '삭제하기')
    await page.getByRole('dialog', { name: '댓글 삭제' }).getByRole('button', { name: '삭제하기' }).click();

    // 삭제 완료 토스트
    await expect(page.getByText('댓글이 삭제되었어요.')).toBeVisible();
  });
});
