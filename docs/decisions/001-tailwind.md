# ADR 001: Emotion → Tailwind CSS 전환

## 상태
확정 (2026-03-20)

## 배경
기존 프로젝트는 Emotion (CSS-in-JS)을 사용 중이었다.
Next.js App Router 환경에서 Emotion은 런타임에 CSS를 생성하기 때문에
Server Component와 호환되지 않아 모든 컴포넌트가 Client Component로 강제된다.

## 결정
Emotion을 Tailwind CSS로 전환한다.

## 근거
- Tailwind는 빌드타임에 CSS를 생성 → Server Component와 완벽 호환
- 번들 사이즈 감소 (런타임 CSS 생성 제거)
- Next.js 공식 권장 스타일링 방식 중 하나
- 하이브리드 Server Component 전략(Option B) 실현을 위한 필수 조건

## 마이그레이션 전략
- Emotion과 Tailwind 설치 공존 (Phase 0)
- Phase 1부터 신규 코드는 Tailwind만 사용
- 기존 컴포넌트는 FSD 이전 시 Tailwind로 교체
- Emotion 신규 작성 금지

## 영향
- 모든 styled-component 패턴 제거 필요
- className 기반 스타일링으로 전환
