# Phase 4: page-views / widgets 레이어 구축

## 1. 배경 / 문제 정의

### Before 상태

Phase 3 완료 시점의 프로젝트 구조:

```
src/
├── app/          ← Next.js App Router (라우팅)
├── features/     ← FSD features 레이어 (Phase 3 완료)
├── entities/     ← FSD entities 레이어 (Phase 2 완료)
├── shared/       ← FSD shared 레이어 (Phase 1 완료)
└── page/         ← 92개 파일 — FSD 외부에 방치된 채로 존재
    ├── Home/     (8개)
    ├── Community/(4개)
    ├── TripDetail/(5개)
    ├── CreateTrip/(20개)
    ├── TripList/ (1개)
    ...
```

**문제점:**
1. `src/page/` 92개 파일이 FSD 구조 밖에 존재 → 레이어 규칙 위반
2. `app/page.tsx` (Server Component)가 HydrationBoundary 없이 Client Component를 직접 렌더링 → 초기 렌더 시 로딩 스피너 발생
3. E2E 테스트 전체가 `test.describe.skip`으로 비활성화 상태 → 테스트 커버리지 없음

---

## 2. 선택지와 의사결정

### 2-1. page-views vs widgets 분류 기준

| 레이어 | 기준 | 채택 이유 |
|--------|------|-----------|
| `page-views/` | 여러 feature/widget을 조합하는 페이지 진입점 | 도메인별 묶음, 라우팅 1:1 대응 |
| `widgets/` | 홈 화면에서 독립 데이터를 가진 섹션 블록 | 재사용 가능성, 자체 API 호출 보유 |

> **왜 `pages/`가 아닌 `page-views/`인가?**
> FSD 표준 레이어명은 `pages/`이지만, Next.js App Router 프로젝트에서 `src/pages/` 디렉토리를 생성하면 **Pages Router로 해석**되어 `src/app/` 라우팅과 충돌한다. 실제로 `pages/community/index.ts` 생성 후 빌드하자 `app/community/page.tsx`와 라우트 충돌 오류가 발생했다. `page-views/`로 이름을 변경해 FSD 레이어 의미는 유지하면서 Next.js 충돌을 회피했다.

**widgets 대상:** `TripAvailable`, `BookmarkContainer`, `TripRecommendation`, `ContentTitleContainer` — 홈 섹션 블록으로 독립 데이터 페칭을 수행하므로 widget으로 분류.

### 2-2. Server Component 프리페치 전략

**선택: HydrationBoundary 패턴 (Option A)**

```
Server Component (app/page.tsx)
  └── prefetchInfiniteQuery ← 서버에서 첫 페이지 데이터 패치
      └── HydrationBoundary
              └── <HomePage /> (Client Component — 코드 변경 없음)
```

**근거:**
- Client Component 훅 코드를 수정하지 않아도 됨 (React Query 캐시 자동 활용)
- `availableTrips`, `tripRecommendation`은 토큰 없이도 조회 가능 → 서버 프리페치 적합
- `bookmarks`는 인증 토큰 필요 → 서버 프리페치 불가, 클라이언트 유지

### 2-3. 하위 호환 전략

Phase 3와 동일하게 **re-export 래퍼 패턴** 유지:
- 새 위치(`page-views/`, `widgets/`)에 실제 코드 이전
- 원본(`page/`) 파일은 re-export 래퍼로 교체 → `app/` 라우팅 파일 수정 없음

---

## 3. 구현 과정

### Step 0: 디렉토리 스캐폴딩

```bash
mkdir -p src/widgets/home
mkdir -p src/page-views/{home,community,trip/create,myTrip,myPage,auth,search,contact,notification,report,travelLog,onBoarding,userProfile,comment}
```

### Step 1: widgets/home (3 widgets + ContentTitleContainer)

이전 파일:
- `page/Home/ContentTitleContainer.tsx` → `widgets/home/ContentTitleContainer.tsx`
- `page/Home/TripAvailable.tsx` → `widgets/home/TripAvailable.tsx`
- `page/Home/BookmarkContainer.tsx` → `widgets/home/BookmarkContainer.tsx`
- `page/Home/TripRecommendation.tsx` → `widgets/home/TripRecommendation.tsx`

**상대 import 업데이트:**
```ts
// Before (widgets/home/TripAvailable.tsx)
import TitleContainer from "./ContentTitleContainer";

// After
import TitleContainer from "@/widgets/home/ContentTitleContainer";
```

### Step 2: app/page.tsx HydrationBoundary 추가

```tsx
// Before
export default async function HomePage() {
  return <Home />;
}

// After
export default async function Page() {
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchInfiniteQuery({ queryKey: ['availableTrips'], ... }),
    queryClient.prefetchInfiniteQuery({ queryKey: ['tripRecommendation'], ... }),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePage />
    </HydrationBoundary>
  );
}
```

**효과:** 초기 렌더 시 서버에서 여행 목록 데이터를 미리 패치 → 클라이언트 도달 시 즉시 화면 표시.

### Step 3~7: 나머지 page-views/ 도메인별 이전

| 도메인 | 원본 파일 수 | 이전 위치 |
|--------|-------------|-----------|
| community | 4개 | page-views/community/ |
| trip (TripDetail+TripList+TripAcceptance+CreateTrip) | 30개 | page-views/trip/ |
| myTrip | 8개 | page-views/myTrip/ |
| myPage | 9개 | page-views/myPage/ |
| auth (Login+Register) | 13개 | page-views/auth/ |
| search | 2개 | page-views/search/ |
| contact | 6개 | page-views/contact/ |
| notification | 1개 | page-views/notification/ |
| report | 2개 | page-views/report/ |
| travelLog | 1개 | page-views/travelLog/ |
| onBoarding | 1개 | page-views/onBoarding/ |
| userProfile | 1개 | page-views/userProfile/ |
| comment | 1개 | page-views/comment/ |
| 기타 (Block, Splash, Explanation) | 3개 | page-views/ |

### Step 8: E2E 활성화

```bash
python3 -c "
import glob
for f in glob.glob('e2e/*.spec.ts'):
    content = open(f).read()
    open(f, 'w').write(content.replace('test.describe.skip(', 'test.describe('))
"
```

> macOS의 `sed`가 일부 파일에서 멀티바이트 문자로 인해 치환을 실패하는 경우가 있어 Python으로 대체했다.

---

## 4. Before / After 비교

### FSD 구조

**Before (Phase 3 완료 시)**
```
src/
├── app/       ← 라우팅
├── page/      ← 92개 파일 (FSD 외부)
├── features/  ← Phase 3
├── entities/  ← Phase 2
└── shared/    ← Phase 1
```

**After (Phase 4 완료)**
```
src/
├── app/          ← 라우팅만 (HydrationBoundary 추가)
├── page-views/   ← 페이지 조합 레이어 (새로 구축, FSD pages 레이어에 대응)
│   ├── home/
│   ├── community/
│   ├── trip/
│   ├── myTrip/
│   ├── myPage/
│   ├── auth/
│   ├── search/
│   ├── contact/
│   ├── notification/
│   ├── report/
│   ├── travelLog/
│   ├── onBoarding/
│   ├── userProfile/
│   └── comment/
├── widgets/      ← 독립 섹션 블록 레이어 (새로 구축)
│   └── home/     (TripAvailable, BookmarkContainer, TripRecommendation)
├── page/         ← re-export 래퍼만 남음 (하위 호환)
├── features/
├── entities/
└── shared/
```

### app/community/page.tsx

**Before**
```tsx
import Community from "@/page/Community/Community";
const CommunityPage = () => <Community />;
export default CommunityPage;
```

**After**
```tsx
export default async function Page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["community", { categoryName: "전체", sortingTypeName: "최신순", keyword: "" }, false],
    queryFn: ({ pageParam }) => getCommunities(null, { ... page: pageParam }),
    ...
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CommunityPage />
    </HydrationBoundary>
  );
}
```

---

## 5. 결과 및 수치

| 항목 | Before | After |
|------|--------|-------|
| FSD 외부 파일 수 | 92개 (`page/`) | 0개 (모두 이전, 래퍼만 잔존) |
| FSD 레이어 완성도 | shared+entities+features | + page-views + widgets |
| HydrationBoundary 적용 | 0개 라우트 | 3개 라우트 (/, /community, /trip/detail/[id]) |
| Vitest 통과 | 225개 | 237개 (+6 widgets/home 신규, +6 기타) |
| E2E 활성화 | 0% (전부 skip) | 100% (12개 spec 파일 활성화) |

---

## 6. 트러블슈팅

### 6-1. Next.js Pages Router 충돌

**문제:** `src/pages/` 디렉토리를 생성하자 Next.js가 이를 Pages Router 진입점으로 해석, `src/app/` 라우팅과 충돌하여 빌드 오류 발생.

```
Error: You cannot have both a `pages` and `app` directory.
```

**해결:** FSD `pages/` 레이어를 `page-views/`로 이름 변경. `src/page-views/` 디렉토리는 Next.js 예약 이름이 아니므로 충돌 없음.

```bash
# 이미 생성된 src/pages/ 를 src/page-views/ 로 이동
mv src/pages src/page-views

# 소스 파일 내 @/pages/ → @/page-views/ 일괄 치환 (Python 사용)
python3 -c "
import glob
for f in glob.glob('src/**/*.ts*', recursive=True):
    content = open(f, encoding='utf-8').read()
    if '@/pages/' in content:
        open(f, 'w', encoding='utf-8').write(content.replace('@/pages/', '@/page-views/'))
"
```

### 6-2. relative import 깨짐

**문제:** `page/Home/Home.tsx`를 `page-views/home/HomePage.tsx`로 복사했을 때 `"./BookmarkContainer"` 같은 상대 경로 임포트가 깨짐.

**해결:** 복사 후 상대 경로를 절대 경로(`@/`)로 일괄 변환.
```bash
sed -i '' 's|"./BookmarkContainer"|"@/widgets/home/BookmarkContainer"|g' ...
```

### 6-3. named export vs default export 혼용

**문제:** `UserProfileBadge.tsx`가 `export function UserProfileBadge()` (named export)인데, re-export 래퍼에서 `export { UserProfileBadge as default }`로 작성 → 기존 `app/` 파일에서 named import 실패.

**해결:** re-export 래퍼를 named export 형식으로 통일:
```ts
// page/UserProfileBadge/UserProfileBadge.tsx
export { UserProfileBadge } from '@/page-views/userProfile';
```

### 6-4. ReportDetailPage의 cross-file 상대 import

**문제:** 원본 `page/Report/ReportDetail.tsx`가 `import { REPORT_LIST } from "./Report"` — 같은 폴더 내 `Report.tsx`에서 상수를 가져오는 구조. 파일명이 `ReportDetailPage.tsx`, `ReportPage.tsx`로 변경되면서 `"./Report"` 해소 불가.

**해결:** 절대 경로로 변경:
```ts
import { REPORT_LIST } from "@/page-views/report/ReportPage";
```

### 6-5. MyCommunityPage의 Navbar import

**문제:** `page/MyCommunities.tsx`가 `import Navbar from "./Home/Navbar"` — 원본 위치 기준 상대 경로. 새 위치 `page-views/community/MyCommunityPage.tsx`에서는 경로 해소 불가.

**해결:**
```ts
import Navbar from "@/page-views/home/Navbar";
```

### 6-6. macOS sed 멀티바이트 치환 실패

**문제:** macOS의 `sed -i ''`가 한글/UTF-8 문자를 포함한 파일에서 패턴 매칭을 실패하는 경우 발생. 특히 `@/pages/` 패턴이 있어도 치환이 이루어지지 않음.

**해결:** `sed` 대신 Python으로 문자열 치환:
```python
import glob
for f in glob.glob('src/**/*.ts*', recursive=True):
    content = open(f, encoding='utf-8').read()
    if '@/pages/' in content:
        open(f, 'w', encoding='utf-8').write(
            content.replace('@/pages/', '@/page-views/')
        )
```

---

## 7. 회고 / 배운 점

### 7-1. FSD는 "이동"이 아니라 "레이어 인식의 전환"

Phase 4 작업에서 핵심은 파일 이동 자체가 아니라 각 파일이 어느 레이어에 속하는지 명확히 판단하는 것이었다.

- `TripAvailable`은 왜 `page-views/`가 아닌 `widgets/`인가? → 자체 API 호출을 보유하고 홈 화면 내에서 독립적으로 동작하기 때문.
- `Navbar`는 왜 `page-views/home/`인가? → 여러 pages에서 사용하지만 공유 상태에 의존하여 shared/ui로 올리기엔 결합도가 높음.

### 7-2. re-export 래퍼의 가치

Phase 3, 4에서 일관되게 적용한 re-export 래퍼 패턴은 `app/` 라우팅 파일을 건드리지 않고도 구조를 점진적으로 개선할 수 있게 해줬다. Big Bang 리팩토링의 위험을 최소화하는 실용적 접근.

### 7-3. Server Component 프리페치의 제약

서버 컴포넌트에서 `prefetchInfiniteQuery`를 적용할 때, 인증 토큰이 Zustand 스토어(클라이언트 상태)에 있어 서버에서 접근 불가하다는 제약이 있었다. 이로 인해:
- 공개 API(`availableTrips`, `tripRecommendation`, `community`) → 서버 프리페치 가능
- 인증 필요 API(`bookmarks`) → 클라이언트 페칭 유지

향후 쿠키 기반 토큰 관리로 전환하면 인증 API도 서버 프리페치 가능.

### 7-4. Next.js 예약 디렉토리 이름 충돌

FSD 표준 레이어명(`pages/`)이 특정 프레임워크의 예약 이름과 충돌할 수 있다. 프레임워크가 특정 디렉토리 이름을 라우팅이나 컴파일 진입점으로 사용하는 경우, FSD 레이어명을 컨텍스트에 맞게 변형(`page-views/`)해야 한다. 초기 디렉토리 스캐폴딩 전에 프레임워크 예약어를 확인하는 것이 필수다.

### 7-5. 다음에 다르게 할 것

- **파일 복사 전 import 분석 자동화:** 복사 후 깨진 import를 수동으로 찾아 수정하는 작업이 반복됐다. 이를 스크립트로 자동화하면 효율 향상.
- **E2E 테스트 선행 작성:** 페이지 이동 전에 E2E 테스트를 먼저 작성하면 "이 테스트가 통과하면 이전 완료"라는 명확한 기준이 생긴다 (TDD 원칙의 E2E 적용).
- **프레임워크 예약어 사전 확인:** FSD 레이어명 결정 시 Next.js/기타 프레임워크의 예약 디렉토리 목록을 먼저 확인.
