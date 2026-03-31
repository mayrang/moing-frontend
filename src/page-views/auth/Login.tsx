import dynamic from "next/dynamic";
import LoginActions from "./LoginActions";
import Image from "next/image";

// EmailLoginForm: SSR(HTML 즉시 노출)하되 JS 청크는 지연 로드
// → 초기 번들에서 react-hook-form/zod/useAuth 등이 제외돼 TTI 개선
const EmailLoginForm = dynamic(() => import("@/components/login/EmailLoginForm"), {
  ssr: true,
});

// Server Component: 로고 + 폼 구조를 서버에서 렌더링 → LCP 요소 즉시 SSR HTML에 포함
export default function Login() {
  return (
    <div className="h-svh flex relative flex-col items-center justify-center">
      <div className="flex justify-end items-center gap-4 flex-col pb-[7.7svh]">
        <Image
          src="/images/loginLogo2.png"
          alt="모잉 서비스의 로고 이미지입니다."
          width={128}
          height={89}
        />
      </div>
      <EmailLoginForm />
      <LoginActions />
    </div>
  );
}
