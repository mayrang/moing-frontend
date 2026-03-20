# ADR 003: 테스트 전략 - Vitest + Playwright

## 상태
확정 (2026-03-20)

## 배경
현재 테스트 코드가 전혀 없는 상태에서 대규모 리팩토링을 진행한다.
테스트 없이 리팩토링하면 회귀 버그를 감지할 수 없다.

## 결정
- **단위/통합 테스트**: Vitest + React Testing Library
- **E2E 테스트**: Playwright
- **방식**: TDD (테스트 먼저 작성 후 구현)

## 테스트 레벨

| 레벨 | 도구 | 대상 |
|------|------|------|
| 단위 테스트 | Vitest | shared/ui 컴포넌트, utils, hooks |
| 통합 테스트 | Vitest + RTL | features, entities API |
| E2E 테스트 | Playwright | 주요 사용자 플로우 |

## 주요 E2E 시나리오 (Phase 4에서 작성)
- 로그인 / 소셜 로그인
- 여행 생성 플로우
- 여행 검색 및 신청
- 마이페이지 수정

## TDD 원칙
1. 실패하는 테스트 먼저 작성
2. 테스트를 통과하는 최소한의 코드 작성
3. 리팩토링

## 성능 테스트 (Phase 4)
- Lighthouse CI로 빌드 시 성능 점수 측정
- Core Web Vitals (LCP, FID, CLS) 기준점 설정 후 개선
