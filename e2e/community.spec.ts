/**
 * 커뮤니티 E2E 테스트
 *
 * 커버 범위:
 * - 커뮤니티 목록 로드 (시드 데이터 확인)
 * - 글 작성 플로우 (글쓰기 → 제목/내용 입력 → 완료)
 * - 커뮤니티 상세 페이지 진입 (좋아요 버튼 표시)
 * - 본인 글 삭제
 *
 * 시드 커뮤니티 데이터:
 *   communityNumber 1 — "제주도 맛집 추천해주세요" (userNumber 1 — test@test.com)
 *   communityNumber 2 — "도쿄 교통패스 스이카 vs 파스모 뭐가 나을까요?"
 *   communityNumber 3 — "혼자 여행 vs 같이 여행 어떻게 생각하세요?"
 */
import { test, expect } from './fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('커뮤니티 E2E', () => {
  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:8080/api/test/reset');
    await request.post('http://localhost:9090/api/test/reset');
  });

  test('커뮤니티 목록에 게시글이 표시된다', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('제주도 맛집 추천해주세요')).toBeVisible();
    await expect(page.getByText('도쿄 교통패스 스이카 vs 파스모 뭐가 나을까요?')).toBeVisible();
  });

  test('글쓰기 버튼 클릭 시 작성 페이지로 이동한다', async ({ page }) => {
    await page.goto('/community');

    await page.getByRole('button', { name: '글쓰기' }).first().click();
    await expect(page).toHaveURL('/community/create');
  });

  test('커뮤니티 글을 작성할 수 있다', async ({ page }) => {
    await page.goto('/community/create');
    await page.waitForLoadState('networkidle');

    // initOpen=true로 말머리 드롭다운이 이미 열려 있음 — 애니메이션 대기 후 클릭
    await page.getByRole('option', { name: '잡담' }).click();

    await page.getByPlaceholder('제목을 입력해주세요. (최대 20자)').fill('E2E 테스트 게시글');
    await page.getByPlaceholder('내용을 입력해주세요. (최대 2,000자)').fill('E2E 테스트 내용입니다.');
    await page.getByRole('button', { name: '완료' }).click();

    // 작성 완료 후 커뮤니티 상세 페이지로 이동
    await expect(page).toHaveURL(/\/community\/detail\/\d+/);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('E2E 테스트 게시글')).toBeVisible();
  });

  test('커뮤니티 상세 페이지에 좋아요 버튼이 표시된다', async ({ page }) => {
    await page.goto('/community/detail/2');

    // 좋아요 버튼 (하트 아이콘 + likeCount)
    await expect(page.getByText('좋아요').first()).toBeVisible();
  });

  test('본인 글을 삭제할 수 있다', async ({ page }) => {
    // 시드 communityNumber 1은 userNumber 1(test@test.com) 소유
    await page.goto('/community/detail/1');

    // 줄임표 버튼 (MoreIcon: viewBox="0 0 5 22" 인 SVG, div onClick으로 감싸져 있어 button이 아님)
    await page.locator('svg[viewBox="0 0 5 22"]').click();
    await page.getByRole('dialog', { name: '수정/삭제 메뉴' }).getByRole('button', { name: '삭제하기' }).click();

    // 확인 모달 → 삭제 실행
    await page.getByRole('dialog', { name: '정말 삭제할까요?' }).getByRole('button', { name: '삭제하기' }).click();

    // 삭제 후 커뮤니티 목록으로 복귀
    await expect(page).toHaveURL('/community');
  });
});
