/**
 * next-view-transitions Vitest mock
 *
 * next-view-transitions가 next/link를 확장자 없이 import해서
 * Vitest ESM 리졸버가 실패함. 단위 테스트에서는 View Transition 동작 자체가
 * 필요 없으므로 최소 인터페이스만 제공.
 */
import React from 'react';

export const ViewTransitions = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export const useTransitionRouter = () => ({
  push: (_url: string) => {},
  replace: (_url: string) => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
  prefetch: () => {},
});
