# ADR 001: Emotion → Tailwind CSS 전환

## 상태
✅ **완료** (결정: 2026-03-20 / 마이그레이션 완료: 2026-03-22)

## 배경
기존 프로젝트는 Emotion (CSS-in-JS)을 사용 중이었다.
Next.js App Router 환경에서 Emotion은 런타임에 CSS를 생성하기 때문에
Server Component와 호환되지 않아 모든 컴포넌트가 Client Component로 강제된다.

## 결정
Emotion을 Tailwind CSS로 전환한다.

## 근거
- Tailwind는 빌드타임에 CSS를 생성 → Server Component와 완벽 호환
- 번들 사이즈 감소 (런타임 CSS 생성 제거)
- Next.js 공식 권장 스타일링 방식 중 하나
- 하이브리드 Server Component 전략(Option B) 실현을 위한 필수 조건

## 마이그레이션 전략
- Emotion과 Tailwind 설치 공존 (Phase 0)
- Phase 1부터 신규 코드는 Tailwind만 사용
- 기존 컴포넌트는 FSD 이전 시 Tailwind로 교체
- Emotion 신규 작성 금지

## 구현 완료 현황 (Phase 5)

### 전환 규칙 (확정)

| 케이스 | 전환 방법 |
|--------|----------|
| 정적 스타일 | Tailwind 클래스 |
| `palette.*` 색상 | CSS 변수 `var(--color-*)` |
| 동적 prop 값 | inline `style={{}}` |
| 조건부 클래스 | `cn()` 또는 삼항 연산자 |
| `@media` 반응형 | Tailwind arbitrary variant (`max-[360px]:`) |

### palette → CSS 변수 매핑 (확정)

| palette 키 | CSS 변수 |
|-----------|---------|
| `palette.기본` | `var(--color-text-base)` |
| `palette.비강조` | `var(--color-text-muted)` |
| `palette.비강조2` | `var(--color-text-muted2)` |
| `palette.비강조3` | `var(--color-muted3)` |
| `palette.비강조4` | `var(--color-muted4)` |
| `palette.비강조5` | `var(--color-muted5)` |
| `palette.keycolor` | `var(--color-keycolor)` |
| `palette.keycolorBG` | `var(--color-keycolor-bg)` |
| `palette.BG` | `var(--color-bg)` |
| `palette.검색창` | `var(--color-search-bg)` |
| `palette.like` | `var(--color-like)` |
| `palette.errorBorder` | `var(--color-error-border)` |
| `palette.errorVariant` | `var(--color-error-variant)` |
| `palette.buttonActive` | `var(--color-button-active)` |

### 결과
- `@emotion/styled` → 0개 파일 (전체 ~140개 파일 전환 완료)
- `@emotion/cache`, `@emotion/react`, `@emotion/styled` 패키지 제거 완료
- `src/styles/` 디렉토리 삭제 (`palette.ts`, `globalStyle.ts` 포함)
- `RootStyleRegistry.tsx` 삭제 — Emotion SSR 래퍼 제거

## 영향
- ~~모든 styled-component 패턴 제거 필요~~ → 완료
- ~~className 기반 스타일링으로 전환~~ → 완료
