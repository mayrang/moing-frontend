# Phase 2: entities 레이어 구축

> 이 문서는 블로그/이력서 작성 재료입니다. 기술적 판단 근거와 트러블슈팅 과정을 상세히 기록합니다.

## 1. 배경 및 문제 정의

### Phase 1 잔여물

Phase 1 완료 직후 발견된 3가지 잔여 문제가 있었다.

**크로스 레이어 의존성**: `shared/ui` 내 10개 파일이 `@/components/icons/`를 직접 import하고 있었다. FSD에서 `shared` 레이어는 다른 레이어에 의존할 수 없는데, `components/`는 아직 FSD 외부의 레거시 폴더다.

```ts
// 위반 예시 (shared → legacy components)
import UpArrowIcon from '@/components/icons/UpArrowIcon';
```

**barrel export 없음**: `shared/ui/`에 `index.ts`가 없어 `import { Button } from '@/shared/ui'` 같은 FSD 표준 임포트가 불가능했다.

**jest-axe 누락**: Phase 1.5에서 접근성 속성은 추가했지만, 27개 테스트 파일 중 25개에 `jest-axe` 자동 검사가 없었다.

### entities 레이어 부재

Phase 2의 핵심 문제는 도메인 타입과 API 함수가 FSD 구조 밖에 있다는 것이었다.

```
Before:
src/model/    ← FSD 외부 (도메인 타입 14개 파일, 385줄)
src/api/      ← FSD 외부 (도메인 API 17개 파일, 1,232줄)
src/shared/api/  ← 비어있음 (.gitkeep)
src/entities/    ← 비어있음 (.gitkeep)
```

**문제점:**
- `shared/api/`에 axios 인스턴스가 없어 모든 도메인 API 파일이 `from "."` (api/index.ts)로 상대 import
- `console.log` 5개가 API 레이어에 남아 있음 (CLAUDE.md 금지 사항)
- 도메인 타입과 API가 같은 레이어에서 섞여 있어 레이어 경계 불분명

---

## 2. 선택지와 의사결정

### entities 이전 전략: Option A vs Option B

Phase 2에서 가장 중요한 결정은 **entities와 features를 지금 나눌 것인가**였다.

| 옵션 | 설명 | 장점 | 단점 | 선택 |
|------|------|------|------|------|
| **Option A** | 모든 API/타입을 일단 entities로 이전, Phase 3에서 entity/feature 경계 확정 | 빠름, 하위 호환 유지, Phase 3 리팩토링 시 임포트 경로 재검토 | entities에 feature성 API가 섞임 | ✅ |
| **Option B** | 처음부터 entity/feature 분리 (공유 여부로 판단) | 더 정확한 구조 | Phase 3 전 feature 레이어 작업이 필요, 범위 폭발 | ❌ |

**결정 근거**: 현재 `hooks/`와 `page/`가 `api/`를 직접 참조하고 있어, Phase 3(feature) 진행 시 어차피 임포트 경로를 재검토하게 된다. 지금 단계에서 entity/feature 경계를 확정하려면 `hooks/`와 `page/`를 동시에 분석해야 하므로 범위가 2배 이상 커진다.

> **FSD entity vs feature 핵심 기준**: "이 타입/API를 2개 이상의 feature에서 쓰나?" → entity. "이 시나리오에서만 쓰나?" → feature.

### shared/api 분리 전략

`axiosInstance`를 `shared/api/`로 이전하되, 기존 17개 도메인 파일의 `from "."` import를 건드리지 않기 위해 `src/api/index.ts`를 re-export 래퍼로 교체했다.

```ts
// 변경 전: src/api/index.ts (구현)
export const axiosInstance = axios.create({ ... });

// 변경 후: src/api/index.ts (re-export만)
export { axiosInstance, handleApiResponse, type ApiResponse } from '@/shared/api';
```

---

## 3. 구현 과정

### 3-1. Phase 1 잔여물 정리

**icons 이전 (`shared/ui/icons/`)**

`shared/ui` 내 10개 컴포넌트가 의존하는 아이콘을 `shared/ui/icons/`로 복사했다. 레거시 `components/icons/`는 삭제하지 않고 유지 (다른 레거시 코드가 아직 의존).

```
src/shared/ui/icons/
├── CheckIcon.tsx
├── XIcon.tsx
├── UpArrowIcon.tsx
├── Warning.tsx
├── ResetIcon.tsx
├── RightVector.tsx
├── InfoIcon.tsx
├── EmptyHeartIcon.tsx
├── FullHeartIcon.tsx
└── SelectArrow.tsx
```

**barrel export 생성**

```ts
// src/shared/ui/index.ts
export * from './button';
export * from './input';
export * from './modal';
export * from './toast';
export * from './badge';
export * from './select';
export * from './tag';
export * from './text';
export * from './profile';
```

이후 `import { Button, Select, BaseModal } from '@/shared/ui'` 형태로 사용 가능.

**jest-axe 전체 적용**

25개 테스트 파일에 axe 검사를 추가하는 과정에서 실제 WCAG 위반 13개가 발견됐다. (트러블슈팅 섹션 참조)

### 3-2. shared/api 구성

```
src/shared/api/
├── axiosInstance.ts    ← axios 인스턴스 + token refresh interceptor
├── handleApiResponse.ts ← 응답 처리 함수 + ApiResponse 인터페이스
└── index.ts            ← barrel export
```

`console.log` 4개 제거 (CLAUDE.md 규칙 준수):
- `console.log("error console", error)` → 제거
- `console.log("new AccessToken", ...)` → 제거
- `console.log("response", response)` in handleApiResponse → 제거

### 3-3. shared/types 구성

```
src/shared/types/
├── error.ts    ← RequestErrorType
└── index.ts    ← barrel export
```

### 3-4. entities 16개 도메인 이전

각 도메인마다 동일한 구조로 생성:

```
entities/{domain}/
├── model.ts    ← 도메인 타입 (model/{domain}.ts에서 이전)
├── api.ts      ← API 함수 (api/{domain}.ts에서 이전), @/shared/api import
└── index.ts    ← public API barrel
```

이전된 도메인 목록:

| 도메인 | model | api 함수 수 | 비고 |
|--------|-------|------------|------|
| contact | IContactCreate | 1 | |
| notification | INotificationContent, INotification | 1 | |
| bookmark | — | 3 | 불필요 import 제거 (ITripList, daysAgo, dayjs) |
| report | PostReport | 2 | console.log 2개 제거 |
| translation | — | 1 | |
| requestedTrip | — | 2 | |
| enrollment | IPostEnrollment | 7 | |
| comment | ICommentPost, IComment, ICommentList | 6 | |
| myTrip | IMyTripList | 3 | |
| search | IContent, ISearchData, **Filters** | 2 | Filters 레이어 위반 해소 |
| user | IRegisterEmail/Google/Kakao, TravelLog | 7 | auth.ts + profile.ts 통합 |
| userProfile | IUserProfileInfo, IUserRelatedTravel | 3 | |
| trip | ITripList, CreateTripReqData, UpdateTripReqData | 5 | home.ts API 병합 |
| tripDetail | ITripDetail | 5 | |
| community | IListParams, PostCommunity, Community 등 | 12 | IListParams 레이어 위반 해소 |
| myPage | ImyPage, IProfileImg, NewPasswordProps | 13 | console.log 3개 제거 |

---

## 4. Before / After 비교

### 구조 변화

```
Before:
src/
├── model/        (14개 파일, FSD 외부)
├── api/          (17개 파일, FSD 외부)
├── shared/api/   (.gitkeep, 비어있음)
├── shared/types/ (.gitkeep, 비어있음)
└── entities/     (.gitkeep, 비어있음)

After:
src/
├── model/        (14개 파일, re-export 래퍼로 교체 → 하위 호환)
├── api/          (17개 파일, re-export 래퍼로 교체 → 하위 호환)
├── shared/api/   (axiosInstance.ts, handleApiResponse.ts, index.ts)
├── shared/types/ (error.ts, index.ts)
└── entities/     (16개 도메인 × 3파일 = 48개 파일)
```

### 수치 비교

| 지표 | Before | After |
|------|--------|-------|
| FSD 준수 파일 | 0개 (model/, api/ 모두 외부) | 48개 (entities/) |
| shared/api | 없음 | axiosInstance + handleApiResponse |
| console.log 위반 | 9개 | 0개 |
| 테스트 | 134개 | **159개** (+25개 jest-axe) |
| 크로스 레이어 의존성 (shared→legacy) | 10개 | 0개 |

---

## 5. 트러블슈팅

### 문제 1: jest-axe에서 WCAG 위반 13개 발견

jest-axe를 전체 적용하자 첫 실행에서 13개 테스트가 실패했다.

**발견된 위반 목록:**

| 컴포넌트 | axe rule | 원인 | 수정 |
|---------|----------|------|------|
| Select | `button-name` | combobox에 접근성 이름 없음 | `aria-label` prop 추가 |
| Select | `nested-interactive` | `<li role="option">` 안에 `<button>` | 내부 button 제거, li 자체를 interactive로 |
| CheckingModal, NoticeModal, ResultModal | `aria-dialog-name` | dialog에 접근성 이름 없음 | `labelId` + 제목 `id` 연결 |
| EditAndDeleteModal, ReportModal | `aria-dialog-name` | BottomSheetModal에 이름 없음 | `aria-label` prop 지원 추가 |
| CommentInput | `button-name` | 아이콘 전용 submit 버튼 | `aria-label="댓글 등록"` 추가 |
| TextareaField | `aria-hidden-focus` | aria-hidden 요소가 tabIndex 갖고 있음 | clone textarea에 `tabIndex={-1}` 추가 |

### 문제 2: jest-axe + fake timer 충돌

`BaseToast`, `ErrorToast`의 테스트에서 `vi.useFakeTimers()`를 쓰고 있었는데, axe 내부에서도 `setTimeout`을 사용해 테스트가 타임아웃으로 실패했다.

```ts
// 해결: axe 테스트 직전에 real timer로 복귀
it('접근성 위반이 없어야 한다', async () => {
  vi.useRealTimers(); // axe 내부 setTimeout과 fake timer 충돌 방지
  const { container } = render(<BaseToast {...baseProps} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 문제 3: cross-layer 의존성 — Filters, IListParams

`search/api.ts`에서 `Filters` 타입을 `@/hooks/search/useSearch`에서 import했고, `community/api.ts`에서 `IListParams`를 `@/hooks/useCommunity`에서 import했다. FSD에서 entities는 hooks(feature)를 import할 수 없다.

**해결**: 두 타입을 각각의 entity model로 이전하고, hook 파일에서 re-export:

```ts
// entities/search/model.ts에 Filters 정의
export interface Filters { tags: string[]; ... }

// hooks/search/useSearch.ts
import { Filters } from '@/entities/search';
export type { Filters }; // 기존 소비자를 위해 re-export 유지
```

---

## 6. 결과 및 수치

- **생성 파일**: 48개 (entities 16도메인 × 3) + 5개 (shared/api, shared/types) + 11개 (shared/ui/icons) + 1개 (shared/ui/index.ts) = **65개**
- **수정 파일**: 31개 (api/ re-export), 14개 (model/ re-export), 2개 (hooks 레이어 위반 수정)
- **제거된 console.log**: 9개
- **제거된 크로스 레이어 의존성**: 12개 (icons 10 + Filters 1 + IListParams 1)
- **테스트**: 134개 → **159개** (전부 통과)

---

## 7. 회고 / 배운 점

### 잔여물 관리의 중요성

Phase 1이 "완료"됐다고 생각했지만, 크로스 레이어 의존성이 10개 남아 있었다. Phase 전환 전에 명시적인 체크리스트로 잔여물을 확인하는 것이 필요하다.

### re-export 전략의 가치

`src/api/index.ts` → `@/shared/api` re-export 패턴 덕분에 17개 도메인 파일을 한 줄도 건드리지 않고 axiosInstance를 FSD 안으로 이전할 수 있었다. 대규모 리팩토링에서 하위 호환을 유지하면서 점진적으로 이전하는 핵심 패턴이다.

### FSD entity/feature 경계는 나중에 확정해도 된다

현재 API 함수가 entity성인지 feature성인지 판단하기 어려운 경우가 있었다. 일단 entity로 이전하고, Phase 3(features)에서 hooks를 보면서 "이 API가 정말 여러 feature에서 공유되는가"를 판단하는 것이 실용적이다. 아키텍처 결정은 충분한 맥락이 생긴 시점에 내리는 것이 더 정확하다.

### axe는 코드 품질 도구다

jest-axe를 테스트에 추가하자마자 13개의 실제 WCAG 위반이 발견됐다. 이 중 `nested-interactive`(li 안에 button) 같은 건 수동 코드 리뷰로도 놓치기 쉬운 구조적 문제였다. 접근성 테스트는 UI 품질의 안전망이다.
