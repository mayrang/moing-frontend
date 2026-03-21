# Phase 3: features 레이어 구축

> 이 문서는 블로그/이력서 작성 재료입니다. 기술적 판단 근거와 트러블슈팅 과정을 상세히 기록합니다.

## 1. 배경 및 문제 정의

Phase 2 완료 시점의 구조는 entities/shared 레이어가 정립됐지만 비즈니스 로직은 여전히 FSD 외부에 흩어져 있었다.

```
Before:
src/hooks/    ← FSD 외부 (25개 파일 — React Query 훅, 유틸리티 훅 혼재)
src/components/ ← FSD 외부 (118개 파일 — 도메인 컴포넌트, 아이콘, 레이아웃 혼재)
src/features/   ← 비어있음 (.gitkeep)
```

**문제점:**
- `hooks/`에 도메인 훅(useAuth, useCommunity 등)과 범용 유틸리티(useInfiniteScroll, useViewTransition 등)가 같은 레벨에 혼재
- `components/`에 feature 단위 컴포넌트와 디자인 시스템, 아이콘이 모두 섞임
- FSD에서 features 레이어가 비어있어 "사용자 시나리오 단위 기능"이 어디 있는지 불분명

---

## 2. 선택지와 의사결정

### 진행 방식: Option A vs Option B

| 옵션 | 설명 | 장점 | 단점 | 선택 |
|------|------|------|------|------|
| **Option A** | 전체 이전 후 테스트 추가 | 빠름, Phase 2와 동일 패턴 | 이전과 테스트 작업이 분리되어 검증 시점 지연 | ❌ |
| **Option B** | feature별 완성 (이전 → 테스트 → E2E) | 각 feature가 즉시 검증됨, 문제 조기 발견 | 속도 느림 | ✅ |

**결정 근거**: Phase 3부터 TDD를 본격 적용하고 E2E까지 포함하므로, 전체를 한 번에 이전하면 테스트가 통과하는지 확인하는 시점이 너무 뒤로 밀린다. feature 하나씩 완전히 완성하는 것이 품질 관리 면에서 유리하다.

### E2E 테스트 전략

처음에는 각 feature마다 Playwright E2E 테스트를 즉시 실행하려 했으나, E2E는 실제 브라우저 + dev server가 필요하다는 사실을 확인했다. Phase 3 시점에는 pages/widgets 레이어가 미완성이라 실제 사용자 플로우를 완전히 검증하기 어렵다.

**결정**: E2E는 `test.describe.skip`으로 드래프트 상태로 작성만 해두고, Phase 4(pages/widgets) 완료 후 실제 실행.

| 테스트 종류 | Phase 3 | Phase 4 이후 |
|------------|---------|-------------|
| Vitest 단위/통합 | ✅ 실행 | 유지 |
| Playwright E2E | 드래프트만 작성 | ✅ 실제 실행 |

### shared/hooks 분리 기준

FSD에서 `shared` 레이어는 어느 레이어에도 의존하지 않는 범용 코드만 포함한다. 기존 `hooks/`에서 다음 기준으로 분리했다:

| 기준 | shared/hooks | features/{name}/hooks |
|------|-------------|----------------------|
| 도메인 로직 | 없음 | 있음 |
| React Query (useQuery/useMutation) | 없음 | 있음 |
| Zustand store 의존 | 없음 | 있음 |
| 예시 | useInfiniteScroll, useViewTransition | useAuth, useCommunity |

**예외 — `useHeaderNavigation`**: 앱 전체 라우트 상수 + 7개 feature store에 의존하므로 `shared/hooks`에 적합하지 않다. Phase 4에서 `widgets/` 레이어로 이전 예정. 단, `console.log` 2개는 Phase 3에서 즉시 제거.

---

## 3. 구현 과정

### Step 0: shared/hooks 분리

`hooks/`에서 범용 훅 7개를 `shared/hooks/`로 이전하고 barrel export 생성:

```
src/shared/hooks/
├── useInfiniteScroll.ts    ← 무한 스크롤 유틸리티
├── useKeyboardResizeEffect.ts ← 모바일 키보드 viewport 대응
├── useViewTransition.ts    ← View Transition API 래퍼
├── useInputScroll.ts       ← input/textarea 터치 스크롤
├── useClickTracking.ts     ← 클릭 이벤트 트래킹 (AnalyticsContext)
├── usePageTracking.ts      ← 페이지뷰 트래킹 (AnalyticsContext)
└── index.ts
```

기존 `hooks/` 파일들은 re-export 래퍼로 교체 (하위 호환 유지):

```ts
// hooks/useInfiniteScroll.ts (변경 후)
export { default } from '@/shared/hooks/useInfiniteScroll';
```

### Step 2: features/search 구축

search 관련 파일을 FSD features 레이어로 이전:

```
features/search/
├── hooks/
│   ├── useSearch.ts          ← hooks/search/useSearch.ts 이전
│   └── useRelationKeyword.ts ← hooks/search/useRelationKeyword.ts 이전
├── ui/
│   ├── SearchResultList.tsx  ← components/SearchResultList.tsx 이전
│   ├── RecommendKeyword.tsx  ← components/RecommendKeyword.tsx 이전
│   ├── RelationKeyword.tsx   ← components/relationKeyword/RelationKeyword.tsx 이전
│   └── RelationKeywordList.tsx ← components/relationKeyword/RelationKeywordList.tsx 이전
└── index.ts
```

**console.log 제거 1개:**
- `RelationKeywordList.tsx`: `console.log(data, "관련 키워드.")`

### Step 3: features/trip 구축

trip 관련 파일을 FSD features 레이어로 이전:

```
features/trip/
├── hooks/
│   ├── useCreateTrip.ts      ← hooks/createTrip/useCreateTrip.ts 이전
│   ├── useTripList.ts        ← hooks/useTripList.ts 이전
│   └── useUserInfo.ts        ← hooks/useUserInfo.ts 이전
├── ui/
│   ├── TripCarousel.tsx      ← components/TripCarousel.tsx 이전
│   ├── TripCarouselItem.tsx  ← components/TripCarouselItem.tsx 이전
│   ├── TripInfiniteList.tsx  ← components/triplist/TripInfiniteList.tsx 이전
│   └── PopularPlaceList.tsx  ← components/triplist/PopularPlaceList.tsx 이전
└── index.ts
```

**import 경로 변경:**
- `@/api/trip` → `@/entities/trip`
- `@/model/trip` → `@/entities/trip`
- `@/api/home` → `@/entities/trip` (getUserProfile → getHomeUserProfile)
- `./Spacing` → `@/components/Spacing`
- `@/hooks/useInfiniteScroll` → `@/shared/hooks/useInfiniteScroll`
- `@/hooks/useViewTransition` → `@/shared/hooks/useViewTransition`
- `../icons/FullHeartIcon` → `@/shared/ui/icons/FullHeartIcon`
- `../icons/EmptyHeartIcon` → `@/shared/ui/icons/EmptyHeartIcon`
- `../designSystem/modal/CheckingModal` → `@/shared/ui` (CheckingModal)

**dead import 제거:**
- `useTripList.ts`의 미사용 `import useAuth from "./user/useAuth"` 제거

**console.log 제거 1개 (Step 3 과정에서 발견):**
- `components/HorizonBoxLayout.tsx`: `console.log(tagsCount, "tagsCount")`

### Step 1: features/auth 구축

auth 관련 파일을 FSD features 레이어로 이전:

```
features/auth/
├── hooks/
│   ├── useAuth.ts          ← hooks/user/useAuth.ts 이전
│   └── useVerifyEmail.ts   ← hooks/useVerifyEmail.tsx 이전
├── ui/
│   └── EmailLoginForm.tsx  ← components/login/EmailLoginForm.tsx 이전
└── index.ts
```

**import 경로 변경:**
- `@/api` → `@/shared/api` (FSD 경로)
- `@/model/auth` → `@/entities/user` (FSD 경로)
- `EmailLoginForm` 내 상대 경로 → `@/shared/ui` barrel import

**console.log 제거 5개:**

| 파일 | 제거한 로그 |
|------|------------|
| useAuth.ts | `console.log("login", loginPath)` × 2 |
| useVerifyEmail.ts | `console.log(data, "data")` × 2 + `console.log("offline network")` |

### MSW 설정 (테스트 인프라)

Phase 3부터 React Query 훅 테스트를 위한 MSW(Mock Service Worker) 서버를 도입했다. MSW는 이미 `package.json`에 포함되어 있었으나 설정이 없었다.

```
src/test/msw/
├── server.ts           ← MSW Node 서버 (Vitest용)
└── handlers/
    ├── index.ts
    └── auth.ts         ← /api/login, /api/logout 등 핸들러
```

`src/test/setup.ts`에 서버 생명주기 등록:

```ts
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 4. Before / After 비교

```
Before:
src/
├── hooks/user/useAuth.ts          (FSD 외부)
├── hooks/useVerifyEmail.tsx       (FSD 외부)
├── hooks/useTripList.ts           (FSD 외부)
├── hooks/useUserInfo.ts           (FSD 외부)
├── hooks/createTrip/useCreateTrip.ts (FSD 외부)
├── components/login/EmailLoginForm.tsx  (FSD 외부)
├── components/TripCarousel.tsx    (FSD 외부)
├── components/triplist/TripInfiniteList.tsx (FSD 외부)
└── features/                      (비어있음)

After:
src/
├── hooks/user/useAuth.ts          → re-export 래퍼
├── hooks/useVerifyEmail.tsx       → re-export 래퍼
├── hooks/useTripList.ts           → re-export 래퍼
├── hooks/useUserInfo.ts           → re-export 래퍼
├── hooks/createTrip/useCreateTrip.ts → re-export 래퍼
├── components/TripCarousel.tsx    → re-export 래퍼
├── components/triplist/TripInfiniteList.tsx → re-export 래퍼
├── shared/hooks/                  (7개 범용 훅)
├── features/auth/
│   ├── hooks/{useAuth, useVerifyEmail}.ts
│   ├── ui/EmailLoginForm.tsx
│   └── index.ts
├── features/search/
│   ├── hooks/{useSearch, useRelationKeyword}.ts
│   ├── ui/{SearchResultList, RecommendKeyword, RelationKeyword, RelationKeywordList}.tsx
│   └── index.ts
└── features/trip/
    ├── hooks/{useCreateTrip, useTripList, useUserInfo}.ts
    ├── ui/{TripCarousel, TripCarouselItem, TripInfiniteList, PopularPlaceList}.tsx
    └── index.ts
```

---

## 5. 트러블슈팅

### 문제 1: MSW 핸들러 응답 포맷 불일치

**증상**: `useAuth` 테스트에서 성공 케이스 4개가 `isSuccess`가 `false`인 채로 타임아웃.

**원인**: `handleApiResponse`는 `{ resultType: "SUCCESS", success: {...}, error: null }` 포맷을 요구하는데, MSW 핸들러가 `{ success: {...} }` 포맷으로 응답했다.

```ts
// 잘못된 MSW 응답
return HttpResponse.json({ success: { userId: '1', accessToken: 'test-token' } });

// 올바른 MSW 응답
return HttpResponse.json({
  resultType: 'SUCCESS',
  success: { userId: '1', accessToken: 'test-token' },
  error: null,
});
```

**교훈**: MSW 핸들러를 작성할 때는 반드시 실제 API 응답 포맷(`ApiResponse<T>` 인터페이스)을 참조해야 한다.

### 문제 2: E2E 테스트 즉시 실행 불가

**증상**: Playwright E2E 테스트를 작성했지만 Phase 3 시점에는 실행 불가.

**원인**: Playwright는 실제 브라우저 + running dev server가 필요한데, Phase 3에서는 pages/widgets 레이어가 미완성이고 실제 UI 플로우가 확정되지 않았다.

**해결**: `test.describe.skip`으로 드래프트 처리하고, Phase 4 이후 selector와 플로우 검증 후 활성화.

---

## 6. 전체 완료 현황

| Step | feature | 상태 | 테스트 | 주요 변경 |
|------|---------|------|--------|-----------|
| Step 0 | shared/hooks | ✅ 완료 | — | 범용 훅 7개 이전 |
| Step 1 | auth | ✅ 완료 | 12개 | console.log 5개 제거 |
| Step 2 | search | ✅ 완료 | 10개 | console.log 1개 제거 |
| Step 3 | trip | ✅ 완료 | 14개 | console.log 1개 제거, dead import 제거 |
| Step 4 | tripDetail | ✅ 완료 | 6개 | console.log 1개 제거 |
| Step 5 | enrollment | ✅ 완료 | 4개 | — |
| Step 6 | bookmark | ✅ 완료 | 6개 | console.log 2개 제거 |
| Step 7 | myTrip | ✅ 완료 | 6개 | — |
| Step 8 | comment | ✅ 완료 | 3개 | dead import 제거 |
| Step 9 | community | ✅ 완료 | 3개 | dead import 2개 제거, MSW 경로 수정 |
| Step 10 | notification | ✅ 완료 | 2개 | dead import 제거 |
| Step 11 | myPage | ✅ 완료 | 3개 | — |
| Step 12 | userProfile | ✅ 완료 | 3개 | — |

### 최종 수치
- **테스트**: 159개 → **231개** (+72개, 49개 테스트 파일)
- **console.log 위반**: 10개 추가 제거 (Phase 3 누계)
- **dead import 제거**: 5건 (useTripList, useComment, useCommunity, useNotification, useEnrollment.test)
- **E2E 드래프트**: 12개 spec 파일 (`test.describe.skip` 상태)
- **MSW 핸들러**: 12개 도메인 핸들러 + server.ts

---

## 7. 트러블슈팅 추가

### 문제 3: `act` import 출처 혼동

**증상**: `useUpdateBookmark.test.ts`와 `useEnrollment.test.ts`에서 `act is not a function` 런타임 에러 또는 TypeScript 에러.

**원인**: `act`를 `vitest`에서 import했으나, `vitest`는 `act`를 export하지 않는다. `act`는 `@testing-library/react`에서 import해야 한다.

```ts
// 잘못된 import
import { describe, it, expect, vi, act } from 'vitest';

// 올바른 import
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
```

**교훈**: Testing Library 관련 유틸리티(`act`, `waitFor`, `renderHook`)는 `@testing-library/react`에서, 테스트 프레임워크 유틸리티(`describe`, `it`, `expect`, `vi`)는 `vitest`에서 import한다.

### 문제 4: MSW 핸들러 경로와 실제 API 경로 불일치

**증상**: community 테스트 실행 시 `GET /api/community/posts/1` 및 `GET /api/community/1/images` 경로에 대한 MSW 경고.

**원인**: 초기 community MSW 핸들러를 `/api/travel/community`, `/api/community/:communityNumber` 경로로 작성했으나, 실제 `entities/community/api.ts`는 `/api/community/posts`, `/api/community/posts/:communityNumber` 경로를 사용했다.

**해결**: `entities/community/api.ts`를 직접 확인하여 실제 경로 기반으로 핸들러를 재작성. 이미지 핸들러(`/api/community/:communityNumber/images`)도 추가.

**교훈**: MSW 핸들러 작성 시 반드시 `entities/{domain}/api.ts`의 실제 경로를 참조하고, 테스트 실행 시 MSW 경고 메시지를 확인하여 누락된 핸들러를 즉시 보완한다.

---

## 8. 회고 / 배운 점

### 잘 된 점
- **feature별 완성(Option B)** 전략으로 각 기능을 독립적으로 검증하며 진행할 수 있었다. 한 feature에서 발견한 패턴(MSW 응답 포맷, import 경로 규칙)을 다음 feature에 즉시 적용했다.
- **re-export 래퍼** 전략으로 기존 코드를 수정하지 않고 점진적 마이그레이션이 가능했다. 대규모 PR 없이 feature 단위로 병합 가능한 구조가 됐다.
- **dead import 제거** 과정에서 5건의 미사용 import를 발견했다. 테스트를 작성하며 실제로 사용되지 않는 코드를 자연스럽게 찾아낼 수 있었다.
- **console.log 총 10개 추가 제거** — Phase 2에서 9개, Phase 3에서 10개. 리팩토링 과정이 코드 품질 개선의 기회가 됐다.

### 다음에 다르게 할 것
- MSW 핸들러를 feature 이전 전에 먼저 작성하면 테스트 실행 시 경고 없이 진행 가능했을 것이다. 현재는 hook 작성 → 테스트 작성 → MSW 경고 확인 → 핸들러 수정 순서였다.
- E2E 드래프트 selector가 실제 구현과 맞지 않을 수 있다. Phase 4에서 pages/widgets 구현 시 드래프트를 함께 검토해야 한다.

### 인사이트
- FSD의 핵심 가치는 "어디를 수정해야 하는지 명확하다"는 것이다. 이전에는 `hooks/`와 `components/`를 동시에 뒤져야 했지만, 이제는 `features/community/`만 열면 community 관련 모든 로직이 있다.
- 하위 호환 re-export는 기술 부채처럼 보이지만, 점진적 마이그레이션에서 필수적인 안전망이다. Phase 4 완료 후 re-export 래퍼를 일괄 제거하는 것이 더 안전한 순서다.
