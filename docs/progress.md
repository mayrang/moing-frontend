# MOING Frontend 리팩토링 진행 현황

## 전체 진행률

| Phase | 이름 | 상태 | 시작일 | 완료일 |
|-------|------|------|--------|--------|
| Phase 0 | 기반 구축 | ✅ 완료 | 2026-03-20 | 2026-03-20 |
| Phase 1 | shared 레이어 | ✅ 완료 | 2026-03-20 | 2026-03-20 |
| Phase 1.5 | 웹 접근성 보강 | ✅ 완료 | 2026-03-20 | 2026-03-20 |
| Phase 2 | entities 레이어 | ✅ 완료 | 2026-03-21 | 2026-03-21 |
| Phase 3 | features 레이어 | ✅ 완료 | 2026-03-21 | 2026-03-21 |
| Phase 4 | page-views / widgets 레이어 | ✅ 완료 | 2026-03-21 | 2026-03-21 |
| Phase 5 | Tailwind CSS 전환 — Emotion 완전 제거 | ✅ 완료 | 2026-03-22 | 2026-03-22 |
| Phase 6 | 유저 플로우 개선 — Auth | 🔄 진행 중 | 2026-03-28 | - |

---

## Phase 0: 기반 구축

### 체크리스트
- [x] Vitest 설정
- [x] Playwright 설정
- [x] Tailwind CSS 설치 및 설정 (Emotion 공존)
- [x] FSD 디렉토리 스캐폴딩
- [x] docs 문서 구조 생성

### 변경 파일 목록
_작업 완료 후 기록_

---

## Phase 1: shared 레이어

### 체크리스트
- [x] 1-1: Button 그룹 (6개 컴포넌트, 18개 테스트)
- [x] 1-2: Badge, Select, Tag, Text 그룹 (9개 컴포넌트, 20개 테스트)
- [x] 1-3: Input 그룹 (7개 컴포넌트, 36개 테스트)
- [x] 1-4: Toast 그룹 (5개 컴포넌트, 12개 테스트) — FSD 위반 제거, BaseToast 추출
- [x] 1-5: Modal 그룹 (9개 컴포넌트, 23개 테스트) — ModalDimmed/BaseModal/BottomSheetModal 추출
- [x] 1-6: Profile (1개 컴포넌트, 4개 테스트) — RoundedImage

### 누계 테스트
- 최종: **113개** 통과 (26개 테스트 파일)

---

## Phase 1.5: 웹 접근성 보강

> **결정 배경**: 접근성은 shared/ui 레벨에서 보장해야 하나, Phase 1 흐름을 끊지 않기 위해 분리.

### 전략
- **컴포넌트 고정값** (design system에서 처리): `aria-expanded`, `role`, `aria-modal`, focus trap 등
- **컨텍스트 의존값** (prop으로 받기): `aria-label`, `aria-describedby` 등

### 체크리스트
- [x] `jest-axe` 기반 접근성 자동 검사 도입 (setup.ts 전역 등록)
- [x] Select: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `role="listbox"`, `role="option"`, `aria-selected`
- [x] CloseButton: `aria-label` prop (기본값: text prop과 동일)
- [x] RemoveButton: `aria-label="삭제"` (아이콘 전용 버튼)
- [x] StateInputField: `aria-describedby` 연결 (`errorMessageId` prop)
- [x] CodeInput: 각 셀에 `aria-label="{n}번째 숫자"` (1~6)
- [x] BaseModal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, Escape 닫기
- [x] BottomSheetModal: 동일 접근성 속성 적용
- [x] 키보드 네비게이션 (Escape, Tab focus trap 구현 완료)

### 누계 테스트
- 최종: **134개** 통과 (27개 테스트 파일)

---

## Phase 2: entities 레이어

### 체크리스트
- [x] Phase 1 잔여물 정리 (icons 크로스 레이어 의존성, barrel export, jest-axe 전체 적용)
- [x] `shared/api/` 구성 (axiosInstance, handleApiResponse 이전, console.log 제거)
- [x] `shared/types/` 구성 (RequestErrorType 이전)
- [x] `model/` + `api/` → `entities/{domain}/` (16개 도메인)
- [x] cross-layer 의존성 해소 (Filters, IListParams)

### 결과
- 생성: 65개 파일 (entities 48 + shared/api 3 + shared/types 2 + icons 11 + barrel 1)
- 테스트: 134개 → **159개** (전부 통과)
- console.log 위반: 9개 → 0개
- 참조: [Phase 2 상세 문서](refactoring/phase-2.md)

---

## Phase 3: features 레이어

### 전략
- **Option B** (feature별 완성): 이전 → Vitest 통합 테스트 → E2E 드래프트 순으로 feature 단위 완성
- E2E 테스트는 Phase 4 완료 후 실제 실행 (`test.describe.skip` 드래프트로 관리)
- 기존 경로는 re-export 래퍼로 하위 호환 유지

### 체크리스트
- [x] Step 0: `shared/hooks` 분리 (범용 훅 7개 이전, `useHeaderNavigation` console.log 제거)
- [x] Step 1: `features/auth` (useAuth, useVerifyEmail, EmailLoginForm — console.log 5개 제거, 테스트 12개)
- [x] Step 2: `features/search` (useSearch, useRelationKeyword, 4개 UI — console.log 1개 제거, 테스트 10개)
- [x] Step 3: `features/trip` (useTripList, useCreateTrip, useUserInfo, 4개 UI — console.log 1개 제거, 테스트 14개)
- [x] Step 4: `features/tripDetail` (useTripDetail — console.log 1개 제거, 테스트 6개)
- [x] Step 5: `features/enrollment` (useEnrollment — 테스트 4개)
- [x] Step 6: `features/bookmark` (useBookmark, useUpdateBookmark — console.log 2개 제거, 테스트 6개)
- [x] Step 7: `features/myTrip` (useMyTrip, useMyApplyTrip, useMyRequestedTrip — 테스트 6개)
- [x] Step 8: `features/comment` (useComment — dead import 제거, 테스트 3개)
- [x] Step 9: `features/community` (useCommunity — dead import 2개 제거, 테스트 3개, MSW 경로 수정)
- [x] Step 10: `features/notification` (useNotification — dead import 제거, 테스트 2개)
- [x] Step 11: `features/myPage` (useMyPage — 테스트 3개)
- [x] Step 12: `features/userProfile` (useUserProfile — 테스트 3개)

### 누계 테스트
- Step 1 완료: 159개 → 171개
- Step 2 완료: 171개 → 181개
- Step 3 완료: 181개 → 195개
- Steps 4~12 완료: 195개 → **231개** (전부 통과, 49개 테스트 파일)

### 참조
- [Phase 3 상세 문서](refactoring/phase-3.md)

---

## Phase 4: page-views / widgets 레이어

> **주의**: FSD "pages" 레이어의 실제 디렉토리명은 `page-views/`.
> Next.js가 `src/pages/`를 Pages Router로 인식하여 `app/` 라우트와 충돌하므로 `page-views/`로 명명.

### 체크리스트
- [x] `page/` → `page-views/` + `widgets/` (92개 파일, re-export 래퍼로 하위 호환 유지)
- [x] Server Component + HydrationBoundary 프리페치 (3개 라우트: /, /community, /trip/detail/[id])
- [x] E2E 테스트 전면 활성화 (`test.describe.skip` → `test.describe`, 12개 spec 파일)
- [x] Vitest 237개 통과 (신규 6개 widgets/home 테스트 포함)
- [x] `docs/refactoring/phase-4.md` 문서 작성

### 신규 FSD 레이어
- `src/widgets/home/` — TripAvailable, BookmarkContainer, TripRecommendation, ContentTitleContainer
- `src/page-views/home/` — HomePage, Navbar, Footer, CreateTripButton
- `src/page-views/community/` — CommunityPage, CreateCommunityPage, DetailCommunityPage, EditCommunityPage, MyCommunityPage
- `src/page-views/trip/` — TripDetailPage, TripListPage, TripEdit, CreateTrip 서브폴더 (30개)
- `src/page-views/myTrip/` — 8개
- `src/page-views/myPage/` — 9개
- `src/page-views/auth/` — 13개 (Login, Register)
- `src/page-views/search/` — 2개
- `src/page-views/contact/` — 6개
- `src/page-views/{notification,report,travelLog,onBoarding,userProfile,comment}/` — 나머지

### 누계 테스트
- Phase 3 완료: **231개** → Phase 4 완료: **237개** (전부 통과, 52개 테스트 파일)

### 참조
- [Phase 4 상세 문서](refactoring/phase-4.md)

---

## Phase 5: Tailwind CSS 전환 — Emotion 완전 제거

### 체크리스트
- [x] Step 0: `cn()` 유틸리티 생성, `src/styles/globalStyle.ts` 정리
- [x] Step 1: `src/components/` 범용 UI 21개 → `src/shared/ui/` 이동 + Tailwind 전환
- [x] Step 2: `components/community/` → `features/community/ui/` 이동 + Tailwind 전환
- [x] Step 3: `components/userProfile/`, `components/ApplyTripProfile`, `components/LoginButtonForGuest` 등 → `features/auth/ui/`, `features/userProfile/ui/`
- [x] Step 4: `components/notification/`, `components/comment/`, `components/travellog/` → 각 features/*/ui/
- [x] Step 5: `components/RegionModal`, `TripRegion`, `MapBottomModal`, `calendar/`, `HomeInputField` → `features/trip/ui/`, `page-views/home/`
- [x] Step 6: `features/auth/ui/EmailLoginForm`, `features/search/ui/` 4개, `features/trip/ui/` 4개 — Tailwind 전환
- [x] Step 7: `widgets/home/` 4개 — Tailwind 전환
- [x] Step 8: `page-views/home/`, `page-views/auth/` — Tailwind 전환
- [x] Step 9: `page-views/community/` — Tailwind 전환
- [x] Step 10: `page-views/trip/` (+ create/) — Tailwind 전환
- [x] Step 11: `page-views/myTrip/`, `page-views/myPage/` — Tailwind 전환
- [x] Step 12: `page-views/contact/`, `notification/`, `report/`, `onBoarding/`, `userProfile/`, `search/`, `comment/`, `BlockPage`, `ExplanationPage`, `SplashPage` — Tailwind 전환
- [x] Step 13: 최종 정리 — Emotion 3개 패키지 uninstall, `RootStyleRegistry.tsx` 삭제, `src/styles/` 디렉토리 삭제

### 결과
- 전환 파일: **~140개** (`@emotion/styled` 사용 파일 전부)
- palette 참조 제거: **~100개+ 파일**
- 삭제 패키지: `@emotion/cache`, `@emotion/react`, `@emotion/styled`
- 삭제 파일: `RootStyleRegistry.tsx`, `globalStyle.ts`, `palette.ts`, `src/styles/` 디렉토리
- console.log 제거: 40개+ (각 단계에서 순차 제거)
- TypeScript: 에러 0개
- Vitest: **228개 통과** (52개 테스트 파일, 3 suite는 `next-view-transitions` 기존 이슈)
- Phase 6 완료 시점: **273개 통과** (56개 테스트 파일, 에러 핸들링 45개 추가)

### 참조
- [Phase 5 상세 문서](refactoring/phase-5.md)
- [ADR 001: Tailwind 전환 결정](decisions/001-tailwind.md)

---

## Phase 6: 유저 플로우 개선 — Auth (진행 중 🔄)

> **목표**: Auth 플로우를 기준으로 E2E 베이스라인 측정 → UX/접근성 개선 → 수치 비교

### 현재 상태 (2026-03-28 기준)

**완료**
- [x] E2E auth 테스트 스펙 32개 작성 (`e2e/auth.spec.ts`)
  - 이메일 로그인 7개, 로그아웃 1개, 이메일 회원가입 10개, OAuth 7개, axe 5개, 성능 2개
- [x] Playwright MSW 연동 설정 (`playwright.config.ts` dual webServer)
  - MSW Express 서버 (포트 9090) → Next.js rewrite (`API_BASE_URL`) → 프록시
- [x] Auth MSW 핸들러 작성 (`src/test/msw/handlers/auth.ts`)
- [x] `docs/baseline/auth-baseline.md` 작성
  - `/login`, `/registerEmail` axe 측정 완료 (각 3건 위반)
  - `/login`, `/registerEmail` 성능 측정 완료
- [x] react-hook-form + zod 전환 (Auth 폼 9개, `zodResolver` 직접 구현)
- [x] 성능 최적화 — FCP 4.7s → 0.8s (`next/font`, AppShell 분리, Maps/GTM 중복 제거)
- [x] ErrorPolicy 기반 에러 핸들링 라이브러리 + TDD (45개 테스트)
- [x] **Stateful Mock 서버 구축** (`src/mocks/db/store.ts` + `src/mocks/routes/` 4개 파일, 1533줄)
- [x] OAuth 버튼 `aria-label` 추가 (네이버/카카오/구글로 로그인 — `LoginActions.tsx`)
- [x] 로그인 인터셉터 버그 수정 (`axiosInstance` — 401 로그인 실패 시 refresh 시도하던 문제)
- [x] OauthGoogle/Kakao/Naver FSD 경로 정리 + zodResolver/useNfcField/createMutationOptions 코드 리뷰 개선

- [x] `alert()` → WarningToast 교체 (`RegisterTripStyle.tsx`)
- [x] 페이지 `<title>` — `/login`, `/registerEmail`, `/verifyEmail`, `/registerPassword` metadata 추가
- [x] `OAuthTokenResponse` 타입 정의 + `any` 제거 (OauthGoogle/Kakao/Naver)
- [x] Terms 버튼 `aria-label` + `aria-pressed` (이미 완료 확인)

**잔여 TODO**
- [x] `color-contrast` 위반 색상 수정 — --color-text-muted/muted2 다크닝, InfoText/EmailLoginForm 하드코딩 제거
- [x] `/verifyEmail`, `/registerPassword` axe 측정 → baseline 완성 (전 페이지 "위반 없음 ✓")
- [x] ValidationInputField forwardRef 수정 — RHF ref 연결 버그 해소, E2E 테스트 안정화
- [ ] RegisterDone 자동 로그인 (백엔드 협의 필요)

### 참조
- [Auth 베이스라인 문서](../baseline/auth-baseline.md)
- [Phase 6 상세 문서](refactoring/phase-6.md)
