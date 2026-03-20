# Phase 0: 기반 구축

> 이 문서는 블로그/이력서 작성 재료입니다. 기술적 판단 근거와 트러블슈팅 과정을 상세히 기록합니다.

## 1. 배경 및 문제 정의

### 왜 이 작업이 필요했는가
MOING은 React 프로젝트를 Next.js로 긴급 마이그레이션한 서비스로, 대규모 리팩토링을 앞두고 있었다.
리팩토링 전 다음 기반 환경이 전혀 갖춰지지 않은 상태였다.

- **테스트**: 448개 파일, ~40,460줄의 코드에 테스트 코드 0개
- **스타일링**: Emotion(CSS-in-JS)은 Next.js App Router의 Server Component와 구조적으로 호환되지 않음
- **폴더 구조**: 도메인 분리 구조로 FSD 이전을 위한 목표 구조 부재

### 문제로 인한 실제 영향
- 테스트 없이 리팩토링 시 회귀 버그를 감지할 수 없음
- Emotion이 모든 컴포넌트를 강제로 Client Component화 → SSR 이점 포기
- 구조적 목표 없이 파일 이동 시 혼란 야기

---

## 2. 선택지와 의사결정

### 테스트 프레임워크

| 옵션 | 장점 | 단점 | 선택 여부 |
|------|------|------|-----------|
| Jest | 생태계 성숙, 레퍼런스 많음 | Next.js 환경 설정 복잡, 느림 | ❌ |
| Vitest | Vite 기반으로 빠름, ESM 네이티브, Jest 호환 API | 상대적으로 레퍼런스 적음 | ✅ |

**결정**: Vitest 선택. Next.js 14 + App Router 환경에서 Vite 기반이 설정이 간결하고, Jest 호환 API 덕분에 러닝커브가 낮다.

### DOM 환경

| 옵션 | 장점 | 단점 | 선택 여부 |
|------|------|------|-----------|
| jsdom | 가장 널리 사용됨, 풍부한 Web API 구현 | v29에서 Node 20.11.0과 ESM 충돌 | ❌ |
| happy-dom | 가볍고 빠름, ESM 친화적 | jsdom보다 Web API 커버리지 낮음 | ✅ |

**결정**: happy-dom 선택. jsdom v29가 `@exodus/bytes` (ESM-only)에 의존하면서 Node 20.11.0 환경에서 CJS 충돌 발생. happy-dom이 이 환경에서 안정적으로 동작.

### 스타일링 전환

| 옵션 | 장점 | 단점 | 선택 여부 |
|------|------|------|-----------|
| Emotion 유지 | 기존 코드 변경 없음 | Server Component 사용 불가, 번들에 런타임 CSS 생성 코드 포함 | ❌ |
| Tailwind CSS | Server Component 완벽 호환, 빌드타임 CSS 생성, 번들 사이즈 감소 | 기존 코드 전면 교체 필요 | ✅ |

**결정**: Tailwind CSS v4 선택. "Next.js스럽게" 개편하는 핵심 목표를 위해서는 Server Component 호환이 필수였고, CSS-in-JS 런타임 오버헤드 제거가 성능 최적화에도 직결된다.

---

## 3. 구현 과정

### 핵심 기술적 도전: Node.js 20.11.0 환경 제약

프로젝트 환경이 Node.js 20.11.0으로 고정되어 있어 최신 패키지들과의 호환성 문제가 연쇄적으로 발생했다.

#### 도전 1: vitest@4 실행 불가
vitest v4는 내부적으로 `rolldown`을 사용하는데, rolldown이 Node.js 20.12.0+의 `node:util`의 `styleText` API를 요구한다.

```
SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'
```

**해결**: vitest@3으로 다운그레이드. v3는 rolldown 없이 기존 Vite 번들러를 사용.

#### 도전 2: vitest config 로드 실패 (CJS → ESM 충돌)
vitest v3의 config 로더(`vitest/dist/config.cjs`)가 CJS 방식으로 Vite를 require()하려 하지만, Vite v6+는 순수 ESM 모듈이라 충돌 발생.

```
Error [ERR_REQUIRE_ESM]: require() of ES Module .../vite/dist/node/index.js
from .../vitest/dist/config.cjs not supported.
```

**해결**: `vitest.config.ts` → `vitest.config.mts`로 변경. `.mts` 확장자가 파일을 ESM으로 강제 로딩하여 dynamic import()로 Vite를 불러옴.

#### 도전 3: jsdom v29 ESM 의존성 충돌
jsdom v29가 의존하는 `html-encoding-sniffer`가 `@exodus/bytes`(ESM-only)를 CJS 방식으로 require()하면서 충돌.

```
Error [ERR_REQUIRE_ESM]: require() of ES Module .../encoding-lite.js
from .../html-encoding-sniffer/lib/html-encoding-sniffer.js not supported.
```

**해결**: jsdom 대신 `happy-dom` 사용. ESM 친화적이며 React Testing Library와 완벽 호환.

### Tailwind CSS v4 설정 변경점

Tailwind v4는 v3과 설정 방식이 크게 다르다.

```js
// v3 방식 (postcss.config.js)
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }

// v4 방식
module.exports = { plugins: { '@tailwindcss/postcss': {} } }
```

```css
/* v3 방식 (globals.css) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 방식 */
@import "tailwindcss";

@theme {
  --font-pretendard: "Pretendard", sans-serif;
}
```

v4에서는 `tailwind.config.ts`가 불필요하며, 테마 설정을 CSS의 `@theme` 블록에서 관리한다.

---

## 4. Before / After 비교

### 환경 변화
| 항목 | Before | After |
|------|--------|-------|
| 테스트 환경 | 없음 | Vitest v3 + happy-dom |
| E2E 환경 | 없음 | Playwright v1.58 |
| 스타일링 | Emotion (런타임) | Tailwind v4 (빌드타임) + Emotion 공존 |
| 폴더 구조 목표 | 없음 | FSD 스캐폴딩 완료 |
| 테스트 명령어 | 없음 | `yarn test`, `yarn test:run`, `yarn test:e2e` |

---

## 5. 트러블슈팅

### 문제 1: rolldown의 Node.js 버전 요구
- **현상**: `vitest@4` 설치 후 `yarn test:run` 실행 시 `styleText` import 오류
- **원인**: vitest v4가 의존하는 rolldown 번들러가 Node 20.12.0+ 전용 API 사용
- **해결**: `vitest@3`으로 다운그레이드. v3은 rolldown 없이 Rollup 기반으로 동작

### 문제 2: ESM/CJS 충돌 연쇄
- **현상**: vitest config 로드 실패 → jsdom 환경 실행 실패 두 번의 ESM/CJS 충돌
- **원인**: Node.js 생태계가 ESM으로 전환 중인 과도기. CJS 모듈이 ESM-only 모듈을 require()하면서 충돌
- **해결**: 설정 파일 `.mts` 변환 + jsdom → happy-dom 교체로 ESM 충돌 우회
- **인사이트**: 최신 패키지일수록 ESM-only 경향. Node.js LTS 버전 관리의 중요성 체감

### 문제 3: yarn + npm lock 파일 공존 경고
- **현상**: `package-lock.json`이 존재해 yarn 사용 시 경고 발생
- **원인**: 기존에 npm으로 설치된 흔적
- **현황**: 기능적 문제 없음. Phase 0 범위 외로 판단, 추후 정리 예정

---

## 6. 결과 및 수치

- 신규 설치 패키지: 10개 (vitest, playwright, tailwind 관련)
- 신규 설정 파일: 5개 (vitest.config.mts, playwright.config.ts, postcss.config.js, tailwind.config.ts, src/test/setup.ts)
- FSD 디렉토리: 10개 신규 생성
- 문서: CLAUDE.md + docs/ 구조 전체

---

## 7. 회고 / 배운 점

### 잘 된 것
- 기존 코드를 전혀 건드리지 않고 기반 환경 구축 완료
- Emotion과 Tailwind 공존 전략으로 점진적 마이그레이션 기반 마련

### 다음에 다르게 할 것
- 프로젝트 시작 시 Node.js 버전을 `.nvmrc`로 고정해두면 이런 충돌을 방지할 수 있음
- `package-lock.json` 제거 후 yarn으로 통일하는 작업을 초기에 처리

### 핵심 인사이트
> Node.js 생태계의 CJS → ESM 전환 과도기에서 패키지 버전 간 충돌은 흔하다.
> 최신 패키지가 항상 좋은 것은 아니며, 환경 제약에 맞는 버전 선택이 중요하다.
> vitest config 파일의 `.mts` 확장자 트릭처럼, 작은 설정 변경이 큰 문제를 해결하기도 한다.
