# Phase 1: shared 레이어 구축

> 이 문서는 블로그/이력서 작성 재료입니다. 기술적 판단 근거와 트러블슈팅 과정을 상세히 기록합니다.

## 1. 배경 및 문제 정의

### 왜 이 작업이 필요했는가
`components/designSystem/`에 31개 컴포넌트(약 3,643줄)가 있었으나 다음 문제들이 있었다.

- **중복 코드**: `Button`, `FilterButton`, `ApplyListButton` 세 파일에 동일한 `ButtonContainer` styled-component가 복붙됨
- **FSD 위반**: Toast 컴포넌트가 Zustand 스토어를 직접 import (shared 레이어가 상위 레이어에 의존)
- **Emotion 사용**: CSS-in-JS 런타임 오버헤드 + Server Component 호환 불가
- **버그**: `FilterButtonWrapper`, `ApplyListButtonWrapper`에 `display: flex` 2번 선언
- **오타**: `FilterButton`의 `intializeOnClick` prop (i 누락)
- **유연하지 않은 API**: `CloseButton`의 `setIsOpen` prop이 특정 useState 패턴에 종속

---

## 2. 선택지와 의사결정

### Button 컴포넌트 통합 전략

| 옵션 | 장점 | 단점 | 선택 여부 |
|------|------|------|-----------|
| 파일 3개를 각각 Tailwind로만 변환 | 빠름 | 중복 코드 유지됨 | ❌ |
| 공통 `Button`을 베이스로, 나머지는 조합 | 단일 책임, 중복 제거 | 기존 API 일부 변경 | ✅ |

**결정**: `Button`을 베이스 컴포넌트로, `FilterButton`과 `ApplyListButton`은 `Button` + 추가 UI 요소로 조합. 컴포지션 패턴 적용.

### CloseButton API 변경

| 옵션 | 설명 | 선택 여부 |
|------|------|-----------|
| `setIsOpen` 유지 | 기존 코드 변경 없음, 하지만 특정 패턴 종속 | ❌ |
| `onClick`으로 변경 | 재사용성 향상, 레거시 어댑터로 호환 유지 | ✅ |

**결정**: `onClick` prop으로 변경. 기존 호출부는 레거시 어댑터(re-export 위치에 래퍼)로 호환 유지.

### 마이그레이션 전략: re-export 방식

기존 경로(`@/components/designSystem/Buttons/Button`)에서 re-export하여 다른 파일들의 import를 건드리지 않음. Phase 1 완료 후 일괄 import 경로 업데이트.

---

## 3. 구현 과정

### 1-1: Button 그룹 (TDD)

**TDD 순서**: 테스트 작성(Red) → 구현(Green)

```
src/shared/ui/button/
├── Button.test.tsx        ← 먼저 작성
├── Button.tsx             ← 테스트 통과하도록 구현
├── CloseButton.test.tsx
├── CloseButton.tsx
├── FilterButton.test.tsx
├── FilterButton.tsx
├── EditAndDeleteButton.test.tsx
├── EditAndDeleteButton.tsx
├── ReportButton.tsx
├── ApplyListButton.tsx
└── index.ts
```

### Before / After: Button 중복 제거

**Before** (3개 파일에 동일한 코드):
```tsx
// Button.tsx, FilterButton.tsx, ApplyListButton.tsx 각각에 복붙
const ButtonContainer = styled.button<{ disabled: boolean }>`
  @media (max-width: 390px) { width: 100%; }
  @media (min-width: 390px) { width: 342px; }
  height: 48px;
  border-radius: 40px;
  cursor: pointer;
  ...
`;
```

**After** (공통 Button 컴포넌트 1개로 통합):
```tsx
// FilterButton.tsx
const FilterButton = ({ ... }) => (
  <div className="flex w-full items-center justify-center gap-4">
    <button onClick={initializeOnClick}><ResetIcon /></button>
    <Button text={text} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  </div>
);
```

### Tailwind 전환: 동적 스타일 처리

Button에서 disabled 상태처럼 정적으로 결정되는 스타일은 Tailwind 조건부 클래스로,
색상/크기를 props로 받는 부분은 CSS 변수(`var(--color-*)`) + inline style 조합:

```tsx
// CSS 변수 기반 색상 (globals.css @theme에서 관리)
className="text-[var(--color-keycolor)]"

// 런타임 동적 값은 inline style 유지
style={style}  // 부모에서 내려온 커스텀 색상
```

### FilterButton 오타 수정 + 하위 호환

```tsx
// 기존 레거시 래퍼 (intializeOnClick → initializeOnClick 어댑터)
export default function LegacyFilterButton({ intializeOnClick, ...props }) {
  return <FilterButton {...props} initializeOnClick={intializeOnClick} />;
}
```

---

## 4. Before / After 비교

### 구조 변화
```
Before:
src/components/designSystem/Buttons/
├── Button.tsx          (75줄, ButtonContainer 포함)
├── FilterButton.tsx    (97줄, ButtonContainer 중복)
├── ApplyListButton.tsx (119줄, ButtonContainer 중복)
├── CloseButton.tsx     (38줄)
├── EditAndDeleteButton.tsx (98줄)
└── ReportButton.tsx    (63줄)

After:
src/shared/ui/button/
├── Button.tsx          (44줄, 재사용 가능한 베이스)
├── FilterButton.tsx    (50줄, Button 조합)
├── ApplyListButton.tsx (60줄, Button 조합)
├── CloseButton.tsx     (32줄)
├── EditAndDeleteButton.tsx (52줄)
├── ReportButton.tsx    (32줄)
└── [테스트 파일 4개, 18개 테스트]

src/components/designSystem/Buttons/ → re-export만 남음
```

### 코드 품질 변화 (Button 그룹 기준)

| 지표 | Before | After |
|------|--------|-------|
| 총 라인 수 | 490줄 | 270줄 (Button 그룹 구현부) |
| 중복 ButtonContainer | 3곳 | 0곳 |
| 테스트 | 0개 | 18개 |
| CSS 방식 | Emotion (런타임) | Tailwind (빌드타임) |
| FSD 레이어 | 없음 | shared/ui 준수 |

---

## 5. 트러블슈팅

### 1-2: TextareaField clone 트릭과 CSS 분리

**문제**: `TextareaField`는 유연한 높이 계산을 위해 화면 밖에 숨겨진 `Clone` textarea를 사용하는데,
Emotion의 `styled.textarea`로 만들어진 `Clone`과 `DetailTextArea`가 동일한 CSS를 중복으로 보유.

**원인**: `Clone`에는 `visibility: hidden; position: absolute; top: -9999px` 등이 추가될 뿐,
나머지 폰트/패딩/스크롤바 CSS는 `DetailTextArea`와 완전히 동일.

**해결**: `sharedTextareaStyle` 공통 스타일 객체로 추출하여 두 엘리먼트에 동일하게 적용.
스크롤바 CSS는 `globals.css`의 `.textarea-scrollbar` 클래스로 분리.

```tsx
// 공통 스타일 객체로 중복 제거
const sharedTextareaStyle: React.CSSProperties = {
  padding, fontSize, lineHeight, letterSpacing: '-0.025em',
  fontFamily: '"Pretendard"', height: computedHeight, color,
};
```

### 1-2: TextareaField height number 단위 누락 버그 수정

**문제**: 원본 Emotion 코드에 `height: ${props.height}` (number인 경우 단위 없음)가 있었는데,
CSS에서 `height: 48`처럼 단위 없는 값은 무효.

**분석**: 실제로는 height가 항상 string(`"31svh"`, `"100%"`)으로 전달되어 잠재적 버그.

**수정**: `typeof height === 'number' ? \`${height}px\` : height` → `${height}px`로 수정.

### 1-2: CodeInput input-bar 숨김 CSS → globals.css

**문제**: 원본 Emotion 코드의 `&:not(:placeholder-shown) ~ .input-bar` 선택자는
Emotion에서만 작동하는 부모-자식 CSS 범위.

**해결**: globals.css에 `.code-input-cell` 래퍼 클래스를 추가하고,
해당 클래스 내부에서 선택자 적용:
```css
.code-input-cell input:not(:placeholder-shown) ~ .input-bar,
.code-input-cell input:focus ~ .input-bar { display: none; }
```

### 1-2: StateInputField shake 애니메이션 클래스화

**문제**: Emotion `keyframes`와 `animation: ${props.shake ? css\`...\` : 'none'}` 패턴을
Tailwind로 대체해야 했음.

**해결**:
1. `@keyframes shake` 선언 → globals.css (이미 존재)
2. `.animate-shake { animation: shake 0.3s; }` → globals.css에 추가
3. 조건부 Tailwind 클래스: `shake ? 'animate-shake' : ''`

---

## 6. 현재 진행 상황

### 완료
- [x] 팔레트 색상 → Tailwind `@theme` 등록
- [x] **1-1: Button 그룹** (6개 컴포넌트, 18개 테스트 통과)
- [x] **1-2: Badge, Select, Tag, Text 그룹** (9개 컴포넌트, 20개 테스트 추가 → 누계 38개)
- [x] **1-3: Input 그룹** (7개 컴포넌트, 36개 테스트 추가 → 누계 74개)
  - RemoveButton, InputField, StateInputField, ValidationInputField
  - TextareaField, CodeInput, CommentInput
  - globals.css: `.textarea-scrollbar`, `.animate-shake`, `.code-input-cell`, `.code-number-input`
- [x] **1-4: Toast 그룹** (5개 컴포넌트, 12개 테스트 추가 → 누계 86개)
  - BaseToast (신규), ErrorToast (FSD 위반 제거), ResultToast, WarningToast, TripToast
  - errorToast: 스토어 어댑터 패턴으로 하위 호환 유지
- [x] **1-5: Modal 그룹** (9개 컴포넌트, 23개 테스트 추가 → 누계 109개)
  - ModalDimmed (신규), BaseModal (신규), BottomSheetModal (신규)
  - CheckingModal, NoticeModal, ResultModal, EditAndDeleteModal, ReportModal, ImageModal
  - window.innerWidth 직접 사용 → Tailwind 대체 (SSR 안전)

### 진행 예정
- [x] **1-6: Profile** (1개 컴포넌트, 4개 테스트 추가 → 누계 113개)
  - RoundedImage: Emotion → Tailwind + inline style

---

## 7. 회고 / 배운 점

### 기술적 인사이트

**Emotion → Tailwind 전환의 핵심 패턴**
- 정적 레이아웃/타이포 → Tailwind 클래스
- 상태 기반 색상(focused, hasError 등) → inline `style` prop (계산된 값은 Tailwind로 표현 불가)
- 복잡한 CSS (scrollbar, keyframes, sibling selector) → `globals.css` 커스텀 클래스

**FSD 위반 해결 전략**
- `ErrorToast` (store 직접 import): shared 레이어를 순수 props 기반으로 변경 → 기존 위치에 store 어댑터 배치
- 패턴: shared는 항상 props/콜백만 알고, store 연결은 feature/widget 레이어에서 담당

**중복 제거 패턴 3가지**
1. 조합(Composition): `BaseToast + icon → ResultToast / WarningToast`
2. 래퍼 추출: `BaseModal → CheckingModal / NoticeModal / ResultModal`
3. 공통 컴포넌트: `ModalDimmed` (3곳 DarkWrapper 중복)

**TDD에서 portal 컴포넌트 테스트**
- `createPortal` mock + `beforeEach`에서 DOM 엘리먼트 생성 패턴 확립
- 테스트 격리: `afterEach`에서 portal root 제거

### 버그 수집 (블로그 소재)
| 버그 | 원인 | 교훈 |
|------|------|------|
| `height: ${number}` (단위 없음) | Emotion 템플릿 리터럴 타입 안전성 부재 | TypeScript로도 잡기 어려운 CSS 단위 버그 |
| `opacity: 0px` | CSS 단위 오기입 | opacity는 단위 없는 숫자 |
| `white-space: "pre-line"` (JS 문자열) | styled-component 내 JS 값 혼용 | CSS 문자열을 JS 문자열로 잘못 감쌈 |
| `import { styleText } from 'util'` | 미사용 import 방치 | 린터 설정 중요성 |
| `window.innerWidth` SSR 위험 | Client-only API 직접 사용 | 반응형은 CSS로 처리 |
| `clip-path` (소문자) | HTML 속성 → JSX camelCase 혼동 | JSX는 camelCase |
| `display: flex` 2번 선언 | styled-component 복붙 | 코드 리뷰의 중요성 |

### Phase 1 최종 성과
- **컴포넌트**: 31개 → `shared/ui` 레이어로 이전 완료 (FSD 준수)
- **테스트**: 0개 → **113개** (26개 테스트 파일)
- **Emotion 제거**: 모든 designSystem 컴포넌트에서 Emotion 완전 제거
- **중복 제거**: ButtonContainer 3중복, DarkWrapper 3중복, BaseToast/BaseModal 추출
- **버그 수정**: 7건
- **하위 호환**: 기존 import 경로 전부 유지 (re-export 전략)
