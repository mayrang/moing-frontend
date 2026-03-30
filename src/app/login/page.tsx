import type { Metadata } from "next";
import Login from "@/page/Login/Login";

export const metadata: Metadata = {
  title: "로그인 | 모잉",
  description: "모잉에 로그인하고 여행 메이트를 만나보세요.",
};

const LoginPage = () => {
  return <Login />;
};

export default LoginPage;
