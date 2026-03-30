import type { Metadata } from "next";
import VerifyEmail from "@/page/Register/VerifyEmail";

export const metadata: Metadata = {
  title: "이메일 인증 | 모잉",
  description: "이메일로 전송된 인증 코드를 입력해주세요.",
};

const VerifyEmailPage = () => {
  return <VerifyEmail />;
};

export default VerifyEmailPage;
