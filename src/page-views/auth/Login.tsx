"use client";
import { googleLogin, kakaoLogin, naverLogin } from "@/api/user";
import GoogleIcon from "@/components/icons/GoogleIcon";
import KakaoIcon from "@/components/icons/KakaoIcon";
import NaverIcon from "@/components/icons/NaverIcon";
import EmailLoginForm from "@/components/login/EmailLoginForm";
import Spacing from "@/components/Spacing";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const handleSimpleLogin = async (domain: "naver" | "kakao" | "google") => {
    switch (domain) {
      case "naver":
        await naverLogin();
        return;
      case "kakao":
        await kakaoLogin();
        return;
      case "google":
        await googleLogin();
    }
  };

  return (
    <div className="h-svh flex relative flex-col items-center justify-center">
      <div
        className="absolute top-4 right-6 flex items-center justify-center py-[13px] pl-[10px] pr-[9px] leading-[16px] text-sm font-normal text-[var(--color-text-muted2)] cursor-pointer"
        onClick={() => router.push("/")}
      >
        둘러보기
      </div>
      <div className="flex justify-end items-center gap-4 flex-col pb-[7.7svh]">
        <img
          src={"/images/loginLogo2.png"}
          alt="모잉 서비스의 로고 이미지입니다."
          width={128}
          height={89}
        />
      </div>
      <EmailLoginForm />
      <div className="px-6 pt-[6.3svh] flex items-end w-full flex-col text-[var(--color-text-muted)] text-sm leading-[16.71px]">
        <Spacing size="2.3svh" />
        <div className="flex items-center justify-center w-full gap-6">
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => handleSimpleLogin("naver")}
          >
            <NaverIcon />
          </button>
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => handleSimpleLogin("kakao")}
          >
            <KakaoIcon />
          </button>
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => handleSimpleLogin("google")}
          >
            <GoogleIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
