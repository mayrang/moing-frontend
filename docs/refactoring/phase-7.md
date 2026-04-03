# Phase 7: 프로덕션 안정화 — Route Handler 데모 환경 + 에러 핸들링 완성

> **시작일**: 2026-03-31
> **브랜치**: `feat/phase-7-demo-production`
> **목표**: 백엔드 없이 Vercel에서 완전 동작하는 데모 환경 구축 + 프로덕션 에러 관측 체계 완성

---

## 1. 배경 / 문제 정의

Phase 6까지 FSD 구조 전환 + Tailwind 이전 + Auth UX 개선 + 접근성 100점을 달성했지만, **실제 배포 환경**에서 두 가지 근본 문제가 남아 있었다.

### 문제 1: 백엔드 서버 의존

프로덕션 배포(`release-back.vercel.app`)가 외부 Spring Boot 서버(`125.242.221.180`)에 의존하고 있었다. 팀원 없이 백엔드 서버가 내려가면 **면접관이 포트폴리오를 체험할 수 없는 상태**였다.

```
사용자 요청
  → Next.js Vercel
  → axiosInstance.baseURL = "http://125.242.221.180"
  → 서버 다운 → ECONNREFUSED / 502
```

Phase 6에서 MSW Express 서버로 E2E 테스트는 해결했지만, **프로덕션 트래픽**은 여전히 외부 백엔드로 향했다.

### 문제 2: 에러가 보이지 않음

개발 중 발생한 모든 에러는 `console.error`로 찍히거나 무시됐다. Phase 6에서 `createMutationOptions` + `ErrorPolicy` 라이브러리를 구축했지만, 실제 **Sentry 연동이 없어** 프로덕션 에러를 감지하고 재현할 방법이 없었다.

---

## 2. 선택지와 의사결정

### 결정 1: Next.js Route Handler로 백엔드 전체 대체

| 옵션 | 설명 | 결정 |
|------|------|------|
| 외부 백엔드 유지 | 팀원 없어 서버 보장 불가 | ❌ |
| Vercel Serverless Functions (별도) | 코드 분리 필요, 관리 복잡 | ❌ |
| **Next.js Route Handler** | App Router 내장, 동일 레포, 배포 자동화 | ✅ |
| Mock 서비스 (Mockoon 등) | 외부 의존 추가, 상태 관리 불가 | ❌ |

Route Handler를 선택한 핵심 이유:
- **같은 Vercel 인스턴스** 안에서 실행 → 네트워크 레이턴시 0
- Phase 6에서 구축한 **MSW Stateful 서버(`src/mocks/db/store.ts`)를 그대로 재활용** 가능
- `axiosInstance.baseURL`만 바꾸면 클라이언트 코드 무수정

### 결정 2: 데모 모드 — 인증 검사 우회

실제 이메일 인증, SMS 코드 검증 등은 프로덕션에서 외부 서비스(이메일 발송 서버 등)가 필요하다. 포트폴리오 데모 목적에선 이 흐름이 오히려 장벽이 된다.

**데모 모드 정책:**
- 로그인: 존재하지 않는 이메일이면 자동 계정 생성 후 통과
- 이메일 인증 코드: 아무 숫자나 입력해도 통과 (발송 시 `111111` 고정)
- 비밀번호 확인: 항상 통과

실제 서비스라면 절대 허용할 수 없지만, 데모 전용 환경임을 코드 주석으로 명시했다.

### 결정 3: Adapter 패턴 Logger — 환경별 구현 교체

에러 로깅 구현을 직접 `Sentry.captureException()`으로 코드 전체에 뿌리면:
- 테스트 환경에서 Sentry SDK 로드 → 속도 저하
- 개발 환경에서 Sentry로 노이즈 발생
- 추후 Sentry → Datadog 등 교체 시 전수 수정 필요

**Adapter 패턴으로 해결:**

```
ILogger (interface)
  ├── ConsoleLogger  (개발 환경)
  ├── SentryLogger   (프로덕션)
  └── NoopLogger     (테스트)
```

환경별 구현 선택은 모듈 초기화 시점에 단 한 번 이루어지고, 호출부는 `logger.error(...)` 하나만 안다.

---

## 3. 구현 과정

### 3-1. Route Handler 66개 구축

**구조:**
```
src/app/api/
├── _lib/
│   ├── helpers.ts       # getSession, requireAuth, nextResponse 헬퍼
│   └── formatTrip.ts    # 여행 엔티티 → 응답 포맷 변환
├── login/route.ts
├── logout/route.ts
├── social/
│   ├── login/route.ts
│   ├── google/complete-signup/route.ts
│   └── kakao/complete-signup/route.ts
├── token/refresh/route.ts
├── users/
│   ├── sign-up/route.ts
│   └── [userId]/
│       ├── created-travels/route.ts
│       └── applied-travels/route.ts
├── travel/
│   ├── route.ts           # 목록 조회, 생성
│   └── [travelNumber]/    # 상세, 수정, 삭제
├── community/
│   └── posts/
│       └── [communityNumber]/  # CRUD + 좋아요 + 댓글
├── profile/
│   └── image/             # GET/PUT/DELETE (프로필 이미지)
... (총 66개 route.ts)
```

MSW Stateful 서버(`src/mocks/db/store.ts`)의 in-memory store를 그대로 재사용해 **요청 간 상태가 유지**된다 (Vercel Serverless 재시작 전까지).

**헬퍼 함수 설계:**
```ts
// src/app/api/_lib/helpers.ts
export function requireAuth(req: NextRequest): { userId: number } | NextResponse {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const session = store.sessions.find(s => s.token === token);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return { userId: session.userId };
}
```

모든 인증 필요 Route Handler에서 `requireAuth(req)` 한 줄로 가드.

### 3-2. Logger 어댑터 시스템

**인터페이스 정의 (`src/shared/lib/logger/types.ts`):**
```ts
export interface ILogger {
  error(message: string, error?: unknown, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  breadcrumb(message: string, data?: Record<string, unknown>): void;
  setUser(user: { id: number | string; email?: string } | null): void;
}
```

**환경별 선택 (`src/shared/lib/logger/index.ts`):**
```ts
import { ConsoleLogger } from './adapters/ConsoleLogger';
import { SentryLogger } from './adapters/SentryLogger';
import { NoopLogger } from './adapters/NoopLogger';

function createLogger(): ILogger {
  if (process.env.NODE_ENV === 'test') return new NoopLogger();
  if (process.env.NODE_ENV === 'production') return new SentryLogger();
  return new ConsoleLogger();
}

export const logger: ILogger = createLogger();
```

**SentryLogger의 에러 재현 컨텍스트:**

Sentry SDK가 자동 수집하지 않는 정보를 직접 추가했다:

| 항목 | Sentry 자동 수집 | 직접 추가 이유 |
|------|:---:|------|
| URL, method, HTTP status | ❌ | AxiosError `config` 파싱 → 어떤 API에서 터졌는지 특정 |
| http.status, api.url 태그 | ❌ | Sentry 이슈 필터/검색 용이 |
| 네트워크 타입 (4G/WiFi) | ❌ | 모바일 환경 재현 (네트워크 이슈인지 구분) |
| 화면 해상도 | ❌ | 레이아웃 이슈 재현 |
| hardwareConcurrency | ❌ | 성능 이슈 연관성 파악 |
| 유저 ID | ❌ | `logger.setUser()` 로그인/로그아웃 시점에 설정 |

```ts
// beforeSend: 민감 엔드포인트 이벤트 차단
beforeSend(event) {
  const url = event.request?.url ?? '';
  if (url.includes('/api/login') || url.includes('/api/token')) return null;
  return event;
}
```

### 3-3. createMutationOptions 전 기능 적용

Phase 6에서 `ErrorPolicy` 라이브러리를 만들었지만, 실제 feature hook에는 적용이 안 된 상태였다. 7개 hook에 일괄 적용:

| Hook | Policy | 특이사항 |
|------|--------|---------|
| `useUpdateBookmark` | `{ network: 'toast', system: 'toast' }` | `invalidateAll` 헬퍼 추출 |
| `useMyApplyTrip` | `{ network: 'toast', system: 'toast' }` | |
| `useMyRequestedTrip` | `{ network: 'toast', system: 'toast' }` | |
| `useCreateTrip` | `{ network: 'retry', system: 'toast' }` | 중요 작업이므로 자동 재시도 |
| `useComment` | `{ network: 'toast', system: 'toast' }` | 5개 mutation |
| `useCommunity` | `{ network: 'toast', system: 'toast' }` | 7개 mutation |
| `useMyPage` | `{ network: 'toast', system: 'fallback' }` | `withdrawMutation`은 fallback |

**적용 패턴 (spread로 기존 `onSuccess` 보존):**
```ts
// Before
const mutation = useMutation({
  mutationFn: async (data) => { ... },
  onSuccess: (data) => { ... },
});

// After
const mutation = useMutation({
  ...createMutationOptions({
    mutationFn: async (data) => { ... },
    policy: { network: 'toast', system: 'toast' },
  }),
  onSuccess: (data) => { ... },  // 기존 콜백 그대로 유지
});
```

### 3-4. 로그인 이벤트에 Sentry 유저 바인딩

에러 발생 시 "어떤 유저에게 터진 건지" 알 수 있도록 로그인/로그아웃 시점에 `setUser` 호출:

```ts
// useAuth.ts
onSuccess: (data) => {
  const userId = Number(data.userId);
  setLoginData({ userId, accessToken: data.accessToken });
  logger.setUser({ id: userId });   // Sentry 유저 바인딩
  router.push(redirectPath);
}

// logout
onSuccess: () => {
  logger.setUser(null);             // Sentry 유저 해제
  clearLoginData();
  ...
}
```

---

## 4. Before / After

### 에러 가시성

**Before:**
```ts
// 어딘가에서 API 에러 발생
// → console.error 로 찍히거나 무시
// → 프로덕션에서 에러 감지 방법 없음
```

**After:**
```ts
// createMutationOptions 내부에서 자동 처리
logger.error('[mutation] network error', error, {
  errorClass: 'network',
  message: 'POST /api/travel',
});

// Sentry 이슈에 기록되는 정보:
// - user: { id: 123 }
// - tags: { "http.status": "503", "api.url": "/api/travel", "http.method": "POST" }
// - context: { networkType: "4g", screenResolution: "390x844", hardwareConcurrency: 6 }
```

### 백엔드 의존성

**Before:**
```
클라이언트 → 외부 서버(125.242.221.180) → 응답
              ↑ 서버 다운 → 전체 앱 불능
```

**After:**
```
클라이언트 → Next.js Route Handler (같은 Vercel) → In-memory Store → 응답
              ↑ 항상 가용, 서버 재시작 전까지 상태 유지
```

### 프로덕션 버그 — authStore persist

**Before:**
```ts
// authStore에 persist 없음
// 새로고침 시 accessToken, userId = null
// → 모든 인증 API 401
```

**After:**
```ts
export const authStore = create(
  persist<AuthStore>(
    (set) => ({ ... }),
    { name: 'auth-storage', storage: createJSONStorage(() => sessionStorage) }
  )
);
// 탭 닫기 전까지 로그인 상태 유지
```

---

## 5. 트러블슈팅

### 트러블 1: Vercel SSR에서 `invalid URL` 에러

**증상:** 서버 컴포넌트에서 `fetch('/api/...')` 호출 시 `TypeError: Invalid URL`.

**원인:** Node.js 환경에서는 상대 경로 URL이 유효하지 않다. 브라우저는 `window.location.origin`을 기준으로 해석하지만, 서버에는 그런 컨텍스트가 없다.

**해결:**
```ts
// axiosInstance.ts
const baseURL = typeof window === 'undefined'
  ? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
  : '';
```

### 트러블 2: Vercel Deployment Protection → 401 루프

**증상:** Vercel Preview URL 접속 시 `/api/*` 요청마다 401 → 토큰 리프레시 시도 → 또 401 → 무한 루프.

**원인:** Vercel의 Preview 브랜치 보호 기능이 Route Handler 요청에도 Vercel 인증을 요구함.

**해결:** 프로덕션 도메인(`moing-frontend.vercel.app`)만 사용하거나, Vercel Dashboard에서 Protection Bypass 설정. 개발 중 `localhost` 환경에서는 `VERCEL_AUTOMATION_BYPASS_SECRET` 헤더 추가.

### 트러블 3: 토큰 리프레시 무한 루프

**증상:** 로그인 실패 시 (`401 Unauthorized`) 401 인터셉터가 발동 → `/api/token/refresh` 호출 → 갱신 실패 → 다시 401 → 무한 루프.

**원인:** axiosInstance 인터셉터에서 `/api/login`, `/api/token/refresh` 등 인증 엔드포인트를 예외 처리하지 않았음.

**해결:**
```ts
// axios interceptor
if (
  error.response?.status === 401 &&
  !originalRequest._retry &&
  !originalRequest.url?.includes('/api/login') &&
  !originalRequest.url?.includes('/api/token')
) {
  originalRequest._retry = true;
  // 리프레시 시도
}
```

### 트러블 4: `/api/users/null/created-travels` 404

**증상:** 마이페이지 접속 시 `GET /api/users/null/created-travels` 404.

**원인:** `MyPage.tsx`에서 `userId`가 아직 `null`인 시점에 `setUserProfileUserId(userId!)` 호출 → store에 `null` 저장 → `userProfileUserId !== -1` 조건 통과 (`null !== -1` = true) → 쿼리 실행.

**해결:**
```ts
// MyPage.tsx
useEffect(() => {
  if (userId) setUserProfileUserId(userId);  // null 가드 추가
}, [userId]);

// useUserProfile.ts
enabled: !!accessToken && !!userProfileUserId && userProfileUserId > 0,
//                         ↑ null 체크        ↑ 양수 체크
```

### 트러블 5: 여행 지역 "다음" 버튼 무반응

**증상:** 여행 생성 시 지역 입력 후 "다음" 버튼을 눌러도 아무 반응 없음.

**원인:** `TripRegion.tsx`의 `handleNext`는 Kakao Maps SDK가 로드된 후(`isLoad=true`)에만 실행된다. 프로덕션에서 Kakao API 키가 없거나 SDK 로드 실패 시 `isLoad`가 영원히 `false`로 남아 버튼이 동작하지 않았다.

**해결:** Kakao Maps SDK 미로드 시 Google Maps로 폴백:
```ts
const handleNext = () => {
  if (!isLoad) {
    // Kakao Maps SDK 미로드 시 Google Maps로 직접 진행
    addLocationName({ locationName: keyword, mapType: 'google', countryName: '' });
    nextFunc();
    return;
  }
  setSubmit(true);
};
```

### 트러블 6: Vitest 테스트 27개 suite 실패 (ESM require 오류)

**증상:** `logger/index.ts`에서 `require()`를 사용한 조건부 import → Vitest ESM 환경에서 `Cannot find module` 에러.

**원인:** `if (process.env.NODE_ENV === 'test') return require('./adapters/NoopLogger')` — ESM 모드에서 `require()`는 동적으로 동작하지 않는다.

**해결:** `static import` + `createLogger()` 팩토리 함수 패턴으로 전환:
```ts
// ❌ ESM에서 동작 안 함
function createLogger() {
  if (env === 'test') return require('./adapters/NoopLogger').NoopLogger;
}

// ✅ static import + 팩토리 선택
import { NoopLogger } from './adapters/NoopLogger';
import { ConsoleLogger } from './adapters/ConsoleLogger';
import { SentryLogger } from './adapters/SentryLogger';

function createLogger(): ILogger {
  if (process.env.NODE_ENV === 'test') return new NoopLogger();
  if (process.env.NODE_ENV === 'production') return new SentryLogger();
  return new ConsoleLogger();
}
```

### 트러블 7: `@sentry/nextjs` 설치 실패

**증상:** `yarn add @sentry/nextjs` → `jsdom ^29` 호환성 에러 (Node 20.11.0).

**해결:** 이미 설치되어 있던 `@sentry/react` v8 유지. `SentryLogger`에서 `import('@sentry/react')` 동적 임포트로 사용.

---

## 6. 결과 및 수치

### Route Handler 커버리지

| 카테고리 | Route Handler 수 |
|---------|:---:|
| 인증 (로그인/회원가입/OAuth/토큰) | 12 |
| 여행 (목록/상세/생성/수정/삭제/신청) | 14 |
| 커뮤니티 (CRUD/좋아요/댓글) | 11 |
| 마이페이지/프로필/이미지 | 10 |
| 북마크/알림/검색/차단/신고 | 12 |
| 비밀번호/이메일 인증 | 7 |
| **합계** | **66** |

### Logger 적용 범위

| 레이어 | 적용 항목 |
|--------|---------|
| `shared/api/axiosInstance` | 토큰 리프레시 시도/실패/소진 breadcrumb |
| `shared/lib/errors/createMutationOptions` | business/system/network 에러 자동 로깅 |
| `features/auth/hooks/useAuth` | 로그인/회원가입 성공 시 `setUser`, 로그아웃 시 `setUser(null)` |
| Feature hooks 7개 | `createMutationOptions` 통합으로 간접 적용 |

### 테스트

- Vitest: **273개 통과** (Phase 7 신규 추가 없음, 기존 suite 전부 유지)
- 빌드 오류: 0건

---

## 7. 회고 / 배운 점

### "백엔드 없이 동작하는 데모" 설계의 복잡성

Route Handler로 백엔드를 완전히 대체하는 것은 단순히 "API를 흉내내는" 것이 아니다. 인증 토큰 발급 → 세션 관리 → 데이터 관계(유저-여행-댓글) 유지까지 **실제 백엔드와 동일한 상태 모델**이 필요했다. MSW Stateful 서버(`src/mocks/db/store.ts`)를 Phase 6에서 미리 구축한 덕분에 이 작업이 크게 단순화됐다. **테스트 인프라가 실제 프로덕션 인프라로 전환**되는 드문 경험이었다.

### Adapter 패턴의 실제 효과

`ILogger` 인터페이스 하나로 세 가지 구현을 교체하면서, 호출부 코드는 단 한 줄도 수정하지 않았다. 추상화가 "나중에 쓸지도 모르는" 이론적 유연성이 아니라, **테스트 환경 속도 유지 + 개발 가시성 + 프로덕션 에러 추적**이라는 세 가지 실제 요구를 동시에 해결했다.

### 프로덕션 버그의 공통 패턴

Phase 7에서 수정한 버그들은 대부분 "개발 환경에서는 문제없지만 프로덕션에서만 터지는" 유형이었다:
- `authStore persist` 없음 → 새로고침마다 로그아웃
- Kakao API 키 없는 환경 → SDK 미로드 → UI 멈춤
- SSR 상대 경로 URL → Node.js에서 `invalid URL`
- `userId = null` 가드 누락 → store 오염 → 잘못된 API 호출

공통 원인은 **"이 컴포넌트/훅이 로딩 중이거나 없는 값을 받을 수 있다"는 케이스를 개발 중에 재현하기 어렵다**는 것이다. `!!value && value > 0` 같은 타입 가드와 `if (!isLoad) { fallback() }` 같은 명시적 폴백 처리가 이를 방어한다. 다음 프로젝트에서는 이 패턴을 초기 설계 단계에서 규칙으로 잡을 것이다.
