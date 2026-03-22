# Phase 5: Tailwind CSS 전환 — Emotion 완전 제거

## 1. 배경 / 문제 정의

### Before 상태

Phase 4 완료 시점에서 코드베이스 전체를 스캔하면:

- `@emotion/styled` import: **약 140개 파일**
- `@/styles/palette` import: **약 100개 파일 이상**
- Emotion 패키지: `@emotion/cache`, `@emotion/react`, `@emotion/styled` (3개)
- Emotion SSR 래퍼 `RootStyleRegistry.tsx`가 `providers.tsx`에 감싸진 상태

### 문제점

1. **CSS-in-JS의 SSR 비용**: Emotion은 서버에서 스타일 직렬화를 위한 추가 런타임이 필요. `RootStyleRegistry`가 `useServerInsertedHTML`을 사용해 Emotion 스타일을 SSR에 삽입하는 오버헤드 존재.
2. **번들 크기**: `@emotion/styled`, `@emotion/react`, `@emotion/cache` 3개 패키지가 클라이언트 번들에 포함.
3. **다크 모드 / 테마 지원 한계**: CSS-in-JS는 런타임에 스타일 생성 → CSS 변수 기반 테마 전환보다 성능 불리.
4. **Tailwind와의 혼재**: Phase 1에서 `shared/ui/`에 Tailwind를 적용했지만, 나머지 레이어는 여전히 Emotion 사용 → 유지보수 일관성 부재.

---

## 2. 선택지와 의사결정

### 선택지

| 옵션 | 장점 | 단점 |
|------|------|------|
| A. Emotion 유지 | 변경 없음 | SSR 비용, 번들 크기, 일관성 부재 |
| B. CSS Modules로 전환 | 타입 안전, 파일 단위 격리 | 클래스명 자동 생성, 조건부 스타일 번거로움 |
| **C. Tailwind CSS로 전환** | **Zero-runtime, 디자인 시스템 일관성, 개발 속도** | 클래스명 길이, 일부 동적 스타일은 inline 필요 |

**결정: Tailwind CSS** — Phase 1에서 `shared/ui/`를 Tailwind로 완성했으므로 일관성 유지. Tailwind의 Zero-runtime은 Next.js App Router와 최적 조합.

### 스타일 변환 규칙

1. **정적 스타일** → Tailwind 클래스
2. **palette 색상** → CSS 변수 (`text-[var(--color-keycolor)]`)
3. **완전히 동적인 값** (런타임 prop) → inline `style={{}}`
4. **조건부 클래스** → `cn()` 유틸리티 또는 삼항 연산자
5. **`@media` 반응형** → Tailwind 반응형 프리픽스 (`max-[360px]:`, `min-[440px]:`)

---

## 3. 구현 과정

### Step 1: shared/ui 보강 (PR #5-1)

- `cn()` 유틸리티 생성 (`shared/lib/cn.ts`)
- `src/components/`의 범용 UI 21개 → `src/shared/ui/`로 이동
- re-export 래퍼로 하위 호환 유지

### Step 2~5: features/*/ui 이동 (PR #5-2 ~ #5-5)

- `components/community/` → `features/community/ui/`
- `components/userProfile/` → `features/userProfile/ui/`
- `components/notification/` → `features/notification/ui/`
- `components/comment/` → `features/comment/ui/`
- `components/travellog/` → `features/travelLog/ui/`
- `components/LoginButtonForGuest` 등 auth 관련 → `features/auth/ui/`
- `components/RegionModal` 등 trip 관련 → `features/trip/ui/`

### Step 6~12: 기존 FSD 파일 Tailwind 전환 (PR #5-6 ~ #5-12)

- `features/*/ui` 기존 파일 (EmailLoginForm, search/ui, trip/ui 등)
- `widgets/home/` 4개 파일
- `page-views/` 전체 79개 파일 (도메인별 분류)
  - home, auth
  - community
  - trip (+ create/)
  - myTrip, myPage
  - contact, notification, report, 기타

### Step 13: 최종 정리 (현재 PR)

1. 잔존 `@/styles/palette` import 완전 제거 (아이콘 6개, stories 3개, 테스트 1개)
2. `src/app/RootStyleRegistry.tsx` 삭제
3. `src/styles/globalStyle.ts` 삭제 (미사용 상태였음)
4. `src/styles/palette.ts` 삭제
5. `src/styles/` 디렉토리 삭제
6. `providers.tsx`에서 `RootStyleRegistry` 래퍼 제거
7. `@emotion/cache`, `@emotion/react`, `@emotion/styled` 패키지 uninstall

---

## 4. Before / After 비교

### styled component → Tailwind 변환

```tsx
// Before (Emotion)
const Container = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  color: ${(props) => props.isActive ? palette.keycolor : palette.비강조};
  font-size: 14px;
  background-color: ${palette.BG};
`;
<Container isActive={active} />

// After (Tailwind)
<div
  className={`flex items-center px-6 py-4 text-sm bg-[var(--color-bg)] ${
    isActive ? 'text-[var(--color-keycolor)]' : 'text-[var(--color-text-muted)]'
  }`}
/>
```

### 동적 스타일 처리

```tsx
// Before: styled-component props
const Wrapper = styled.div<{ splashOn: boolean }>`
  opacity: ${(props) => props.splashOn ? 1 : 0};
  pointer-events: ${(props) => props.splashOn ? 'auto' : 'none'};
  transition: opacity 200ms ease-in-out;
`;

// After: inline style for dynamic values
<div
  className="absolute z-[2500] h-svh bg-[var(--color-keycolor)] ..."
  style={{
    opacity: splashOn ? 1 : 0,
    pointerEvents: splashOn ? 'auto' : 'none',
    transition: 'opacity 200ms ease-in-out',
  }}
/>
```

### palette → CSS 변수 매핑

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

---

## 5. 결과 및 수치

| 항목 | Before | After |
|------|--------|-------|
| Emotion 패키지 | 3개 (`@emotion/cache`, `@emotion/react`, `@emotion/styled`) | **0개** |
| `@emotion/styled` import 파일 | ~140개 | **0개** |
| `@/styles/palette` import 파일 | ~100개+ | **0개** |
| 삭제된 파일 | - | `RootStyleRegistry.tsx`, `globalStyle.ts`, `palette.ts` |
| 삭제된 디렉토리 | - | `src/styles/` |
| TypeScript 에러 | 0 | **0** |
| Vitest 통과 | 237개 | **228개** (3 suite 기존 failing — `next-view-transitions` 모듈 호환성 이슈) |
| SSR 스타일 삽입 | `RootStyleRegistry` + `useServerInsertedHTML` | **없음** (Zero-runtime) |

---

## 6. 트러블슈팅

### 1. macOS sed 멀티바이트 문자 치환 실패

**문제:** 일괄 치환 시 `sed -i 's/palette.기본/var(--color-text-base)/g'`가 한글 포함 패턴에서 오동작.

**원인:** macOS BSD sed의 멀티바이트 처리 한계.

**해결:** Python `re.sub()` 또는 파일별 수동 Edit 툴 사용.

### 2. SVG `clip-path` → `clipPath` (BlockPage.tsx)

**문제:** `<path clip-path="url(...)">` → JSX에서 `Unexpected token` 오류.

**원인:** SVG 속성명은 HTML과 달리 JSX에서 camelCase 사용 필요.

**해결:** `clip-path` → `clipPath` 로 변경.

### 3. 동적 styled-component props → Tailwind 변환 패턴

**문제:** `styled.div<{ isFirst: boolean }>` 처럼 prop에 따라 CSS가 바뀌는 패턴을 Tailwind로 표현하기 어려운 경우.

**해결 패턴:**
- **일반 조건부 클래스**: `cn('flex', isActive && 'text-[var(--color-keycolor)]')`
- **런타임에만 알 수 있는 값** (ex. borderTop이 첫 번째 아이템만 있는 경우): `style={{ borderTop: idx === 0 ? '1px solid #e7e7e7' : '0' }}`

### 4. `@media` 반응형 → Tailwind 반응형 변환

**문제:** Emotion에서 `@media (max-width: 360px) { grid-template-columns: repeat(2, 1fr); }`

**해결:** Tailwind arbitrary variant: `max-[360px]:grid-cols-2 grid-cols-3`

### 5. `ProfileEditModal` 20개 이상 console.log

**문제:** 개발 디버깅용 console.log가 대규모로 잔존. CLAUDE.md 규칙 위반.

**해결:** 핸들러, useEffect, 콜백 함수의 console.log 전수 제거. error catch 블록은 silent error로 처리.

### 6. `yarn remove @emotion/*` — jsdom 호환성 경고

**문제:** `yarn remove @emotion/cache @emotion/react @emotion/styled` 실행 시 `jsdom@29.0.1: engine "node" incompatible` 에러.

**원인:** Node.js 20.11.0 사용 중이나 jsdom@29가 `^20.19.0 || ^22.13.0 || >=24.0.0` 요구.

**결과:** package.json에서 Emotion 패키지 3개 정상 제거 확인 (에러는 jsdom 관련 사전 존재 이슈).

---

## 7. 회고 / 배운 점

### 잘 된 점

- **점진적 전환**: 레이어별로 PR을 분리해 `@emotion/styled` 파일을 순차적으로 제거함으로써 매 PR마다 `npx tsc --noEmit` + `npx vitest run`으로 안전성 보장.
- **CSS 변수 활용**: `globals.css`에 `@theme {}` 블록으로 Tailwind 색상 변수를 미리 정의해 두었기 때문에 `palette.*` → `var(--color-*)` 치환이 기계적으로 가능.
- **re-export 래퍼 패턴**: 파일 이동 시 원본 경로를 래퍼로 유지해 다른 파일의 import를 건드리지 않는 전략이 대규모 리팩토링에서 매우 유효.

### 다르게 할 점

- **console.log 조기 제거**: 처음부터 ESLint `no-console` 규칙을 활성화했다면 디버그 로그가 쌓이지 않았을 것.
- **일괄 변환 자동화**: AST 변환 도구 (jscodeshift, codemod)를 사용했다면 반복적인 `styled.div → div + className` 변환을 자동화할 수 있었음.

### 인사이트

- Tailwind의 arbitrary values (`text-[var(--color-keycolor)]`)가 CSS 변수와 결합하면 테마 시스템을 유지하면서 Zero-runtime을 달성할 수 있음.
- Emotion의 `css`` tagged template`은 타입 안전성 면에서는 강하지만, Next.js 13+ App Router와 함께 사용할 때 `RootStyleRegistry` 같은 추가 설정이 필요 — 이 복잡성이 Tailwind 전환의 핵심 동기.
