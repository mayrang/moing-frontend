import { CommunityPage } from "@/page-views/community";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "여행 잡담, 여행 팁, 여행 후기를 모잉 커뮤니티에서 공유해보세요.",
  openGraph: {
    title: "커뮤니티 | 모잉",
    description: "여행 잡담, 여행 팁, 여행 후기를 모잉 커뮤니티에서 공유해보세요.",
  },
};

export default function Page() {
  return <CommunityPage />;
}
