import type { Metadata } from "next";
import RegisterPassword from "@/page/Register/RegisterPassword";

export const metadata: Metadata = {
  title: "비밀번호 설정 | 모잉",
  description: "모잉 계정에 사용할 비밀번호를 설정해주세요.",
};

const RegisterPasswordPage = () => {
  return <RegisterPassword />;
};

export default RegisterPasswordPage;
