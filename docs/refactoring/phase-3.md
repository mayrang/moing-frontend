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
├── components/login/EmailLoginForm.tsx  (FSD 외부)
└── features/                      (비어있음)

After:
src/
├── hooks/user/useAuth.ts          → re-export 래퍼
├── hooks/useVerifyEmail.tsx       → re-export 래퍼
├── components/login/EmailLoginForm.tsx → re-export 래퍼
├── shared/hooks/                  (7개 범용 훅)
└── features/auth/
    ├── hooks/useAuth.ts
    ├── hooks/useVerifyEmail.ts
    ├── ui/EmailLoginForm.tsx
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

## 6. 진행 중인 작업 (업데이트 예정)

| Step | feature | 상태 | 테스트 |
|------|---------|------|--------|
| Step 0 | shared/hooks | ✅ 완료 | — |
| Step 1 | auth | ✅ 완료 | 12개 |
| Step 2 | search | 🔜 | — |
| Step 3 | trip | 🔜 | — |
| Step 4 | tripDetail | 🔜 | — |
| Step 5 | enrollment | 🔜 | — |
| Step 6 | bookmark | 🔜 | — |
| Step 7 | myTrip | 🔜 | — |
| Step 8 | comment | 🔜 | — |
| Step 9 | community | 🔜 | — |
| Step 10 | notification | 🔜 | — |
| Step 11 | myPage | 🔜 | — |
| Step 12 | userProfile | 🔜 | — |

---

## 7. 회고 / 배운 점 (완료 후 추가 예정)

_Phase 3 전체 완료 후 작성_
