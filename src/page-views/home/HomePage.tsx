"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import InputField from "@/components/designSystem/input/InputField";
import AlarmIcon from "@/components/icons/AlarmIcon";
import dynamic from "next/dynamic";
import { BookmarkContainer, TripAvailable } from "@/widgets/home";

const TripRecommendation = dynamic(
  () => import("@/widgets/home").then((m) => m.TripRecommendation),
  { ssr: false, loading: () => <div className="h-[300px]" /> }
);
import Spacing from "@/components/Spacing";
import Footer from "@/page-views/home/Footer";
import CreateTripButton from "@/page-views/home/CreateTripButton";
import { myPageStore } from "@/store/client/myPageStore";
import { useBackPathStore } from "@/store/client/backPathStore";
import { isGuestUser } from "@/utils/user";
import { useRouter } from "next/navigation";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useClickTracking } from "@/hooks/useClickTracking";

const Home = () => {
  const { name } = myPageStore();
  usePageTracking("home");
  const { track } = useClickTracking();
  const { setSearchTravel, setNotification } = useBackPathStore();
  const router = useRouter();

  const onFocusHandler = () => {
    setSearchTravel("/");
    router.push("/search/travel");
  }; // 검색화면으로 이동.

  // 이 부분 추후 유저 id로 대채해야함
  const onClickAlarm = () => {
    track("알림 링크", { link_text: "알림 페이지" });
    setNotification("/");
    router.push(`/notification`);
  };

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleScroll = () => {
      setScrolled(window.scrollY >= 56);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="bg-[var(--color-search-bg)] w-full">
      {/* HomeHeader */}
      <div className="bg-[var(--color-search-bg)] transition-colors duration-300 h-[116px] fixed top-0 left-0 w-full max-[440px]:w-full min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 min-[440px]:overflow-x-hidden z-[1000] overflow-hidden pt-[52px] px-6 pb-4">
        <div className="flex justify-between items-center h-12">
          <Image
            src="/images/homeLogo.png"
            width={96}
            height={24}
            alt="홈 모잉의 로고입니다"
            priority
          />
          {isGuestUser() ? (
            <div className="w-12 h-12 flex cursor-pointer items-center justify-center" />
          ) : (
            <div
              className="w-12 h-12 flex cursor-pointer items-center justify-center"
              onClick={onClickAlarm}
            >
              <AlarmIcon />
            </div>
          )}
        </div>
      </div>

      <div className="w-full px-6 mt-[116px]">
        <div className="pt-4">
          <div className="text-xl font-bold leading-[28px] tracking-[-0.025em] text-left mb-2">
            <span style={{ color: "#3e8d01" }}>
              {name === "" ? "모잉" : name}
            </span>
            님, 반가워요!
          </div>

          <InputField
            isHome={true}
            readOnly
            placeholder="어디로 여행을 떠날까요? ☁️ "
            onFocus={onFocusHandler}
            isRemove={false}
          />
        </div>
        {/* 북마크 부분 */}
        <BookmarkContainer />
        {/* 참가 가능 여행 부분 */}
        <TripAvailable />
        {/* 추천 여행 부분 */}
        <TripRecommendation />
        <Spacing size={62} />
        <Footer />
      </div>
      <CreateTripButton />
    </div>
  );
};

export default Home;
