# Trip 페이지 베이스라인 측정 결과

측정 일시: 2026-03-29
환경: `yarn dev` (Next.js 개발 서버, localhost:8080) + MSW Express 목 서버 (localhost:9090)
도구: Playwright E2E + `@axe-core/playwright` (WCAG 2.1 AA)

---

## 1. 성능 메트릭 (Performance Baseline)

> 측정 스펙: `e2e/trip.spec.ts` > "성능 메트릭 (베이스라인)"
> 주의: 개발 서버 기준 — 프로덕션 빌드보다 느림. 상대적 비교용으로 활용.

### `/trip/list`

| 지표             | 값      |
|-----------------|---------|
| TTFB            | 762ms   |
| FCP             | 1,600ms |
| DOMContentLoaded | 793ms  |
| Load            | 1,289ms |

### `/trip/detail/1`

| 지표             | 값      |
|-----------------|---------|
| TTFB            | 956ms   |
| FCP             | 1,656ms |
| DOMContentLoaded | 986ms  |
| Load            | 1,357ms |

---

## 2. 접근성 위반 (axe Baseline)

> 기준: WCAG 2.1 AA (`wcag2a`, `wcag2aa` 태그)
> 측정 스펙: `e2e/trip.spec.ts`, `e2e/tripDetail.spec.ts`, `e2e/enrollment.spec.ts`

### `/trip/list` — 비로그인

| impact   | rule-id                    | 설명                                        |
|----------|----------------------------|---------------------------------------------|
| critical | `button-name`              | 텍스트가 없는 버튼 (아이콘 버튼 alt 누락)      |
| serious  | `color-contrast`           | 전경/배경 색상 대비 WCAG AA 미충족             |
| serious  | `document-title`           | `<title>` 요소 없음                          |

위반 수: **3**

---

### `/trip/detail/1` — 비로그인

| impact   | rule-id                       | 설명                                        |
|----------|-------------------------------|---------------------------------------------|
| critical | `button-name`                 | 텍스트가 없는 버튼 (아이콘 버튼 alt 누락)      |
| serious  | `color-contrast`              | 전경/배경 색상 대비 WCAG AA 미충족             |
| serious  | `scrollable-region-focusable` | 스크롤 가능 영역이 키보드로 접근 불가           |

위반 수: **3**

---

### `/trip/detail/1` — 호스트 (로그인 후 client-side 이동)

| impact   | rule-id                       | 설명                                        |
|----------|-------------------------------|---------------------------------------------|
| critical | `button-name`                 | 텍스트가 없는 버튼                            |
| serious  | `color-contrast`              | 색상 대비 미충족                              |
| serious  | `scrollable-region-focusable` | 스크롤 가능 영역 키보드 접근 불가              |

위반 수: **3** (비로그인과 동일)

---

### `/trip/apply/1` — 비로그인

| impact   | rule-id         | 설명                     |
|----------|-----------------|--------------------------|
| critical | `button-name`   | 텍스트가 없는 버튼         |
| serious  | `document-title`| `<title>` 요소 없음       |

위반 수: **2**

---

## 3. 주요 위반 해석 및 개선 방향

### `button-name` (critical)
- **원인**: 아이콘 전용 버튼 (`ShareIcon`, `BackIcon`, `AlarmIcon` 등)에 접근 가능한 텍스트가 없음
- **개선**: `aria-label` 추가 또는 `<span className="sr-only">` 삽입
- **우선순위**: High (critical 등급)

### `document-title` (serious)
- **원인**: Next.js `<head>` 에 `<title>` 태그 없음 (Metadata API 미적용)
- **개선**: 각 페이지 `layout.tsx` 또는 `page.tsx`에 `export const metadata = { title: '...' }` 추가
- **우선순위**: Medium

### `color-contrast` (serious)
- **원인**: `--color-text-muted`, `--color-muted3` 등 연한 색상 사용 영역이 4.5:1 미충족
- **개선**: CSS 변수 값 조정 또는 해당 영역 텍스트 색상 강화
- **우선순위**: Medium

### `scrollable-region-focusable` (serious)
- **원인**: 지도/캐러셀 등 스크롤 가능 영역에 `tabindex="0"` 누락
- **개선**: 스크롤 가능한 `div`에 `tabindex="0"` + `role` 부여
- **우선순위**: Medium

---

## 4. 테스트 파일

| 파일 | 커버 범위 |
|------|-----------|
| `e2e/trip.spec.ts` | `/trip/list` 목록, axe, 성능 |
| `e2e/tripDetail.spec.ts` | `/trip/detail/1` 비로그인/호스트, axe |
| `e2e/enrollment.spec.ts` | `/trip/apply/1`, `/trip/enrollmentList/1`, axe |
