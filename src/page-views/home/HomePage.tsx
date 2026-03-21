"use client";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import InputField from "@/components/designSystem/input/InputField";
import AlarmIcon from "@/components/icons/AlarmIcon";
import { BookmarkContainer, TripAvailable, TripRecommendation } from "@/widgets/home";
import Spacing from "@/components/Spacing";
import Footer from "@/page-views/home/Footer";
import CreateTripButton from "@/page-views/home/CreateTripButton";
import { palette } from "@/styles/palette";
import { myPageStore } from "@/store/client/myPageStore";
import { useBackPathStore } from "@/store/client/backPathStore";
import { isGuestUser } from "@/utils/user";

import { useRouter } from "next/navigation";
import axios from "axios";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useClickTracking } from "@/hooks/useClickTracking";

const Home = () => {
  const { name } = myPageStore();
  usePageTracking("home");
  const { track } = useClickTracking();
  const { setSearchTravel, setNotification } = useBackPathStore();
  const router = useRouter();
  console.log();
  // console.log(`
  //   ███╗   ███╗ ██████╗ ██╗███╗   ██╗ ██████╗     ██╗
  //   ████╗ ████║██╔═══██╗██║████╗  ██║██╔════╝    ███║
  //   ██╔████╔██║██║   ██║██║██╔██╗ ██║██║  ███╗   ╚██║
  //   ██║╚██╔╝██║██║   ██║██║██║╚██╗██║██║   ██║    ██║
  //   ██║ ╚═╝ ██║╚██████╔╝██║██║ ╚████║╚██████╔╝    ██║
  //   ╚═╝     ╚═╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝

  //   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //              🚀 Welcome to MOING! 🚀
  //   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //   `);
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
    <HomeContainer>
      <HomeHeader scrolled={scrolled}>
        <HeaderTitle>
          <img src={"/images/homeLogo.png"} width={96} height={24} alt="홈 모잉의 로고입니다" />
          {isGuestUser() ? (
            <Alarm></Alarm>
          ) : (
            <Alarm onClick={onClickAlarm}>
              <AlarmIcon />
            </Alarm>
          )}
        </HeaderTitle>
      </HomeHeader>

      {/* <CharacterBox>
    <img
      src="/images/homeCharacter.png"
      alt=""
    />
  </CharacterBox> */}
      <ContentWrapper>
        <SearchBox>
          <Greeting>
            <span>{name === "" ? "모잉" : name}</span>님, 반가워요!
          </Greeting>

          <InputField
            isHome={true}
            readOnly
            placeholder="어디로 여행을 떠날까요? ☁️ "
            onFocus={onFocusHandler}
            isRemove={false}
          />
        </SearchBox>
        {/* 북마크 부분 */}
        <BookmarkContainer />
        {/* 참가 가능 여행 부분 */}
        <TripAvailable />
        {/* 추천 여행 부분 */}
        <TripRecommendation />
        <Spacing size={62} />
        <Footer />
      </ContentWrapper>
      <CreateTripButton />
    </HomeContainer>
  );
};
const HomeContainer = styled.div`
  background-color: ${palette.검색창};
  width: 100%;
`;

const ContentWrapper = styled.div`
  width: 100%;
  padding: 0px 24px;

  margin-top: calc(116px);
`;
const SearchBox = styled.div`
  padding-top: 16px;
`;
const Greeting = styled.div`
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: -0.025em;
  text-align: left;
  margin-bottom: 8px;
  span {
    color: #3e8d01;
  }
`;

const HomeHeader = styled.div<{ scrolled: boolean }>`
  background-color: ${palette.검색창};
  transition: background-color 0.3s ease;

  @media (max-width: 440px) {
    width: 100%;
  }
  @media (min-width: 440px) {
    width: 390px;
    left: 50%;
    transform: translateX(-50%);
    overflow-x: hidden;
  }
  height: 116px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  overflow: hidden;
  padding: 52px 24px 16px 24px;
`;

const HeaderTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
`;
const Text = styled.div`
  font-size: 24px;
  font-weight: 600;
  line-height: 28.64px;
  text-align: left;
`;
const Alarm = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
`;
export default Home;
