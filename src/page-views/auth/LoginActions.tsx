"use client";
// 소셜 로그인 — 데모 환경에서 비활성화
// import { googleLogin, kakaoLogin, naverLogin } from "@/api/user";
// import GoogleIcon from "@/components/icons/GoogleIcon";
// import KakaoIcon from "@/components/icons/KakaoIcon";
// import NaverIcon from "@/components/icons/NaverIcon";
import Spacing from "@/components/Spacing";
import { useRouter } from "next/navigation";

export default function LoginActions() {
  const router = useRouter();

  // const handleSimpleLogin = async (domain: "naver" | "kakao" | "google") => {
  //   switch (domain) {
  //     case "naver":
  //       await naverLogin();
  //       return;
  //     case "kakao":
  //       await kakaoLogin();
  //       return;
  //     case "google":
  //       await googleLogin();
  //   }
  // };

  return (
    <>
      <div
        className="absolute top-4 right-6 flex items-center justify-center py-[13px] pl-[10px] pr-[9px] leading-[16px] text-sm font-normal text-[var(--color-text-muted2)] cursor-pointer"
        onClick={() => router.push("/")}
      >
        둘러보기
      </div>
      <div className="px-6 pt-[6.3svh] flex items-end w-full flex-col text-[var(--color-text-muted)] text-sm leading-[16.71px]">
        <Spacing size="2.3svh" />
        {/* 소셜 로그인 — 데모 환경에서 비활성화 */}
        {/* <div className="flex items-center justify-center w-full gap-6">
          <button
            type="button"
            className="cursor-pointer"
            aria-label="네이버로 로그인"
            onClick={() => handleSimpleLogin("naver")}
          >
            <NaverIcon />
          </button>
          <button
            type="button"
            className="cursor-pointer"
            aria-label="카카오로 로그인"
            onClick={() => handleSimpleLogin("kakao")}
          >
            <KakaoIcon />
          </button>
          <button
            type="button"
            className="cursor-pointer"
            aria-label="구글로 로그인"
            onClick={() => handleSimpleLogin("google")}
          >
            <GoogleIcon />
          </button>
        </div> */}
      </div>
    </>
  );
}
