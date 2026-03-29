# Phase 6: 유저 플로우 개선 — Auth

> **시작일**: 2026-03-28
> **목표**: Auth 플로우를 시작으로 유저 플로우 개선. E2E 베이스라인 측정 → UX/접근성 개선 → 수치 비교.

---

## 1. 배경 / 문제 정의

Phase 5까지 FSD 구조 전환 + Tailwind 이전이 완료됐지만, 실제 유저 플로우에 대한 **검증이 없는 상태**였다. 특히:

- **E2E 테스트**: Phase 4에서 `test.describe.skip` 드래프트 상태로 존재, 실제 실행 미확인
- **접근성**: `shared/ui` 레벨은 `jest-axe`로 검증됐지만 **실제 페이지 단위 WCAG 검사 없음**
- **성능**: 측정 기준치 없음
- **백엔드 의존**: 모든 API 호출이 실제 백엔드에 의존, 팀원 부재 시 개발 불가

이 상황에서 **auth를 첫 번째 유저 플로우**로 선정해 체계적으로 개선한다.

---

## 2. 선택지와 의사결정

### 결정 1: 테스트 → 베이스라인 → 개선 순서 고정

개선부터 하면 "얼마나 나아졌는지" 측정이 불가능하다.
→ **E2E 테스트 먼저 작성 → 수치 측정 → 개선** 순서로 진행.

### 결정 2: MSW Express 서버로 백엔드 대체

백엔드 서버 다운 상태에서 E2E 테스트 실행 방법:

| 옵션 | 설명 | 결정 |
|------|------|------|
| 실제 백엔드 | 팀원 없어 불가 | ❌ |
| `page.route()` mocking | Playwright 내부 모킹, 유지보수 어려움 | ❌ |
| MSW Express 서버 | 이미 `src/mocks/http.ts` 존재, handlers 재사용 | ✅ |
| Next.js Route Handlers | 64개 엔드포인트 새로 구현 필요 | 추후 검토 |

**MSW Express 서버 선택 이유:**
- `src/test/msw/handlers/`가 이미 Vitest용으로 구축됨 → 재활용
- `playwright.config.ts`에 `webServer` 두 개로 MSW(9090) + Next.js(8080) 분리 실행
- Next.js `rewrites()`로 `/api/*` → `http://localhost:9090/api/*` 투명 프록시

### 결정 3: Stateful Mock 서버 구축 (Phase 6 후반)

초기 MSW 핸들러는 정적 응답만 반환 → 실제 플로우 확인 불가.
→ `src/mocks/db/` in-memory store 추가로 stateful하게 업그레이드.

E2E 테스트용 핸들러(`src/test/msw/handlers/`)는 static 유지, Express 서버 핸들러만 stateful로 분리.

---

## 3. 구현 과정

### 3-1. Playwright 설정 변경

```ts
// playwright.config.ts
webServer: [
  {
    command: 'node_modules/.bin/tsx src/mocks/http.ts',
    url: 'http://localhost:9090',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
  },
  {
    command: 'API_BASE_URL=http://localhost:9090 yarn dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
],
```

- MSW 서버가 먼저 뜨고 Next.js가 나중에 실행 (순서 보장)
- `reuseExistingServer: !process.env.CI` → 로컬에서는 기존 서버 재사용 가능

**트러블슈팅: Playwright webServer "Process exited early"**
MSW Express 서버에 health check 없으면 Playwright가 서버 시작 감지 불가.
```ts
// src/mocks/http.ts
app.get("/", (_req, res) => res.status(200).send("ok")); // 추가
```

### 3-2. MSW Handler 재구성

```ts
// src/mocks/handler.ts (수정)
import { authHandlers, tripHandlers, ... } from '@/test/msw/handlers';
export const handlers = [...authHandlers, ...tripHandlers, ...];
```

- Vitest handlers를 그대로 재사용
- `@/` path alias는 tsx가 tsconfig.json을 읽어 자동 해석

### 3-3. E2E 테스트 스펙 작성 (`e2e/auth.spec.ts`)

**Terms 모달 클릭 문제:**
Terms 패널이 `animate-[slideUpMobile_0.5s_ease-out_forwards]`로 viewport 아래에서 올라오는 애니메이션 적용.
Playwright의 `.click()`은 viewport 밖 요소를 클릭 거부.

```ts
// ❌ 실패: viewport 체크
await page.getByRole('button', { name: '동의합니다' }).click();

// ✅ 해결: waitForFunction + JS evaluate 직접 클릭
await page.waitForFunction(
  () => !!Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent?.trim() === '동의합니다' && !b.hasAttribute('disabled'))
);
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent?.trim() === '동의합니다' && !b.hasAttribute('disabled'));
  (btn as HTMLButtonElement)?.click();
});
```

**`@axe-core/playwright` 설치 오류:**
jsdom engine 비호환 → `--ignore-engines` 플래그로 설치.

---

## 4. 베이스라인 측정 결과 (개선 전)

자세한 수치는 [`docs/baseline/auth-baseline.md`](../baseline/auth-baseline.md) 참조.

### 접근성 요약

| 페이지 | 위반 수 | 주요 위반 |
|--------|---------|-----------|
| /login | 3건 | `button-name`(critical), `color-contrast`, `document-title` |
| /registerEmail | 3건 | `button-name`(critical), `color-contrast`, `document-title` |
| /verifyEmail | 미측정 | 백엔드 없어 진입 불가 |
| /registerPassword | 미측정 | 동일 |

**공통 패턴:**
- OAuth 아이콘 버튼 3개: `aria-label` 없음
- Terms 체크/닫기 버튼: `aria-label` 없음
- 전 페이지: `<title>` 태그 없음

### 성능 요약

| 페이지 | TTFB | FCP | 특이사항 |
|--------|------|-----|----------|
| /login | 1,204ms | 1,240ms | 백엔드 연결 실패로 token refresh ECONNREFUSED → 지연 |
| /registerEmail | 309ms | 380ms | 양호 |

---

## 5. 현재 블로킹 이슈

### 백엔드 서버 다운 → E2E 플로우 중단

**증상**: `/registerEmail` 폼 제출 후 Fallback 페이지("돌아가기" 버튼) 렌더링, URL은 `/registerEmail` 유지.

**원인 분석**:
1. `verifyEmailSend.mutate()` 호출 → `POST /api/verify/email/send`
2. 백엔드가 없는 상태에서 Next.js 서버가 404 반환 (rewrite 비활성)
3. `verifyEmailSend`에 `mutationKey` 없음 → `QueryClientBoundary` global error handler 발동
4. `updateError()` + `setIsMutationError(true)` → Fallback 컴포넌트 렌더링

**확인된 것:**
- MSW Express 서버 자체는 정상 (`curl http://localhost:9090/api/verify/email/send` → 200)
- `reuseExistingServer: true`면 `API_BASE_URL` 없이 시작된 기존 서버가 재사용될 수 있음

**해결 방향**: Stateful Mock 서버 구축 후 E2E 재실행으로 검증.

---

## 6. 작업 현황

### Phase 6-5: Stateful Mock 서버 구축 ✅

**구현 완료** (`src/mocks/db/` + `src/mocks/routes/`)

| 파일 | 라인 수 | 내용 |
|------|--------|------|
| `db/store.ts` | 272줄 | In-memory store — User, Session, EmailVerification, Trip, Enrollment, Community, Comment 타입 + CRUD 헬퍼 |
| `routes/auth.ts` | 390줄 | 로그인/로그아웃/회원가입/이메일 인증/토큰 갱신/OAuth 콜백 등 auth 전체 |
| `routes/trip.ts` | 244줄 | 여행 목록/상세/생성/수정/삭제/신청/북마크 |
| `routes/community.ts` | 192줄 | 커뮤니티 CRUD + 좋아요/댓글 |
| `routes/misc.ts` | 435줄 | 마이페이지/프로필/알림/차단/신고 등 |

기존 Vitest용 MSW 핸들러(`src/test/msw/handlers/`)는 static 응답 유지.
Express 서버(`src/mocks/http.ts`)만 stateful routes로 교체.

### Phase 6-6: 코드 리뷰 반영 ✅

**블로킹 수정 2건**
- `axiosInstance.ts`: 401 인터셉터에서 `/api/login` 예외 처리 — 잘못된 비밀번호 입력 시 토큰 갱신 시도 → "서버 오류" Toast 표시되던 버그 수정
- `OauthGoogle/Kakao/Naver.tsx`: 구 경로(`@/api/user`, `@/hooks/user/useAuth`) → FSD 경로(`@/entities/user`, `@/features/auth`) 정리

**개선 3건**
- `createMutationOptions.ts`: `MutationPolicyOptions`에서 `onSuccess` 제거 (useMutation 호출부 spread 후 직접 선언 패턴으로 통일)
- `useNfcField.ts`: 언마운트 시 `setTimeout` cleanup 추가
- `zodResolver.ts`: path 빈 배열 에러를 `'root'` 키로 저장 (silent fail 방지)

### Auth UX/접근성 개선 ✅
- [x] OAuth 버튼 3개 `aria-label` 추가 (`LoginActions.tsx` — "네이버로 로그인", "카카오로 로그인", "구글로 로그인")
- [x] Terms 버튼 `aria-label` 추가 (`features/auth/ui/Terms.tsx` — `aria-label` + `aria-pressed`)
- [x] `<title>` 추가 — `/login`, `/registerEmail`, `/verifyEmail`, `/registerPassword` 4개 페이지
- [x] `alert()` → Toast 교체 (`RegisterTripStyle.tsx` — `WarningToast` + 1.5s 후 redirect)

### 코드 품질 ✅
- [x] `OAuthTokenResponse` 타입 정의 (`entities/user/model.ts`) → `getToken` 반환 타입 명시
- [x] `any` 타입 제거 (`OauthGoogle/Kakao/Naver.tsx` — `.then((user: OAuthTokenResponse | null | undefined)`)

### 잔여 TODO
- [ ] `color-contrast` 위반 색상 수정 (axe 재측정 후 대상 확정)
- [ ] `/verifyEmail`, `/registerPassword` axe 측정 → baseline 완성
- [ ] RegisterDone 자동 로그인 (백엔드 협의 필요)

---

## 8. Phase 6-2: 폼 마이그레이션 — react-hook-form + zod

> 작업 일자: 2026-03-28

### 배경

Auth 폼 9개가 `useState` + 직접 작성 validation 패턴으로 구현됐다. 문제:

- 각 폼마다 `handleChange`, `hasError`, `errorMessage` 상태 3개씩 수동 관리
- 유효성 검사 로직이 컴포넌트 내에 인라인으로 분산 → 재사용 불가
- 제출 시점에만 검사 → 사용자가 틀렸다가 고치는 경험이 없음
- 한글 입력 시 NFC 정규화 미적용 → 자모 분리 현상

### 결정: `@hookform/resolvers` 없이 직접 구현

`@hookform/resolvers` 설치 시도 → yarn registry ENOTFOUND. 네트워크 차단 환경.

| 옵션 | 결정 |
|------|------|
| `@hookform/resolvers` 패키지 설치 | ❌ 네트워크 차단 |
| zod superRefine으로 커스텀 validation | ✅ |
| `zodResolver` 직접 구현 (`src/shared/lib/zodResolver.ts`) | ✅ |

```ts
// src/shared/lib/zodResolver.ts
export function zodResolver<T extends FieldValues>(schema: ZodSchema<T>): Resolver<T> {
  return async (data) => {
    const result = schema.safeParse(data);
    if (result.success) return { values: result.data as T, errors: {} };
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (path && !errors[path]) errors[path] = { type: issue.code, message: issue.message };
    }
    return { values: {} as T, errors };
  };
}
```

### NFC 정규화 + 디바운싱 전략

한글 폼 필드(이름, 댓글)에만 적용. 이메일/비밀번호는 ASCII라 불필요.

```
onChange → normalize('NFC') → 300ms debounce → zod trigger()
submit   → sanitizeFormData() → HTML 태그 제거 + trim
```

별도 `useNfcField` hook으로 추출 (`src/shared/hooks/useNfcField.ts`).

### 마이그레이션된 폼 9개

| 파일 | 스키마 | NFC |
|------|--------|-----|
| `EmailLoginForm.tsx` | `loginSchema` | ❌ |
| `RegisterEmail.tsx` | `registerEmailSchema` | ❌ |
| `RegisterPassword.tsx` | `registerPasswordSchema` + superRefine | ❌ |
| `RegisterName.tsx` | `nameFormSchema` | ✅ |
| `RegisterForm.tsx` | inline (email+password) | ❌ |
| `EditMyName.tsx` | `nameFormSchema` | ✅ |
| `EditMyPassword.tsx` | `verifyCurrentPasswordSchema` | ❌ |
| `NewPassword.tsx` | `newPasswordSchema` + superRefine | ❌ |
| `CommentForm.tsx` | `commentSchema` | ✅ (textarea) |

### localStorage 이메일 임시 저장

```
요구사항: 회원가입 도중 실수로 뒤로가도 이메일 복구 가능
제약:     비밀번호 등 민감 정보 저장 금지
구현:     TTL 1시간, JSON { email, savedAt }, registerDraft.ts
삭제:     RegisterDone.tsx에서 회원가입 완료 시 명시적 삭제
```

```ts
// src/shared/lib/registerDraft.ts
const TTL_MS = 60 * 60 * 1000; // 1시간
// save → load (TTL 체크) → clear (회원가입 완료 시)
```

---

## 9. Phase 6-3: 성능 최적화 — Lighthouse 기반

> 작업 일자: 2026-03-28

### 배경: Lighthouse 베이스라인

Production 빌드 기준 측정 (초기).

| 페이지 | Performance | FCP | LCP | TBT |
|--------|:-----------:|-----|-----|-----|
| `/login` | 63 | 4.7s | 8.3s | 30ms |
| `/registerEmail` | 56 | 9.0s | 12.2s | 0ms |

### 발견된 문제 3가지

**1. Google Maps API가 모든 페이지에서 로드**

`src/components/Layout.tsx`가 `<APIProvider>` (from `@vis.gl/react-google-maps`)로 전체 앱을 감쌌다. 로그인 페이지에서도 Maps API 84KB + 37KB = 121KB 로드.

→ 실제로 Maps를 사용하는 컴포넌트(`GoogleMap`, `TravelLogMap`, `RegionWrapper`, `SearchPlace`)는 이미 자체 `APIProvider`를 렌더링하고 있었음. Layout의 APIProvider는 완전히 중복이었다.

→ Layout에서 `<APIProvider>` 제거. `SearchPlaceDetail`만 자체 APIProvider 없어서 page.tsx에 추가.

**2. Google Tag Manager 중복 로드 (155KB × 2)**

- `src/context/AnalyticsProvider.tsx`: `<Script src="gtag/js...">` 로드
- `src/app/layout.tsx`: `<GoogleAnalytics>` (@next/third-parties) 로드

두 곳이 같은 GA4 스크립트를 로드. → `layout.tsx`에서 `<GoogleAnalytics>` 제거.

**3. Pretendard 폰트 비최적화 (748KB + 768KB)**

`globals.css`에 `@font-face` 선언만 있고 `font-display`, preload 없음. 폰트 로드 전까지 텍스트 불표시 → FCP 4.7–9.0s.

### 해결 및 결과

#### a. `next/font/local` 적용 → FCP 0.8s

```ts
// app/layout.tsx
const pretendard = localFont({
  src: [
    { path: "../../public/fonts/Pretendard-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/Pretendard-SemiBold.woff2", weight: "600" },
    // ...
  ],
  display: "swap",
  preload: true,
});
```

`next/font/local`이 자동으로 `<link rel="preload">` 삽입. `globals.css`의 `@font-face` 블록 전부 제거.

**결과: FCP 4.7s → 0.8s, SI 4.8s → 0.8s**

#### b. AppShell 분리 + `dynamic()` → auth 페이지 번들 절감

`Layout.tsx`가 모든 페이지에서 `useMyPage()` (API 호출), `useAuth()`, Navbar, Splash 등을 마운트. 로그인 페이지에서는 완전히 불필요한 작업.

```
auth 경로 감지:
  /login*, /register*, /verifyEmail, /onBoarding, /explanation
  → 단순 래퍼 div만 렌더링 (AppShell 마운트 없음)

비auth 경로:
  → <AppShell> (기존 Layout 로직 전부)
```

AppShell을 `dynamic(() => import('./AppShell'), { ssr: false })`로 lazy load → auth 페이지 번들에서 AppShell 의존성 완전 제외. 요청 수: 54 → 47개 (login 기준).

#### c. Login Server Component 분리

`Login.tsx`에서 `"use client"` 제거. 상호작용 부분만 `LoginActions.tsx`(Client Component)로 분리.

```
Login.tsx (Server Component)
  ├── MoingFullLogo (Server Component, "use client" 제거)
  ├── EmailLoginForm (Client Component, lazy loaded)
  └── LoginActions (Client Component: 둘러보기 버튼 + OAuth 버튼)
```

### 최종 Before / After

| 페이지 | Performance | FCP | LCP | SI |
|--------|:-----------:|-----|-----|-----|
| `/login` 이전 | 63 | 4.7s | 8.3s | 4.8s |
| `/login` 이후 | **75 (+12)** | **0.8s** | 12.5s | **0.8s** |
| `/registerEmail` 이전 | 56 | 9.0s | 12.2s | 9.0s |
| `/registerEmail` 이후 | **75 (+19)** | **0.8s** | 12.2s | **0.9s** |

### 트러블슈팅: LCP 12.5s 현상

login 페이지의 LCP가 8.3s → 12.5s로 증가했다. 조사 결과:

- **LCP = TTI = 12.5s** — LCP 요소가 JS hydration 완료 시점에 나타남
- 이전에는 폰트 로딩이 render를 막아 FCP/LCP/TTI가 ~8.3s에 함께 묶였던 것
- next/font 적용 후 폰트 차단이 사라지자 **진짜 JS hydration 시간**(12.5s with 4x CPU throttle ≒ 3s on real device)이 드러남
- 즉 이전 8.3s LCP는 "폰트가 묶어준 허수"였고, 실제 사용자는 오히려 개선된 상태

LCP를 근본적으로 개선하려면 `Providers` 체인(AnalyticsProvider + QueryClientBoundary + ViewTransitions 등) hydration 비용 감소가 필요. 현재 범위 밖.

### 알게 된 것

- **localhost Lighthouse는 network throttle 없음**: Maps API 제거(121KB), GTM 중복 제거(155KB) 효과가 점수에 미반영. 실제 사용자 환경에선 의미 있는 개선.
- **font-display: swap만으로는 FCP 개선 불충분**: `@font-face`에 swap 추가해도 preload가 없으면 폰트 다운로드 시작이 늦다. `next/font`의 자동 preload가 핵심.
- **AppShell dynamic import**: 정적 import로는 auth 페이지에서도 AppShell 코드가 번들에 포함. `dynamic()`으로만 실제 분리 가능.

---

## 7. 아키텍처 메모

### axiosInstance 요청 흐름

```
[브라우저] POST /api/verify/email/send
  → [Next.js dev 서버] (API_BASE_URL 있으면) rewrite
  → [MSW Express :9090] POST /api/verify/email/send
  → 응답 반환

[브라우저] POST /api/verify/email/send
  → [Next.js dev 서버] (API_BASE_URL 없으면) 404
  → ECONNREFUSED → Fallback
```

### Zustand userStore 흐름

```
RegisterEmail: addEmail(email) + sessionStorage.setItem(sessionToken)
VerifyEmail:   인증 확인
RegisterPassword: addPassword(password)
RegisterName:  addName(name)
RegisterAge:   addAgegroup(age)
RegisterGender: addSex(sex)
RegisterTripStyle: 최종 POST /api/users/sign-up (전체 데이터 한번에)
```

`userStore`에 `persist` 없음 → 새로고침 시 상태 리셋, 처음부터 재시작.

---

## 10. Phase 6-4: 에러 핸들링 정책 — 내부 라이브러리 설계 + TDD

> 작업 일자: 2026-03-28

### 배경 / 문제 정의

Phase 6-3 성능 최적화 중 `useVerifyEmail`을 들여다보다 에러 처리가 얼마나 파편화되어 있는지 드러났다.

```ts
// ❌ 기존 패턴 (파편화된 에러 처리)
try {
  await verifyEmailSend.mutateAsync({ email });
} catch (e) {
  if (!checkNetworkConnection()) {
    errorStore.updateError(true);
    return;
  }
  setIsMutationError(true); // → 전역 Fallback 컴포넌트 렌더링
}
```

문제점:
1. **`checkNetworkConnection()`**: 각 mutation 콜백에서 직접 호출 → 수동 네트워크 체크가 반복
2. **`errorStore.setIsMutationError(true)`**: 폼 유효성 에러(400)에도 전역 Fallback이 렌더링됨
3. **에러 분류 없음**: network / business / system 구분 없이 모든 에러를 동일하게 처리
4. **자동 재시도 없음**: 네트워크 불안정 시 사용자가 수동으로 다시 시도해야 함
5. **일관성 없음**: 어떤 곳은 Toast, 어떤 곳은 Fallback, 어떤 곳은 조용히 무시

### 선택지와 의사결정

#### 결정 1: 에러를 3가지 클래스로 분류

| 클래스 | 조건 | 예시 |
|--------|------|------|
| `network` | 응답 없음 (오프라인, timeout, ECONNREFUSED) | 와이파이 끊김 |
| `business` | 4xx 응답 (서비스 로직 에러) | 이메일 중복, 잘못된 인증코드 |
| `system` | 5xx 응답 또는 알 수 없는 에러 | 서버 장애 |

**business 에러는 컨텍스트마다 의미가 달라 항상 콜백(`onBusinessError`)으로 위임.** 폼 인라인 표시인지, Toast인지는 caller가 결정.

#### 결정 2: ErrorPolicy + SystemBehavior 인터페이스

```ts
interface ErrorPolicy {
  network: SystemBehavior;  // 'retry' | 'toast' | 'fallback' | 'ignore'
  system: SystemBehavior;
}
```

동작 정의:
- `retry`: React Query auto-retry 3회 (1s → 2s → 4s 지수 백오프), 소진 후 RetryToast
- `toast`: 즉시 NetworkErrorToast 표시
- `fallback`: 에러를 re-throw → 전역 ErrorBoundary 처리
- `ignore`: 완전 무시 (로그아웃처럼 실패해도 로컬 상태만 정리)

#### 결정 3: `createMutationOptions` 팩토리 함수 — 내부 라이브러리로 분리

에러 핸들링 로직을 `shared/lib/errors/`에 격리. 모든 `useMutation` 호출이 이 팩토리를 통해 에러 정책을 주입받는다.

```ts
// 사용 예시
const loginEmailMutation = useMutation({
  ...createMutationOptions({
    mutationFn: async ({ email, password }) => { ... },
    policy: AUTH_ERROR_POLICY, // { network: 'retry', system: 'toast' }
    onBusinessError: (_err) => { /* 폼 레벨에서 처리 */ },
  }),
  onSuccess: (data) => { ... },
});
```

`AUTH_ERROR_POLICY`처럼 도메인별 정책을 상수로 정의해 일관성 보장.

#### 결정 4: Fallback 제거 (auth 에러에서)

기존 `setIsMutationError(true)` → 전역 Fallback 패턴은 auth에서 제거. 이유:
- 로그인 실패 / 인증코드 오류는 폼 레벨에서 인라인으로 처리해야 함
- 전역 Fallback은 "페이지 전체가 망가졌을 때"에만 적합

### 구현 과정

#### 파일 구조

```
src/shared/lib/errors/
├── types.ts               — ErrorClass, SystemBehavior, ErrorPolicy 타입 정의
├── classify.ts            — classifyError(), extractErrorMessage()
├── errorToastStore.ts     — Zustand store (imperative Toast 트리거)
├── createMutationOptions.ts — 팩토리 함수 (retry + onError 주입)
└── index.ts               — 전체 export

src/shared/ui/toast/
└── NetworkErrorToast.tsx  — "다시 시도" 버튼이 있는 Toast UI

src/features/auth/lib/
└── authErrorPolicy.ts     — AUTH_ERROR_POLICY = { network: 'retry', system: 'toast' }
```

#### `classifyError` 분류 로직

```ts
export function classifyError(error: unknown): ErrorClass {
  if (isAxiosError(error)) {
    if (!error.response || error.code === 'ERR_NETWORK' || ...) return 'network';
    const status = error.response.status;
    if (status >= 400 && status < 500) return 'business';
    if (status >= 500) return 'system';
  }
  return 'system'; // non-axios error도 system으로 처리
}
```

#### `createMutationOptions` 핵심 로직

```ts
return {
  retry: (failureCount, error) => {
    // network + retry 정책일 때만 최대 3회 재시도
    if (classifyError(error) === 'network' && policy.network === 'retry') {
      return failureCount < 3;
    }
    return false;
  },
  retryDelay: (attemptIndex) => [1000, 2000, 4000][attemptIndex] ?? 4000,
  onError: (error, variables) => {
    const errorClass = classifyError(error);
    if (errorClass === 'business') {
      onBusinessError?.(error, variables); // 항상 콜백 위임
      return;
    }
    const behavior = errorClass === 'network' ? policy.network : policy.system;
    if (behavior === 'retry') errorToastStore.getState().show(NETWORK_ERROR_MESSAGE);
    if (behavior === 'toast') errorToastStore.getState().show(message);
    if (behavior === 'fallback') throw error;
    // 'ignore': no-op
  },
};
```

#### NetworkErrorToast

기존 `BaseToast`는 1,500ms 자동 닫힘이었다. 네트워크 에러 Toast는 사용자가 직접 닫아야 의미 있어 `#result-toast` 포털에 별도 컴포넌트로 구현.

- 자동 닫힘 없음
- `onRetry` 콜백이 있으면 "다시 시도" 버튼 표시
- `pointer-events: auto` → 다른 UI와 독립적으로 클릭 가능

### TDD: 에러 핸들링 시스템 테스트

#### 테스트 전략

| 레이어 | 파일 | 테스트 종류 |
|--------|------|------------|
| 순수 함수 | `classify.test.ts` | 단위 테스트 |
| 팩토리 함수 | `createMutationOptions.test.ts` | 단위 테스트 (함수 직접 호출) |
| 훅 통합 | `useAuth.error.test.ts` | MSW + React Query |
| 훅 통합 | `useVerifyEmail.error.test.ts` | MSW + React Query |

#### classify 단위 테스트 (17개)

```ts
// 네트워크 에러 분류
expect(classifyError(makeNetworkError('ERR_NETWORK'))).toBe('network');
expect(classifyError(makeNetworkError('ECONNABORTED'))).toBe('network');

// HTTP 상태 코드 분류
expect(classifyError(makeHttpError(400))).toBe('business');
expect(classifyError(makeHttpError(500))).toBe('system');

// non-axios 에러
expect(classifyError(new Error('unexpected'))).toBe('system');
```

#### createMutationOptions 단위 테스트 (18개)

`retry` 함수와 `onError` 콜백을 직접 호출해 검증. `errorToastStore`는 `vi.hoisted` 패턴으로 mock.

```ts
// retry 함수 검증
expect(opts.retry(0, networkErr)).toBe(true);  // 1차 재시도
expect(opts.retry(3, networkErr)).toBe(false); // 소진

// onError 검증
opts.onError(makeHttpError(400), undefined);
expect(onBusinessError).toHaveBeenCalledOnce();
expect(mockShow).not.toHaveBeenCalled(); // business → toast 안 뜸

opts.onError(makeHttpError(500), undefined);
expect(mockShow).toHaveBeenCalledWith(expect.stringContaining('서버'));
```

#### MSW 통합 테스트 (각 5개)

`server.use()`로 특정 테스트에서만 실패 응답 오버라이드:

```ts
// 500 system 에러 → toast 표시
server.use(
  http.post('/api/login', () => HttpResponse.json({}, { status: 500 }))
);
await waitFor(() => expect(loginEmailMutation.isError).toBe(true));
expect(mockShow).toHaveBeenCalledWith(expect.stringContaining('서버'));

// 401 business 에러 → toast 없음
// (axiosInstance 인터셉터가 401에 refresh 시도 → refresh도 400으로 강제 실패)
server.use(http.post('/api/token/refresh', () => HttpResponse.json({}, { status: 400 })));
// ... isError=true, mockShow not called

// network 에러 + ignore 정책 (logout)
server.use(http.post('/api/logout', () => HttpResponse.error()));
// ... isError=true, mockShow not called
```

### 트러블슈팅

#### 1. `axiosInstance` 인터셉터가 401 로그인 에러를 가로챔

`axiosInstance.ts`에 401/403 응답 시 `/api/token/refresh` 자동 호출 인터셉터가 있다. 로그인 실패(잘못된 비밀번호) → 401 → 인터셉터 → refresh 5회 시도 → `new Error('Authentication failed...')` → non-AxiosError → `classifyError` → 'system' → toast 표시.

**즉, 잘못된 비밀번호 입력 시 사용자에게 "서버 오류" Toast가 뜨는 버그가 존재한다.**

테스트에서는 `/api/token/refresh`도 400 실패로 강제해 refresh 즉시 종료 → AxiosError(400) → 'business' 경로를 확인하는 방식으로 우회했다.

**근본 해결**: 로그인 엔드포인트(`/api/login`)를 인터셉터의 예외 경로로 추가해야 한다. 현재는 범위 밖.

#### 2. `vi.mock` 호이스팅 문제

`vi.mock` 팩토리 안에서 외부 변수를 참조하면 호이스팅 시점에 undefined.

```ts
// ❌ 작동 안 함
const mockShow = vi.fn();
vi.mock('...', () => ({
  errorToastStore: { getState: () => ({ show: mockShow }) }, // mockShow = undefined
}));

// ✅ vi.hoisted 사용
const mockShow = vi.hoisted(() => vi.fn());
vi.mock('...', () => ({
  errorToastStore: { getState: () => ({ show: mockShow }) },
}));
```

`vi.hoisted()`는 mock 팩토리보다 먼저 실행되도록 명시적으로 호이스팅을 제어한다.

#### 3. `it` 블록 내 `vi.mock` 호출

테스트 중간에 `vi.mock()`을 다시 호출하면 파일 전체에서 호이스팅되어 이전 mock을 덮어쓴다. 테스트 중간 mock 교체는 `vi.mocked().mockReturnValue()` 패턴을 사용해야 한다.

### Before / After 비교

```ts
// ❌ 기존: 파편화된 에러 처리
const verifyEmailSend = useMutation({
  mutationFn: async ({ email }) => {
    if (!checkNetworkConnection()) throw new RequestError(/* ... */);
    const response = await axiosInstance.post(/* ... */);
    return response.data;
  },
  onError: () => {
    errorStore.setIsMutationError(true); // 폼 에러에도 전역 Fallback!
  },
});

// ✅ 이후: 정책 기반 에러 처리
const verifyEmailSend = useMutation({
  ...createMutationOptions({
    mutationFn: async ({ email }) => {
      const response = await axiosInstance.post(/* ... */);
      if (!response.data?.success) throw Object.assign(new Error(reason), { response: { status: 400, ... } });
      return response.data;
    },
    policy: AUTH_ERROR_POLICY, // { network: 'retry', system: 'toast' }
    onBusinessError: () => { /* 상위 컴포넌트가 isError 감지 후 처리 */ },
  }),
  onSuccess: (data) => { sessionStorage.setItem('sessionToken', ...) },
});
```

### 결과 및 수치

- 삭제된 코드: `checkNetworkConnection()` 호출 제거, `errorStore.setIsMutationError` 호출 제거
- 추가된 테스트: 45개 (classify 17 + createMutationOptions 18 + 통합 10)
- Auth 관련 mutation 7개 전부 ErrorPolicy 기반으로 전환
- 네트워크 에러 자동 재시도: 3회 (1s/2s/4s 지수 백오프) — 이전: 없음

### 회고 / 배운 점

**에러 처리를 정책(Policy)으로 추상화하면 코드 이해가 쉬워진다.** `createMutationOptions`를 보면 이 mutation이 네트워크 에러에 어떻게 반응하는지 한눈에 알 수 있다. 이전에는 각 onError 콜백을 일일이 읽어야 했다.

**business 에러는 반드시 콜백 위임이 정답이다.** 동일한 401도 로그인 실패인지 권한 부족인지 컨텍스트마다 의미가 다르다. 공통 라이브러리 수준에서 처리하려 하면 과적합이 생긴다.

**테스트 작성 전 의존성 파악이 중요하다.** `useAuth.ts`는 `axiosInstance`의 인터셉터를 통해 동작하므로, 단순히 MSW를 오버라이드하는 것만으로는 예상한 에러 흐름이 나오지 않는다. 인터셉터 존재를 미리 인지하고 테스트를 설계해야 했다.
