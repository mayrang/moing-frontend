import HomePage from "@/page-views/home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "홈 | 모잉",
  description: "모잉에서 나에게 딱 맞는 여행 동행을 찾아보세요. 추천 여행과 최신 여행 모집글을 확인하세요.",
  openGraph: {
    title: "홈 | 모잉",
    description: "모잉에서 나에게 딱 맞는 여행 동행을 찾아보세요.",
  },
};

export default function Page() {
  return <HomePage />;
}
