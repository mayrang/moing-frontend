# Auth 플로우 — 개선 전 베이스라인

> **측정일**: 2026-03-25
> **측정 방법**: Playwright E2E + `@axe-core/playwright` (WCAG 2.1 AA)
> **목적**: 유저 플로우 개선 작업 착수 전 수치를 기록하여, 개선 후 효과를 정량적으로 비교한다.

---

## 1. E2E 테스트 커버리지

### Phase 4까지의 Draft 상태 (개선 전)

| 시나리오 | 테스트 수 | 상태 |
|----------|-----------|------|
| 이메일 로그인 | 4개 | Draft |
| 로그아웃 | 1개 | Draft (TODO 미완성) |
| 이메일 회원가입 | 0개 | 미작성 |
| OAuth 콜백 | 0개 | 미작성 |

### Phase 6 (auth 개선) 이후 목표

| 시나리오 | 테스트 수 | 상태 |
|----------|-----------|------|
| 이메일 로그인 | 7개 | ✅ 작성 완료 |
| 로그아웃 | 1개 | ✅ 작성 완료 |
| 이메일 회원가입 (8단계) | 10개 | ✅ 작성 완료 |
| OAuth 콜백 (Google/Kakao/Naver) | 7개 | ✅ 작성 완료 |
| 접근성 axe 검사 | 5개 | ✅ 작성 완료 |
| 성능 측정 | 2개 | ✅ 작성 완료 |

---

## 2. 접근성 베이스라인 (axe WCAG 2.1 AA)

> **실측일**: 2026-03-25
> **측정 명령**: `yarn test:e2e --project=chromium e2e/auth.spec.ts --grep 접근성`
> **측정 환경**: Chromium Headless Shell (Desktop), Next.js dev server localhost:8080

### /login (로그인 페이지) — ✅ 측정 완료

| 위반 항목 | impact | 설명 | 영향 요소 수 |
|-----------|--------|------|-------------|
| `button-name` | **critical** | 버튼에 식별 가능한 텍스트 없음 | **3개** (네이버/카카오/구글 아이콘 버튼) |
| `color-contrast` | **serious** | 전경/배경 대비율이 WCAG 2 AA 기준 미달 | **2개** |
| `document-title` | **serious** | HTML `<title>` 요소가 비어있음 | **1개** |

**총 위반: 3건 (critical 1, serious 2)**

---

### /registerEmail — 약관 모달 상태 — ✅ 측정 완료

| 위반 항목 | impact | 설명 | 영향 요소 수 |
|-----------|--------|------|-------------|
| `button-name` | **critical** | 버튼에 식별 가능한 텍스트 없음 | **4개** (X버튼, 체크박스 버튼 2개 등) |
| `color-contrast` | **serious** | 전경/배경 대비율이 WCAG 2 AA 기준 미달 | **5개** |
| `document-title` | **serious** | HTML `<title>` 요소가 비어있음 | **1개** |

**총 위반: 3건 (critical 1, serious 2)**

---

### /verifyEmail (이메일 인증) — ⚠️ 측정 실패

- **원인**: E2E 플로우 중 API mock 응답 처리 타이밍 이슈로 `/registerEmail`에서 `/verifyEmail`로 이동하지 못함
- **후속 조치**: `checkEmail` API URL 패턴 및 응답 구조 확인 후 테스트 수정 필요
- **예상 위반**: `CodeInput` aria-label이 `shared/ui`에는 적용됐으나, `VerifyEmail.tsx`가 구 경로(`@/components/designSystem/input/CodeInput`)를 import → re-export 래퍼 통해 `shared/ui`로 연결됨. 실제 접근성은 양호할 가능성 있음.

---

### /registerPassword (비밀번호 등록) — ⚠️ 측정 실패

- **원인**: `/verifyEmail` 접근 실패로 연쇄 실패
- **후속 조치**: verifyEmail 테스트 수정 후 재측정

---

### 접근성 총 요약

| 페이지 | 총 위반 | critical | serious | moderate |
|--------|---------|----------|---------|----------|
| /login | 3 | 1 | 2 | 0 |
| /registerEmail (모달) | 3 | 1 | 2 | 0 |
| /verifyEmail | 미측정 | - | - | - |
| /registerPassword | 미측정 | - | - | - |
| **합계 (측정된 것)** | **6** | **2** | **4** | **0** |

**공통 위반 패턴:**
- `button-name`: 아이콘 전용 버튼에 `aria-label` 미적용 (OAuth 버튼, Terms 체크/닫기 버튼)
- `color-contrast`: CSS 변수 기반 색상의 대비율 미달
- `document-title`: 모든 페이지에 `<title>` 태그 없음

---

## 3. 성능 베이스라인

> **실측일**: 2026-03-25
> **측정 명령**: `yarn test:e2e --project=chromium e2e/auth.spec.ts --grep 성능`
> **측정 환경**: Chromium (Desktop), Next.js dev server localhost:8080, `waitUntil: 'networkidle'`
> **주의**: dev 서버 + cold start 기준. production 빌드 후 별도 측정 필요.

### /login — ✅ 측정 완료

| 지표 | 측정값 | 비고 | 목표 (개선 후) |
|------|--------|------|---------------|
| TTFB | **1,204ms** | 🔴 높음 (dev cold start + token refresh 요청) | < 500ms |
| FCP | **1,240ms** | 🟡 | < 1,500ms |
| DOMContentLoaded | **1,235ms** | 🟡 | < 1,500ms |
| Load | **1,802ms** | 🟡 | < 2,500ms |

> `/login` 첫 로드 시 `POST /api/token/refresh` 요청이 발생하여 TTFB가 크게 높아짐. 백엔드 서버 미연결로 ECONNREFUSED 발생 → 이것이 1,200ms 지연의 주요 원인으로 추정.

### /registerEmail — ✅ 측정 완료

| 지표 | 측정값 | 비고 | 목표 (개선 후) |
|------|--------|------|---------------|
| TTFB | **309ms** | 🟢 양호 | < 300ms |
| FCP | **380ms** | 🟢 양호 | < 800ms |
| DOMContentLoaded | **383ms** | 🟢 양호 | < 800ms |
| Load | **899ms** | 🟢 양호 | < 1,500ms |

> `/login`과 달리 token refresh 요청 없이 로드되므로 성능 양호.

---

## 4. 코드 품질 현황 (개선 전)

> 정적 분석 결과 — 소스 코드 직접 리뷰 기반

### 알려진 문제

| 분류 | 항목 | 파일 | 설명 |
|------|------|------|------|
| UX | `alert()` 사용 | `OauthGoogle.tsx:33,38` | 브라우저 기본 alert → shared/ui 모달로 교체 필요 |
| UX | `alert()` 사용 | `OauthKakao.tsx` | 동일 |
| UX | `alert()` 사용 | `OauthNaver.tsx` | 동일 |
| UX | `alert()` 사용 | `RegisterTripStyle.tsx` | 소셜 가입 에러 alert |
| 접근성 | OAuth 버튼 레이블 없음 | `Login.tsx:45,52,59` | 아이콘만 있는 버튼 — aria-label 없음 |
| 접근성 | Terms 체크박스 레이블 | `Terms.tsx` | CheckIcon에 연결된 레이블 없음 |
| 타입 | `any` 타입 | `OauthGoogle.tsx:21` | `getToken` 응답에 `user: any` 사용 |
| 타입 | `any` 타입 | `OauthKakao.tsx`, `OauthNaver.tsx` | 동일 |
| 인라인 스타일 | style 속성 | `EmailLoginForm.tsx:141` | `style={{ color: '#848484' }}` |
| 인라인 스타일 | style 속성 | `RegisterName.tsx:68` | `style={{ marginTop: '14px' }}` |
| 구 경로 | `@/api/user` import | `Login.tsx:2` | entities 경로로 미이전 |
| 구 경로 | `@/hooks/useVerifyEmail` | `RegisterEmail.tsx:13` | features 경로로 미이전 |
| 구 경로 | `@/hooks/user/useAuth` | `RegisterTripStyle.tsx:6` | features 경로로 미이전 |
| 레이어 위반 | `@/components/*` | `RegisterEmail.tsx:4,8,12` | page-views에서 구 components 직접 참조 |

---

## 5. 유저 플로우 개선 포인트

> 코드 분석에서 발견한 UX 개선 기회

| # | 문제 | 현재 동작 | 개선 방향 |
|---|------|-----------|-----------|
| 1 | RegisterDone 자동 로그인 없음 | 2초 후 `/login`으로 이동 → 다시 로그인 필요 | 백엔드 협의 후 가입 완료 시 자동 로그인 처리 |
| 2 | 네이버 신규 가입 미지원 | PENDING 시 alert + 로그인 리다이렉트 | 명확한 안내 메시지 UI 필요 |
| 3 | OAuth 에러 처리 | `alert()` 사용 | Toast 또는 에러 페이지로 교체 |
| 4 | RegisterPassword — Kakao 분기 | Kakao 플로우에서 비밀번호 페이지 진입 시 빈 화면 표시 | 리다이렉트 처리 명확화 |
| 5 | Terms 모달 접근성 | focus trap 없음, ESC 키 미지원 | BaseModal 패턴 적용 |

---

## 6. E2E 테스트 실패 항목 및 원인

| 테스트 | 실패 원인 | 수정 방향 |
|--------|-----------|-----------|
| 이메일 인증 페이지 접근성 검사 | `checkEmail` API mock(`**/api/users-email*`) 응답 후 `verifyEmailSend` 비동기 타이밍 이슈로 페이지 전환 안 됨 | `checkEmail` 실제 axios URL 확인, `waitForURL` 타임아웃 연장 |
| 비밀번호 등록 페이지 접근성 검사 | 위와 동일 (연쇄 실패) | 동일 |
| `getByLabel('1번째 숫자')` 타임아웃 | `/verifyEmail` 미진입으로 CodeInput이 렌더링되지 않음 | 위 수정 후 해결됨 |

---

## 7. 다음 단계 (개선 계획)

베이스라인 수치 확정 완료. 개선 작업 순서:

- [x] axe 실측값 기록 (/login, /registerEmail 완료)
- [x] 성능 실측값 기록 (/login, /registerEmail 완료)
- [ ] E2E 테스트 selector 수정 (verifyEmail 플로우 진입 실패 수정)
- [ ] `/verifyEmail`, `/registerPassword` axe 재측정
- [ ] **접근성 개선**: OAuth 버튼 3개에 `aria-label` 추가 (`Login.tsx`)
- [ ] **접근성 개선**: Terms 모달 버튼 `aria-label` 추가 (X버튼, 체크박스 버튼)
- [ ] **접근성 개선**: `<title>` 태그 각 페이지 추가 (Next.js `metadata` export)
- [ ] **접근성 개선**: `color-contrast` 위반 색상 수정
- [ ] **UX 개선**: `alert()` → Toast/모달 교체 (OauthGoogle, OauthKakao, OauthNaver)
- [ ] **코드 품질**: 구 경로 import 정리 (Login.tsx, RegisterEmail.tsx 등)
- [ ] RegisterDone 자동 로그인 (백엔드 협의 필요)
