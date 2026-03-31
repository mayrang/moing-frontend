"use client";
import React from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// dynamic import → AppShell과 모든 의존성(useMyPage, Navbar, Splash 등)이
// auth 페이지에서는 JS 번들에 포함되지 않음
const AppShell = dynamic(() => import("./AppShell"), { ssr: false });

// auth 플로우 전용 경로: AppShell(useMyPage, Navbar 등) 마운트 없이 children만 렌더링
// /login 만 해당 — register/verifyEmail 등은 AppShell의 Header(뒤로가기) 필요
const isAuthRoute = (pathname: string | null): boolean => {
  if (!pathname) return false;
  return (
    pathname.startsWith("/login") ||
    pathname === "/onBoarding" ||
    pathname === "/explanation"
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  if (isAuthRoute(pathname)) {
    return (
      <div className="overflow-x-hidden flex justify-center items-center h-svh w-svw">
        <main className="relative h-full overscroll-none no-scrollbar w-svw min-[440px]:w-[390px] min-[440px]:overflow-x-hidden bg-[var(--color-bg)]">
          {children}
        </main>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
};

export default Layout;
