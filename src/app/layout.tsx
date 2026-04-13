import Layout from "@/components/Layout";
import Providers from "./providers";
import "./globals.css";
import { MSWComponent } from "@/context/MSWComponent";
import UserProfileOverlay from "@/components/userProfile/UserProfileOverlay";
import NetworkErrorToast from "@/shared/ui/toast/NetworkErrorToast";
import WebVitals from "@/components/WebVitals";
import localFont from "next/font/local";
import type { Metadata } from "next";

export const metadata: Metadata = {
  colorScheme: "light",
  title: {
    default: "모잉 | 여행 동행 매칭 플랫폼",
    template: "%s | 모잉",
  },
  description: "함께 떠나는 여행, 모잉에서 동행을 찾아보세요. 국내외 여행 동행 매칭 서비스입니다.",
  keywords: ["여행", "동행", "여행 동행", "여행 매칭", "모잉", "해외여행", "국내여행"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "모잉",
    title: "모잉 | 여행 동행 매칭 플랫폼",
    description: "함께 떠나는 여행, 모잉에서 동행을 찾아보세요.",
    images: [{ url: "/images/homeLogo.png", width: 96, height: 24, alt: "모잉 로고" }],
  },
  twitter: {
    card: "summary",
    title: "모잉 | 여행 동행 매칭 플랫폼",
    description: "함께 떠나는 여행, 모잉에서 동행을 찾아보세요.",
  },
};

const pretendard = localFont({
  src: [
    { path: "../../public/fonts/Pretendard-Regular.subset.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Pretendard-Regular.subset.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Pretendard-SemiBold.subset.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/Pretendard-SemiBold.subset.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-pretendard",
  preload: true,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable} style={{ colorScheme: "light" }}>
      <body className={pretendard.className}>
        <Providers>
          <WebVitals />
          <MSWComponent />
          <UserProfileOverlay />
          <NetworkErrorToast />
          <Layout>{children}</Layout>
          <div id="checking-modal" />
          <div id="trip-toast" />
          <div id="result-toast" />
          <div id="end-modal" />
          <div id="region-modal" />
        </Providers>
      </body>
    </html>
  );
}
