# MOING Frontend - 리팩토링 가이드라인

## 프로젝트 개요
여행 매칭 플랫폼. React → Next.js 긴급 마이그레이션 이후 체계적인 리팩토링 진행 중.
- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **현재 상태**: 448개 파일, ~40,460줄, 대부분 Client Component

---

## 리팩토링 목표
1. **Next.js 방식으로 개편** - Server Component 전략 (Option B: 하이브리드)
2. **FSD 폴더 구조** - Feature-Sliced Design 완전 적용
3. **성능 최적화** - 테스트 기반 측정 후 개선
4. **TDD + 에러 핸들링** - Vitest (단위/통합) + Playwright (E2E)
5. **Tailwind CSS 전환** - Emotion 제거
6. **UX 개편** - 진행 중 별도 지시

---

## 확정된 기술 결정

| 항목 | AS-IS | TO-BE |
|------|-------|-------|
| 스타일링 | Emotion (CSS-in-JS) | Tailwind CSS |
| 폴더 구조 | 도메인 분리 구조 | FSD (Feature-Sliced Design) |
| 테스트 | 없음 | Vitest + Playwright |
| Server/Client | 전부 Client Component | 하이브리드 (Option B) |
| 타입 강화 | 후순위 (나중에) | - |
| 라이브러리 | Zustand / React Query / Axios | 유지 |

---

## FSD 목표 구조

```
src/
├── app/                    # Next.js App Router (라우팅만)
│   ├── layout.tsx
│   ├── (auth)/
│   ├── trip/
│   └── ...
├── page-views/             # 페이지 조합 레이어 (FSD "pages" 레이어)
│                           # ※ Next.js가 src/pages/를 Pages Router로 인식하여
│                           #   충돌 방지를 위해 page-views/ 로 명명
├── widgets/                # 독립적 UI 블록
├── features/               # 사용자 시나리오 단위 기능
├── entities/               # 도메인 모델 (trip, user, comment...)
└── shared/                 # 공통 재사용 요소
    ├── ui/                 # 디자인 시스템 (버튼, 인풋, 모달...)
    ├── api/                # axios 인스턴스, 공통 fetch
    ├── hooks/              # 범용 훅
    ├── lib/                # 외부 라이브러리 래핑
    ├── constants/          # 전역 상수
    └── types/              # 전역 타입
```

---

## 진행 단계 (Phase)

### Phase 0: 기반 구축 ✅
- [x] Vitest 설정
- [x] Playwright 설정
- [x] Tailwind 설치 (Emotion과 공존)
- [x] FSD 디렉토리 스캐폴딩

### Phase 1: shared 레이어
- `components/designSystem/` → `shared/ui/` 이전
- Tailwind 첫 마이그레이션
- 각 컴포넌트 단위 테스트 작성

### Phase 2: entities 레이어
- `model/` + `api/` → `entities/{domain}/`
- 도메인별 타입, API, 기본 모델 정의

### Phase 3: features 레이어
- `hooks/` + `components/` → `features/{feature}/`
- 각 feature마다 TDD로 진행

### Phase 4: page-views / widgets 레이어 ✅
- `page/` → `page-views/` + `widgets/` (re-export 래퍼로 하위 호환)
- Server Component + HydrationBoundary 프리페치 (/, /community, /trip/detail)
- E2E 테스트 전면 활성화 (test.describe.skip → test.describe)

---

## 협업 프로토콜

### 모든 작업은 아래 절차를 따른다
1. **계획 제시** → 사용자 검수 및 승인
2. **작업 실행**
3. **결과 보고** → 사용자 검수 및 승인
4. 승인 없이 다음 단계로 넘어가지 않는다

### 문서화 규칙
> **목적**: 블로그 포스팅 및 이력서 작성 재료로 활용. 단순 작업 기록이 아닌 **문제 → 원인 → 결정 → 결과** 서술 형식을 유지한다.

- 각 Phase 완료 시 `docs/refactoring/phase-{N}.md` 작성
- 기술 결정 사항은 `docs/decisions/` 에 ADR 형식으로 기록
- 변경된 파일 목록과 이유를 항상 기록

#### Phase 문서 필수 포함 항목
1. **배경 / 문제 정의** - 왜 이 작업이 필요했는가 (Before 상태, 수치 포함)
2. **선택지와 의사결정** - 어떤 옵션을 검토했고 왜 이것을 골랐는가
3. **구현 과정** - 핵심 기술적 도전과 해결 방법
4. **Before / After 비교** - 코드 예시 포함
5. **결과 및 수치** - 파일 수, 라인 수, 테스트 커버리지, 성능 지표 등
6. **트러블슈팅** - 겪은 문제와 해결 과정 (블로그 소재로 가장 중요)
7. **회고 / 배운 점** - 다음에 다르게 할 것, 인사이트

### PR 코드 리뷰 프로세스

> `claude-code-action` GitHub Actions 워크플로우는 **Anthropic API 크레딧이 필요**하므로 현재 비활성화 상태 (`.github/workflows/code-review.yml` → `workflow_dispatch` only).

PR 리뷰는 **Claude Code CLI (Pro 모드)** 로 수동 진행한다.

**절차:**
1. Claude Code 세션에서 PR diff 분석 요청
2. 아래 체크 항목 기준으로 리뷰 작성:
   - 코드 품질 및 가독성
   - FSD 레이어 규칙 준수 (shared → entities → features → widgets → page-views → app)
   - Tailwind 사용 (Emotion 신규 작성 금지)
   - 버그 가능성 (타입 오류, 엣지 케이스 등)
   - 웹 접근성 (aria 속성, 키보드 네비게이션)
   - 보안 취약점 (XSS, 민감 정보 노출 등)
3. `gh pr comment {PR번호} --body "..."` 로 리뷰 코멘트 게시

---

### 코딩 규칙
- 새로 작성하는 코드는 반드시 Tailwind 사용 (Emotion 신규 작성 금지)
- 새로 작성하는 컴포넌트는 FSD 구조에 맞게 위치
- 모든 새 기능은 테스트 먼저 작성 (TDD)
- console.log 사용 금지 (Sentry 또는 logger 사용)
- `any` 타입 신규 사용 금지

---

## 웹 접근성 (Web Accessibility) 가이드라인

> Phase 1.5 이후 모든 새 컴포넌트 및 수정 컴포넌트에 적용한다.

### 기본 원칙

**컴포넌트 고정값 vs 컨텍스트 의존값**

| 구분 | 적용 위치 | 예시 |
|------|-----------|------|
| **고정값** (디자인 시스템에서 처리) | 컴포넌트 내부 하드코딩 | `role="dialog"`, `aria-modal="true"`, `aria-expanded`, `aria-haspopup` |
| **컨텍스트 의존값** (호출부에서 주입) | prop으로 받기 | `aria-label`, `aria-describedby`, `aria-labelledby` |

### 컴포넌트별 접근성 규칙

#### 버튼 / 인터랙티브 요소
- `CloseButton`: `aria-label="닫기"` 기본값 (prop으로 override 허용)
- `RemoveButton`: `aria-label="삭제"` 기본값
- 아이콘만 있는 버튼은 반드시 `aria-label` 또는 `<span className="sr-only">` 포함
- `type="button"` 명시 (form submit 방지)

#### 폼 / 입력 요소
- `StateInputField`: 에러 메시지와 `aria-describedby`로 연결 (ID 기반)
  - 에러 메시지 `<p id="{inputId}-error">`, 입력 `aria-describedby="{inputId}-error"`
- `CodeInput`: 각 셀에 `aria-label="n번째 숫자"` (1~6)
- `aria-invalid="true"` — 에러 상태 시 추가
- `aria-required` — 필수 필드에 명시

#### 선택 / 드롭다운
- `Select`: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`
- 옵션 목록: `role="listbox"`, 각 옵션: `role="option"`, `aria-selected`

#### 모달 / 다이얼로그
- `BaseModal`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (제목 ID 연결)
- `BottomSheetModal`: 동일
- **Focus Trap 필수**: 모달 열릴 때 포커스 진입, 닫힐 때 트리거 버튼으로 복귀
- `Escape` 키로 모달 닫기 지원

#### 이미지
- `RoundedImage`: Phase 1에서 `div + background-image` 사용 → Phase 1.5에서 `<img>` + `alt` prop 전환 고려

### 키보드 네비게이션 체크리스트
- [ ] `Tab` / `Shift+Tab` 으로 모든 인터랙티브 요소 접근 가능
- [ ] `Enter` / `Space` 로 버튼 활성화
- [ ] `Escape` 로 모달/드롭다운 닫기
- [ ] focus outline 항상 표시 (`outline-none` 사용 금지, `focus-visible` 활용)
- [ ] 모달 내부 focus trap 적용

### 자동 접근성 테스트 (jest-axe)

```typescript
// 모든 shared/ui 컴포넌트 테스트에 포함할 패턴
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('접근성 위반이 없어야 한다', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Tailwind 접근성 유틸리티
- `sr-only`: 시각적으로 숨기되 스크린리더에 읽힘 (아이콘 버튼 텍스트)
- `focus-visible:ring-2`: 키보드 포커스 표시 (마우스 클릭 시 ring 미표시)
- `not-sr-only`: sr-only 해제

### 참고 기준
- WCAG 2.1 AA 준수 목표
- ARIA Authoring Practices Guide (APG) 패턴 참조

---

## 문서 구조

```
docs/
├── refactoring/
│   ├── phase-0.md
│   ├── phase-1.md
│   └── ...
├── decisions/          # Architecture Decision Records
│   ├── 001-tailwind.md
│   ├── 002-fsd.md
│   └── ...
└── progress.md         # 전체 진행 현황
```
