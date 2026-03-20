# Phase 1.5: 웹 접근성 보강

> 이 문서는 블로그/이력서 작성 재료입니다. 기술적 판단 근거와 트러블슈팅 과정을 상세히 기록합니다.

## 1. 배경 및 문제 정의

### 왜 이 작업이 필요했는가

Phase 1에서 31개 컴포넌트를 `shared/ui`로 이전하면서 기능은 동작했으나 접근성(Accessibility)이 누락되어 있었다:

- **아이콘 전용 버튼**: `RemoveButton`(X 아이콘)에 `aria-label` 없음 → 스크린리더가 버튼 목적을 알 수 없음
- **Select 드롭다운**: `role`, `aria-expanded` 없어 스크린리더가 드롭다운 상태를 인식 불가
- **모달**: `role="dialog"`, `aria-modal` 없음, Escape 닫기 미지원, focus trap 없음 → 키보드 사용자가 모달 밖으로 이탈 가능
- **에러 메시지 연결**: `StateInputField`의 에러 메시지가 시각적으로만 표시, 스크린리더에 연결 안 됨
- **OTP 입력**: `CodeInput` 6개 셀 각각의 목적이 스크린리더에 불분명

---

## 2. 선택지와 의사결정

### Phase 분리 결정

Phase 1 진행 중 접근성을 함께 추가하면 흐름이 끊기므로 Phase 1.5로 분리.

### 고정값 vs 컨텍스트 의존값 전략

| 구분 | 방식 | 예시 |
|------|------|------|
| **고정값** (항상 동일) | 컴포넌트 내부 하드코딩 | `role="dialog"`, `aria-modal="true"`, `aria-expanded` |
| **컨텍스트 의존값** (호출부마다 다름) | prop으로 주입 | `aria-label`, `aria-labelledby`, `aria-describedby` |

**결정 근거**: ARIA Authoring Practices Guide(APG) 패턴에 따르면 dialog role처럼 의미가 고정된 속성은 컴포넌트에서 보장해야 하고, 제목 텍스트처럼 문맥에 따라 달라지는 것은 prop으로 받아야 한다.

### jest-axe 도입

`axe-core` 기반 자동 접근성 검사를 Vitest + `jest-axe`로 도입. 수동 체크리스트만으로는 WCAG 위반을 놓칠 수 있으므로 CI에서 자동 검증.

---

## 3. 구현 과정

### 3-1. jest-axe 설치 및 전역 설정

```bash
npm install --save-dev jest-axe @types/jest-axe
```

`src/test/setup.ts`에 전역 등록:
```typescript
import { toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';
expect.extend(toHaveNoViolations);
```

이후 모든 테스트에서 `await axe(container)`만으로 WCAG 검사 가능.

### 3-2. RemoveButton — 아이콘 전용 버튼 접근성

**Before**: 아이콘만 있는 버튼에 접근성 이름 없음
```tsx
<button type="button" onClick={onClick}><XIcon /></button>
```

**After**: `aria-label` 고정값 추가
```tsx
<button type="button" aria-label="삭제" onClick={onClick}><XIcon /></button>
```

**WCAG 기준**: WCAG 2.1 SC 4.1.2 - 모든 UI 컴포넌트는 접근성 이름(Accessible Name)이 있어야 함.

### 3-3. CloseButton — aria-label prop 지원

CloseButton은 텍스트("닫기")를 렌더링하므로 접근성 이름은 이미 있음. 하지만:
- 향후 아이콘 전용으로 사용될 경우를 위해 `aria-label` prop 지원
- 기본값을 `text` prop과 동일하게 설정하여 불일치 방지

```tsx
// aria-label이 없으면 text prop을 그대로 사용
const CloseButton = ({ onClick, text = '닫기', 'aria-label': ariaLabel }) => (
  <button aria-label={ariaLabel ?? text} ...>
```

### 3-4. Select — ARIA 드롭다운 패턴

ARIA APG의 [Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) 적용:

```tsx
// 트리거 버튼
<button
  role="combobox"
  aria-expanded={active}
  aria-haspopup="listbox"
  ...
>

// 옵션 목록
<ul role="listbox" aria-label="선택 목록">
  {list.map(element => (
    <li role="option" aria-selected={value === element}>
```

**Before**: 스크린리더가 일반 버튼 + 목록으로만 인식
**After**: "콤보박스, 펼쳐짐/닫힘, 옵션 3개" 같은 맥락 있는 안내

### 3-5. StateInputField — 에러 메시지 aria-describedby

에러 메시지를 `aria-describedby`로 input에 연결. 호출부(보통 ValidationInputField)에서 ID를 주입:

```tsx
// StateInputField
<input
  aria-invalid={hasError}
  aria-describedby={errorMessageId && hasError ? errorMessageId : undefined}
  ...
/>
```

```tsx
// 호출부 예시
<p id="email-error">올바른 이메일 형식이 아닙니다</p>
<StateInputField errorMessageId="email-error" hasError ... />
```

스크린리더가 포커스 시 에러 메시지를 자동으로 읽어줌.

### 3-6. CodeInput — OTP 셀 레이블

6개의 입력 셀이 `type="number"` input이라 스크린리더가 맥락 없이 "스핀 버튼"으로 안내했음.

```tsx
<input
  aria-label={`${index + 1}번째 숫자`}  // "1번째 숫자" ~ "6번째 숫자"
  type="number"
  ...
/>
```

### 3-7. BaseModal / BottomSheetModal — dialog 접근성 완전 구현

ARIA APG의 [Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) 적용:

```tsx
// BaseModal.tsx
useEffect(() => {
  if (!isOpen) return;

  // 이전 포커스 저장
  previousFocusRef.current = document.activeElement as HTMLElement;

  // 모달 내 첫 번째 포커스 가능 요소로 이동
  const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  focusable?.[0]?.focus();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    // Tab focus trap
    if (e.key === 'Tab' && focusable?.length > 0) {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    previousFocusRef.current?.focus(); // 모달 닫힐 때 포커스 복귀
  };
}, [isOpen, onClose]);

// JSX
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={labelId}  // 모달 제목 ID 연결 (optional)
  ref={modalRef}
>
```

---

## 4. Before / After 비교

### Select 드롭다운
| 구분 | Before | After |
|------|--------|-------|
| 스크린리더 안내 | "버튼" | "지역 선택 콤보박스, 닫힘" |
| 열렸을 때 | "버튼" | "지역 선택 콤보박스, 열림" |
| 옵션 선택 | "버튼" | "서울 옵션, 선택됨 (3개 중 1)" |

### 모달
| 구분 | Before | After |
|------|--------|-------|
| 스크린리더 안내 | 없음 | "삭제 확인 대화상자" (labelId 연결 시) |
| Escape 닫기 | 미지원 | 지원 |
| Tab 키 | 모달 밖으로 이탈 가능 | 모달 내부에서 순환 |
| 닫힐 때 포커스 | 유실 | 트리거 버튼으로 복귀 |

---

## 5. 테스트 결과

### 추가된 테스트

| 파일 | 추가 테스트 수 | 주요 검사 항목 |
|------|--------------|----------------|
| `RemoveButton.test.tsx` | +2 | `aria-label="삭제"`, axe 검사 |
| `CloseButton.test.tsx` | +3 | 기본 aria-label, 커스텀 aria-label, axe 검사 |
| `StateInputField.test.tsx` | +2 | `aria-describedby` 연결/미연결 |
| `CodeInput.test.tsx` | +1 | 셀별 `aria-label` |
| `Select.test.tsx` (신규) | +9 | role, aria-expanded, aria-selected 등 |
| `CheckingModal.test.tsx` | +3 | role="dialog", aria-modal, Escape 닫기 |

### 최종 테스트 수
- **134개 통과** (27개 테스트 파일, Phase 1.5에서 21개 추가)

---

## 6. 회고 / 배운 점

### ARIA 패턴은 사양을 직접 참조해야 한다

`role="combobox"`에 `aria-expanded`를 붙이는 것처럼 어떤 role과 aria 속성이 함께 쓰여야 하는지는 ARIA 사양에 명시되어 있다. W3C ARIA APG를 직접 참조하는 것이 가장 정확하다.

### focus trap이 필요한 이유

모달이 열린 상태에서 Tab 키를 누르면 포커스가 모달 밖의 UI로 이동할 수 있다. 시각 장애 사용자는 현재 맥락(모달)을 잃어버리게 된다. focus trap은 필수적인 UX 보호 장치다.

### axe로 못 잡는 것도 있다

`jest-axe`는 DOM 기반 정적 분석이므로:
- 포커스 순서(Tab order)의 논리적 적절성은 수동 검토 필요
- 색상 대비는 inline style 동적 계산이면 못 잡을 수 있음
- 실제 스크린리더(VoiceOver, NVDA) 테스트는 별도 필요

### 컴포넌트 레벨에서 보장해야 할 것들

`shared/ui` 레이어는 모든 feature/widget에서 재사용되므로 접근성은 이 레벨에서 보장해야 한다. 각 호출부에서 aria 속성을 추가하도록 강제하면 놓칠 가능성이 높다.
