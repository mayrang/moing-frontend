import type { Metadata } from "next";
import RegisterEmail from "@/page/Register/RegisterEmail";

export const metadata: Metadata = {
  title: "회원가입 | 모잉",
  description: "이메일로 모잉 계정을 만들어보세요.",
};

const RegisterEmailPage = () => {
  return <RegisterEmail />;
};

export default RegisterEmailPage;
