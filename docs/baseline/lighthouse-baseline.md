# Lighthouse 성능 기준선 (Baseline)

> 측정일: 2026-03-28
> 환경: Next.js 14 dev 서버 (localhost:8080) + Mock 서버 (localhost:9090)
> ⚠️ dev 모드 특성상 Performance 수치는 production 대비 크게 낮게 측정됨 (TBT, TTI 특히 영향)

---

## 점수 요약

| 페이지 | Performance | Accessibility | Best Practices | SEO |
|--------|------------|---------------|----------------|-----|
| `/` (홈) | 29 | 84 | 92 | 82 |
| `/login` | 72 | 90 | 96 | 82 |
| `/trip/list` | 35 | 89 | 96 | 82 |
| `/community` | 30 | 74 | 92 | 82 |
| `/registerEmail` | 49 | 83 | 96 | 80 |

---

## Core Web Vitals 상세

| 페이지 | FCP | LCP | TBT | CLS | TTI |
|--------|-----|-----|-----|-----|-----|
| `/` | 9.0s | 9.9s | 1,800ms | 0 | 36.8s |
| `/login` | 0.9s | 2.0s | 1,850ms | 0 | 33.6s |
| `/trip/list` | 9.0s | 16.0s | 950ms | 0 | 42.5s |
| `/community` | 8.9s | 9.8s | 1,680ms | 0 | 35.3s |
| `/registerEmail` | 0.8s | 11.9s | 1,610ms | 0 | 35.9s |

> CLS 0 — 레이아웃 시프트 없음 ✅

---

## 공통 이슈 (전 페이지)

### Accessibility
- **document-title**: `<title>` 태그 없음 (모든 페이지)
- **color-contrast**: 배경/전경색 대비 부족
- **landmark-one-main**: `<main>` landmark 없음
- **meta-description**: SEO 메타 설명 없음

### Performance (dev 모드 영향 큼)
- **bootup-time**: JavaScript 실행 시간 과다
- **mainthread-work-breakdown**: 메인 스레드 작업 과다
- **errors-in-console**: 콘솔 오류 발생

---

## 페이지별 추가 이슈

| 페이지 | 주요 추가 이슈 |
|--------|--------------|
| `/` | `button-name`, `image-size-responsive` |
| `/login` | `render-blocking-insight` |
| `/trip/list` | `image-delivery-insight`, `lcp-discovery-insight` |
| `/community` | `button-name`(74점 원인), `link-name`, `image-size-responsive` |
| `/registerEmail` | `button-name`, `heading-order`, `unused-javascript` |

---

## 분석

### Performance 낮은 이유
- home/trip-list/community FCP 9초: 데이터 페칭이 client-side라 hydration 이후 렌더링 (Server Component 프리페치 적용됐으나 dev 환경 제약)
- login/registerEmail FCP < 1초: 정적 폼 구성이라 빠름
- TBT 전반 높음: dev 모드 Next.js 특성 (production에서 크게 개선 예상)

### Accessibility 우선순위
1. `<title>` 태그 추가 — 전 페이지 (Quick win, SEO도 개선)
2. `<main>` landmark 추가 — 전 페이지
3. `button-name` — 아이콘 버튼 `aria-label` 누락
4. `color-contrast` — 텍스트 색상 수정 필요
5. `link-name` — community 페이지 링크

---

## 다음 측정 계획

- [ ] Production build 후 재측정 (`yarn build && yarn start`)
- [ ] accessibility 이슈 수정 후 재측정
- [ ] NFC 정규화 + 디바운싱 적용 후 TBT 재측정
