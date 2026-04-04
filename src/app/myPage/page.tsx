import MyPage from "@/page/MyPage/MyPage";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "나의 여행 기록, 참가 신청 현황, 프로필을 관리하세요.",
};

const MyPagePage = () => {
  return <MyPage />;
};

export default MyPagePage;
