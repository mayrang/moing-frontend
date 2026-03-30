/**
 * trip E2E 테스트
 *
 * API mock: MSW HTTP 서버 (localhost:9090) — playwright.config.ts의 webServer 설정 참조
 *
 * 커버 범위:
 * - 여행 목록 조회 (비로그인)
 * - 여행 아이템 클릭 → 상세 페이지 이동
 * - 접근성 axe 자동 검사 (/trip/list)
 * - 성능 메트릭 베이스라인 (/trip/list, /trip/detail/1)
 *
 * 실행: yarn test:e2e --project=chromium e2e/trip.spec.ts
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// 시드 데이터: src/mocks/db/store.ts seedDatabase() 기준
const SEED_TRIP_TITLE = '제주도 3박4일 같이 가요!';
const SEED_TRIP_NUMBER = 1;

// ────────────────────────────────────────────────────────────
// 1. 여행 목록 (Trip List)
// ────────────────────────────────────────────────────────────

test.describe('여행 목록 (Trip List)', () => {
  test('최근 여행 목록에 시드 여행이 표시된다', async ({ page }) => {
    await page.goto('/trip/list');
    await expect(page.getByText(SEED_TRIP_TITLE)).toBeVisible();
  });

  test('추천순 탭 전환 시 여행 목록이 표시된다', async ({ page }) => {
    await page.goto('/trip/list?sort=recommend');
    await expect(page.getByText(SEED_TRIP_TITLE)).toBeVisible();
  });

  test('여행 아이템 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    await page.goto('/trip/list');
    await page.getByText(SEED_TRIP_TITLE).click();
    await expect(page).toHaveURL(`/trip/detail/${SEED_TRIP_NUMBER}`);
  });
});

// ────────────────────────────────────────────────────────────
// 2. 접근성 (axe)
// ────────────────────────────────────────────────────────────

test.describe('접근성 — 여행 목록 페이지', () => {
  test('/trip/list 접근성 위반을 측정한다', async ({ page }) => {
    await page.goto('/trip/list');
    await expect(page.getByText(SEED_TRIP_TITLE)).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    console.log(`[axe] /trip/list 위반 수: ${results.violations.length}`);
    results.violations.forEach((v) => {
      console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
    });

    expect(results.violations).toBeDefined();
  });
});

// ────────────────────────────────────────────────────────────
// 3. 성능 메트릭 (베이스라인)
// ────────────────────────────────────────────────────────────

test.describe('성능 메트릭 (베이스라인)', () => {
  const measurePerf = async (
    page: Parameters<Parameters<typeof test>[1]>[0]['page'],
    url: string,
    label: string,
  ) => {
    await page.goto(url, { waitUntil: 'networkidle' });

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find((p) => p.name === 'first-contentful-paint');

      return {
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        load: Math.round(nav.loadEventEnd - nav.startTime),
        fcp: fcp ? Math.round(fcp.startTime) : null,
      };
    });

    console.log(`\n[Perf] ${label} (${url})`);
    console.log(`  TTFB:              ${metrics.ttfb}ms`);
    console.log(`  FCP:               ${metrics.fcp ?? 'N/A'}ms`);
    console.log(`  DOMContentLoaded:  ${metrics.domContentLoaded}ms`);
    console.log(`  Load:              ${metrics.load}ms`);

    return metrics;
  };

  test('여행 목록 페이지 성능 측정', async ({ page }) => {
    const metrics = await measurePerf(page, '/trip/list', '여행 목록');
    expect(metrics).toBeDefined();
  });

  test('여행 상세 페이지 성능 측정', async ({ page }) => {
    const metrics = await measurePerf(page, `/trip/detail/${SEED_TRIP_NUMBER}`, '여행 상세');
    expect(metrics).toBeDefined();
  });
});
