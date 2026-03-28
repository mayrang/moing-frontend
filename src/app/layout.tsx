import Layout from "@/components/Layout";
import Providers from "./providers";
import "./globals.css";
import { MSWComponent } from "@/context/MSWComponent";
import UserProfileOverlay from "@/components/userProfile/UserProfileOverlay";
import NetworkErrorToast from "@/shared/ui/toast/NetworkErrorToast";
import localFont from "next/font/local";

const pretendard = localFont({
  src: [
    { path: "../../public/fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Pretendard-Regular.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Pretendard-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/Pretendard-SemiBold.woff2", weight: "700", style: "normal" },
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
    <html lang="ko" className={pretendard.variable}>
      <body className={pretendard.className}>
        <Providers>
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
