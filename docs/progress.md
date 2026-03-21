# MOING Frontend 리팩토링 진행 현황

## 전체 진행률

| Phase | 이름 | 상태 | 시작일 | 완료일 |
|-------|------|------|--------|--------|
| Phase 0 | 기반 구축 | ✅ 완료 | 2026-03-20 | 2026-03-20 |
| Phase 1 | shared 레이어 | ✅ 완료 | 2026-03-20 | 2026-03-20 |
| Phase 1.5 | 웹 접근성 보강 | ✅ 완료 | 2026-03-20 | 2026-03-20 |
| Phase 2 | entities 레이어 | ✅ 완료 | 2026-03-21 | 2026-03-21 |
| Phase 3 | features 레이어 | 🚧 진행 중 | 2026-03-21 | - |
| Phase 4 | pages / widgets 레이어 | 🔜 대기 | - | - |

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
- [ ] Step 2: `features/search`
- [ ] Step 3: `features/trip`
- [ ] Step 4: `features/tripDetail`
- [ ] Step 5: `features/enrollment`
- [ ] Step 6: `features/bookmark`
- [ ] Step 7: `features/myTrip`
- [ ] Step 8: `features/comment`
- [ ] Step 9: `features/community`
- [ ] Step 10: `features/notification`
- [ ] Step 11: `features/myPage`
- [ ] Step 12: `features/userProfile`

### 누계 테스트
- Step 1 완료: 159개 → **171개** (전부 통과)

### 참조
- [Phase 3 상세 문서](refactoring/phase-3.md)

---

## Phase 4: pages / widgets 레이어

### 체크리스트
- [ ] `page/` → `pages/` + `widgets/`
- [ ] Server Component 전환 (하이브리드)
- [ ] 성능 테스트 측정
- [ ] 성능 최적화
- [ ] E2E 테스트 작성

### 변경 파일 목록
_작업 완료 후 기록_
