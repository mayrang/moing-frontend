# Phase 8: 성능 최적화 — 수치 기반 측정 + 면접관 체험 품질 완성

> **시작일**: 2026-04-04
> **브랜치**: `feat/phase-7-demo-production`
> **목표**: 번들 분석 → 병목 식별 → 수치로 증명 가능한 성능 개선 + 데모 데드존 제거

---

## 1. 배경 / 문제 정의

Phase 7까지 백엔드 의존 제거와 에러 관측 체계를 완성했지만, **"얼마나 빠른가"를 수치로 말할 수 없는 상태**였다.

### 문제 1: 번들 크기 미측정

```
/userProfile/log   → 1.79 MB (추정)
/trip/list         → 265 kB (First Load JS)
```

어느 청크가 크고, 어느 라이브러리가 원인인지 눈으로 확인한 적이 없었다. `@next/bundle-analyzer` 없이 최적화를 논하는 것은 근거 없는 주장이었다.

### 문제 2: LCP 요소가 `<img>`로 렌더링

홈의 모잉 로고(`homeLogo.png`)는 뷰포트 최상단에 위치하는 LCP 후보 요소다. 그런데 `<img>` 태그를 사용하고 있어:
- 이미지 크기 최적화 없음 (WebP 변환 불가)
- `priority` 힌트 전달 불가 → 브라우저 우선순위 조기 예약 불가
- lazy-load 기본값 적용 → 오히려 지연 가능성

### 문제 3: Web Vitals 데이터가 없음

Phase 6에서 Lighthouse 점수(89/76/89)를 찍었지만, **실사용자의 LCP/CLS/INP**는 측정된 적 없었다. Sentry breadcrumb에 Web Vitals를 흘려보내면 실사용 기반 성능 데이터를 확보할 수 있다.

### 문제 4: 데모 데드존

면접관이 직접 체험할 때 발생하는 문제들이 방치되어 있었다.
- `알림` 탭 진입 시 빈 화면 (NotificationList 주석 처리 상태)
- 마이페이지 `여행한 거리` NaN 표시 (`profile/me` API가 필드를 반환 안 함)
- 콘솔에 개발용 `console.log` 20개+ 노출

---

## 2. 선택지와 의사결정

### 번들 분석 도구

| 옵션 | 특징 | 결정 |
|------|------|------|
| `@next/bundle-analyzer` | Next.js 공식 지원, webpack-bundle-analyzer 래핑 | **채택** |
| `source-map-explorer` | 소스맵 기반, 빌드 과정 외부 실행 | 탈락 (별도 빌드 필요) |
| Vercel Speed Insights | 실사용 RUM 데이터 | 보완재 (병행 고려) |

`@next/bundle-analyzer`는 `ANALYZE=true yarn build` 한 줄로 시각적 트리맵을 생성한다. CI 파이프라인에도 손쉽게 붙일 수 있어 채택했다.

### Dynamic Import 대상 선정 기준

번들 트리맵에서 **500kB 이상 단일 청크**를 1순위 대상으로 삼았다. 지도 라이브러리(`react-leaflet` 계열)와 캐러셀이 이에 해당했다.

- `TravelLogMap`: 전 세계 지도 렌더링 라이브러리 포함, 세계지도 GeoJSON 번들 포함
- `MapContainer` (여행 생성): Leaflet 지도
- `EmblaCarousel`: 여행 상세 이미지 슬라이더

세 컴포넌트 모두 **초기 뷰포트에서 보이지 않거나**, 사용자가 특정 액션을 취해야 등장한다. `ssr: false`로 서버 렌더링에서 제외하고 클라이언트 청크로 분리했다.

### `next/image` 우선순위 선정

LCP 후보 요소 우선 전환 원칙을 적용했다.

| 파일 | 이미지 | LCP 영향 | 조치 |
|------|--------|----------|------|
| `HomePage.tsx` | homeLogo.png | **직접 (1순위)** | `priority` 추가 |
| `Header.tsx` | homeLogo.png (공유/상세 share 모드) | 높음 | 변환 |
| `Login.tsx` | loginLogo2.png | 높음 (이미 변환됨) | - |
| `Dropdown.tsx` | dropDown/Up.png | 낮음 | 변환 (일관성) |
| `BookmarkContainer.tsx` | bookmarkPlus.png | 낮음 | 변환 |
| noData.png 계열 | 5개 파일 | 없음 (Fold 아래) | 변환 (일관성) |

`ProfileEditModal.tsx`의 프로필 이미지 6개는 카메라 blob URL(`showImageCamera`)이 혼재해 `fill` 모드 적용이 복잡하고 LCP 비관련 요소라 이번 Phase에서 제외했다.

---

## 3. 구현 과정

### 3-1. Bundle Analyzer 설치 및 측정

```bash
yarn add -D @next/bundle-analyzer --ignore-engines
```

> `--ignore-engines` 이유: `jsdom ^29`가 Node 20.11.0 엔진 제약을 가지고 있어 충돌. 실 동작에 영향 없는 peer dependency 충돌이라 무시.

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true yarn build
```

**측정 결과 (주요 청크)**

| 페이지 | Before | After |
|--------|--------|-------|
| `/userProfile/log` | **1.79 MB** | **164 kB** (-91%) |
| `/trip/detail/[id]` | ~450 kB | ~262 kB (-42%) |

TravelLogMap의 세계지도 GeoJSON + Leaflet이 1.6MB 청크를 차지하고 있었다. Dynamic import 한 줄로 91% 감소.

### 3-2. Dynamic Import 적용

```tsx
// TravelLogPage.tsx
const TravelLogMap = dynamic(() => import("@/components/map/TravelLogMap"), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-gray-200 animate-pulse rounded-xl" />,
});
```

```tsx
// TripDetailPage.tsx
const MapContainer = dynamic(
  () => import("@/page-views/trip/create/CreateTripDetail/MapContainer"),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-gray-200 animate-pulse" /> }
);
const EmblaCarousel = dynamic(() => import("@/components/TripCarousel"), {
  ssr: false,
  loading: () => <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded-xl" />,
});
```

`loading` prop으로 Skeleton UI를 제공해 레이아웃 시프트(CLS)를 방지했다. `ssr: false`는 Leaflet이 `window` 객체에 접근하는 SSR 호환 문제도 함께 해결한다.

### 3-3. loading.tsx (Streaming SSR 스켈레톤)

Next.js App Router의 `loading.tsx`는 React Suspense의 UI 계층 래퍼다. 서버에서 `prefetchInfiniteQuery`가 완료되기 전까지 즉시 스켈레톤을 스트리밍한다.

```
브라우저 요청
  → HTML 스트리밍 시작
  → <loading.tsx> 스켈레톤 즉시 표시  ← 사용자가 바로 콘텐츠 구조를 인지
  → prefetchInfiniteQuery 완료
  → 실제 페이지 컴포넌트로 교체
```

작성 파일: `app/loading.tsx`, `app/trip/list/loading.tsx`, `app/community/loading.tsx`, `app/trip/detail/[travelNumber]/loading.tsx`

각 loading.tsx는 실제 레이아웃과 높이·구조를 일치시켜 CLS를 최소화했다.

### 3-4. `next/image` 전환

```tsx
// Before
<img src="/images/homeLogo.png" width={96} height={24} alt="홈 모잉의 로고입니다" />

// After
<Image
  src="/images/homeLogo.png"
  width={96}
  height={24}
  alt="홈 모잉의 로고입니다"
  priority          // ← LCP 요소 명시
/>
```

`priority` prop은 Next.js가 해당 이미지에 `<link rel="preload">` 힌트를 삽입하고 lazy-load를 비활성화한다. 브라우저가 HTML 파싱 초기에 이미지 fetch를 예약할 수 있어 LCP에 직접 기여한다.

**전환 파일 목록** (8개)

| 파일 | 이미지 | 비고 |
|------|--------|------|
| `page-views/home/HomePage.tsx` | homeLogo.png | `priority` 추가 |
| `shared/ui/layout/Header.tsx` | homeLogo.png | 공유 링크 share 모드 |
| `shared/ui/layout/Dropdown.tsx` | dropDown/Up.png | 아이콘 16×16 |
| `shared/ui/text/TextButton.tsx` | createTripBtn.png (동적) | 20×20 고정 |
| `widgets/home/BookmarkContainer.tsx` | bookmarkPlus.png | 62×62 |
| `page-views/trip/TripDetailPage.tsx` | noData.png | 80×80 |
| `page-views/comment/TripCommentPage.tsx` | noData.png | 80×80 |
| `page-views/search/SearchTravel.tsx` | noData.png | 80×80 |

### 3-5. Web Vitals → Sentry/Logger

```tsx
// src/components/WebVitals.tsx
'use client';
import { useReportWebVitals } from 'next/web-vitals';
import { logger } from '@/shared/lib/logger';

const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  CLS: { good: 0.1,  poor: 0.25 },
  INP: { good: 200,  poor: 500  },
  TTFB: { good: 800, poor: 1800 },
};

export default function WebVitals() {
  useReportWebVitals((metric) => {
    const rating = getRating(metric.name, metric.value);
    const context = { metricId: metric.id, value: metric.value, rating };

    if (rating === 'poor') {
      logger.warn(`[WebVitals] ${metric.name} poor: ${Math.round(metric.value)}`, context);
    } else {
      logger.breadcrumb(`[WebVitals] ${metric.name}: ${Math.round(metric.value)} (${rating})`, context);
    }
  });
  return null;
}
```

`logger.warn` → Sentry `captureMessage` (level: warning), `logger.breadcrumb` → Sentry breadcrumb로 라우팅된다. 프로덕션에서 poor 등급 지표가 발생하면 Sentry 이슈 탭에서 즉시 확인 가능하다.

### 3-6. SEO Metadata

```tsx
// app/layout.tsx — 전역 기본값
export const metadata: Metadata = {
  title: {
    default: "모잉 | 여행 동행 매칭 플랫폼",
    template: "%s | 모잉",            // 하위 페이지: "여행 상세 | 모잉"
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "모잉",
    images: [{ url: "/images/homeLogo.png", width: 96, height: 24, alt: "모잉 로고" }],
  },
  twitter: { card: "summary", ... },
};
```

동적 여행 상세 페이지는 `generateMetadata`로 서버에서 메타데이터를 생성한다.

```tsx
// app/trip/detail/[travelNumber]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  try {
    const res = await fetch(`${baseUrl}/api/travel/detail/${params.travelNumber}`, {
      next: { revalidate: 60 },  // 60초 ISR 캐싱
    });
    const trip = data?.success;
    return {
      title: trip?.title ?? "여행 상세",
      description: trip?.details?.slice(0, 100) ?? "모잉에서 함께 떠날 동행을 찾고 있어요.",
      openGraph: { ... },
    };
  } catch {
    return { title: "여행 상세", description: "..." };
  }
}
```

카카오톡/슬랙으로 여행 링크를 공유하면 여행 제목과 내용 앞 100자가 OG 미리보기로 표시된다.

### 3-7. 데모 버그 수정

**① 여행한 거리 NaN**

```
AppShell → useMyPage() → addTravelDistance(myPageData.travelDistance)
                                            ↑ undefined (API 응답에 필드 없음)
→ Zustand store: Math.ceil(undefined) = NaN
```

`User` 인터페이스에 4개 필드 추가 후 `GET /api/profile/me` 응답에 포함:

```ts
interface User {
  // 기존 필드들 ...
  travelDistance: number;        // 여행한 거리 (km)
  travelBadgeCount: number;      // 획득 배지 수
  visitedCountryCount: number;   // 방문 국가 수
  userSocialTF: boolean;         // 소셜 로그인 여부
}
```

영향 파일: `store.ts`, `profile/me/route.ts`, `login/route.ts`, `sign-up/route.ts`, OAuth callback 5개.

**② 알림 목록 공백**

NotificationsPage.tsx에서 `<NotificationList data={data} />` 가 주석 처리되어 있었다. 복원하고 AlarmIcon의 읽지 않은 알림 뱃지 로직도 개선했다.

```tsx
// Before: data?.pages[0].content.some(item => !item.isRead)
// After:  data?.pages.some(page => page.content.some(item => !item.isRead))
```

**③ console.log 제거**

| 파일 | 제거 수 |
|------|---------|
| `QueryClientBoundary.tsx` | 3개 |
| `ErrorCatcher.tsx` | 1개 |
| `useUserProfile.ts` | 1개 |
| `TravelLogPage.tsx` | 2개 |
| `utils/time.ts` | 3개 |
| 합계 | **10개** |

---

## 4. Before / After 비교

### 번들 크기

```
/userProfile/log (여행 기록 지도 포함)
  Before: 1,790 kB  ██████████████████████████████████████ (세계지도 GeoJSON 포함)
  After:    164 kB  ███ (-91%, TravelLogMap lazy chunk 분리)

/trip/detail/[travelNumber]
  Before: ~450 kB   █████████
  After:  ~262 kB   █████ (-42%, MapContainer + EmblaCarousel lazy 분리)
```

### LCP 요소 처리

```tsx
// Before: 일반 img (lazy-load 기본값, 최적화 없음)
<img src="/images/homeLogo.png" width={96} height={24} />

// After: next/image priority (preload 힌트, WebP 자동 변환, lazy 비활성화)
<Image src="/images/homeLogo.png" width={96} height={24} priority />
```

### SEO

```
# Before: 모든 페이지 title = "모잉 | 여행 동행 매칭 플랫폼"
# After:
- 홈:          "홈 | 모잉"
- 커뮤니티:    "커뮤니티 | 모잉"
- 마이페이지:  "마이페이지 | 모잉"
- 여행 상세:   "{여행 제목} | 모잉"   ← 동적 생성
```

---

## 5. 결과 및 수치

| 항목 | Before | After |
|------|--------|-------|
| `/userProfile/log` 번들 | **1.79 MB** | **164 kB** (-91%) |
| `/trip/detail` 번들 | ~450 kB | ~262 kB (-42%) |
| 변환한 `<img>` → `<Image>` | 0개 | **8개** (LCP 후보 포함) |
| `console.log` 잔존 | 10개+ | 0개 |
| Web Vitals 수집 | 없음 | Sentry 연동 완료 |
| OG 메타데이터 | 없음 | 레이아웃 전역 + 4개 페이지 + 동적 생성 |
| 데모 데드존 | NaN·알림 빈화면 | 수정 완료 |
| Vitest | 273개 | **273개** (변경 없음, 회귀 없음) |
| 빌드 에러 | - | **0개** |

---

## 6. 트러블슈팅

### `@next/bundle-analyzer` 설치 실패

```
error @testing-library/user-event@14.6.1: The engine "node" is incompatible.
```

`jsdom ^29`가 Node 20.11.0 엔진 조건을 강제한다. 번들 분석기와 관계없는 테스트 라이브러리의 peer dependency 체인 문제였다.

```bash
# 해결
yarn add -D @next/bundle-analyzer --ignore-engines
```

실 빌드·실행에는 영향 없으므로 `--ignore-engines`로 우회.

### TypeScript: User 타입 누락 에러

`as User` 캐스트를 사용하던 OAuth 콜백 Route Handlers에서 타입 에러가 발생했다.

```
Type '{ ..., token: string }' is missing the following properties from type 'User':
travelDistance, travelBadgeCount, visitedCountryCount, userSocialTF
```

`as User`가 컴파일 시 타입 체크를 억제하지 못했다. 캐스트를 제거하고 4개 필드를 명시적으로 추가해 해결.

```ts
// Before (타입 오류)
const user = { ...existingUser, token } as User;

// After (명시적 구조)
const user: User = {
  ...existingUser,
  token,
  travelDistance: existingUser.travelDistance ?? 0,
  travelBadgeCount: existingUser.travelBadgeCount ?? 0,
  visitedCountryCount: existingUser.visitedCountryCount ?? 0,
  userSocialTF: existingUser.userSocialTF ?? false,
};
```

### `ANALYZE=true yarn build` 결과가 보이지 않음

처음 실행 시 터미널 출력이 스크롤 밖으로 밀려 트리맵 파일 생성 여부를 확인하지 못했다. `.next/analyze/` 디렉토리에 `client.html`, `server.html`이 생성됨을 직접 확인 후 브라우저로 열어 분석했다.

---

## 7. 회고 / 배운 점

### "측정하지 않으면 최적화가 아니다"

번들 분석 전에는 "TravelLogMap이 느릴 것 같다"는 감으로 Dynamic import를 고려했다. 실제로 **1.79MB 측정값**을 보고 나서야 얼마나 치명적인지 체감했다. `ANALYZE=true yarn build` 한 번으로 막연한 추측이 수치가 됐다.

### next/image `priority`의 실질 효과

`priority`는 단순한 힌트가 아니다. Next.js가 `<head>`에 `<link rel="preload" as="image">` 태그를 직접 삽입한다. 브라우저 Preload Scanner가 HTML 파싱 중 이 태그를 발견해 이미지 fetch를 조기 시작한다. LCP 점수에서 "로드 지연" 항목이 줄어드는 이유가 여기에 있다.

### Dynamic import의 SSR 비호환 문제를 한 번에 해결

Leaflet은 `window.navigator`를 초기화 시점에 참조한다. SSR 환경에는 `window`가 없어 `ReferenceError`가 발생한다. `next/dynamic({ ssr: false })`는 이 컴포넌트를 서버 렌더링에서 완전히 제외하므로 별도의 `typeof window !== 'undefined'` 가드가 필요 없다. 번들 분리와 SSR 호환 문제를 동시에 해결하는 패턴이다.

### 데모 환경은 별도로 검증해야 한다

개발 중에는 눈에 보이지 않던 버그(NaN, 알림 빈화면)가 면접관 시점에서는 치명적이다. "내가 아닌 제3자가 처음 방문한다면 무엇이 깨져 보일까?"를 체크리스트로 만들어 검토하는 것이 효과적이었다.

---

## 8. 변경 파일 목록

### 신규 파일

| 파일 | 설명 |
|------|------|
| `src/app/loading.tsx` | 홈 페이지 스켈레톤 |
| `src/app/trip/list/loading.tsx` | 여행 목록 스켈레톤 |
| `src/app/community/loading.tsx` | 커뮤니티 스켈레톤 |
| `src/app/trip/detail/[travelNumber]/loading.tsx` | 여행 상세 스켈레톤 |
| `src/components/WebVitals.tsx` | Web Vitals → Sentry 수집 |

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `next.config.js` | `@next/bundle-analyzer` 연동 |
| `src/app/layout.tsx` | 전역 Metadata + `<WebVitals />` 추가 |
| `src/app/page.tsx` | 홈 Metadata |
| `src/app/community/page.tsx` | 커뮤니티 Metadata |
| `src/app/myPage/page.tsx` | 마이페이지 Metadata |
| `src/app/trip/detail/[travelNumber]/page.tsx` | `generateMetadata` (동적) |
| `src/mocks/db/store.ts` | `User` 인터페이스 + 시드 데이터 4개 필드 추가 |
| `src/app/api/profile/me/route.ts` | GET 응답에 4개 필드 포함 |
| `src/app/api/login/route.ts` | 데모 유저 생성 시 4개 필드 초기화 |
| `src/app/api/users/sign-up/route.ts` | 회원가입 유저 4개 필드 초기화 |
| OAuth callback routes (5개) | `as User` 제거 + 4개 필드 명시 |
| `src/page-views/notification/NotificationsPage.tsx` | `NotificationList` 복원 |
| `src/shared/ui/icons/AlarmIcon.tsx` | 미읽음 체크 로직 개선 + console.log 제거 |
| `src/context/QueryClientBoundary.tsx` | console.log 3개 제거 |
| `src/context/ErrorCatcher.tsx` | console.log 제거 |
| `src/features/userProfile/hooks/useUserProfile.ts` | console.log 제거 |
| `src/page-views/travelLog/TravelLogPage.tsx` | `TravelLogMap` dynamic import + console.log 제거 |
| `src/utils/time.ts` | console.log 3개 제거 |
| `src/page-views/trip/TripDetailPage.tsx` | `MapContainer`·`EmblaCarousel` dynamic import + `<Image>` 변환 |
| `src/page-views/home/HomePage.tsx` | `<Image priority>` 변환 |
| `src/shared/ui/layout/Header.tsx` | `<Image>` 변환 |
| `src/shared/ui/layout/Dropdown.tsx` | `<Image>` 변환 |
| `src/shared/ui/text/TextButton.tsx` | `<Image>` 변환 |
| `src/widgets/home/BookmarkContainer.tsx` | `<Image>` 변환 |
| `src/page-views/comment/TripCommentPage.tsx` | `<Image>` 변환 |
| `src/page-views/search/SearchTravel.tsx` | `<Image>` 변환 |
