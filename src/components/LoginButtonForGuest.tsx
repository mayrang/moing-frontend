"use client";
import { useBackPathStore } from "@/store/client/backPathStore";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function LoginButtonForGuest() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button
      type="button"
      className="mt-4 w-[143px] h-[42px] text-[var(--color-muted4)] px-5 py-[10px] gap-[10px] rounded-[40px] bg-[var(--color-keycolor)]"
      onClick={() => {
        localStorage.setItem("loginPath", pathname);
        router.push("/login");
      }}
    >
      로그인
    </button>
  );
}
