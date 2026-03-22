"use client";
import React, { useEffect } from "react";
import Header from "./Header";

import Navbar from "@/page/Home/Navbar";
import { authStore } from "@/store/client/authStore";
import useAuth from "@/hooks/user/useAuth";
import { myPageStore } from "@/store/client/myPageStore";
import useMyPage from "@/hooks/myPage/useMyPage";
import { ImyPage, IProfileImg } from "@/model/myPages";
import Splash from "@/page/Splash";
import { splashOnStore } from "@/store/client/splashOnOffStore";
import { usePathname } from "next/navigation";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useHeaderNavigation } from "@/hooks/useHeaderNavigation";
const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { userPostRefreshToken } = useAuth();
  const { accessToken, logoutCheck } = authStore();

  // 유저 프로필 정보 불러오기

  const {
    addEmail,
    addProfileUrl,
    addName,
    addGender,
    addAgegroup,
    addPreferredTags,
    addUserSocialTF,
    addTravelDistance,
    addVisitedCountryCount,
    addTravelBadgeCount,
  } = myPageStore();

  const { data, isLoading, profileImage, isLoadingImage, firstProfileImageMutation, isFirstProfileImagePostSuccess } =
    useMyPage();
  const isOnboarding = pathname?.startsWith("/onBoarding");

  const { ROUTES, checkRoute } = useHeaderNavigation();

  const myPageData: ImyPage = data as any;
  const profileImg: IProfileImg = profileImage as IProfileImg;
  useEffect(() => {
    if (!isLoading && myPageData) {
      addName(myPageData.name);
      addAgegroup(myPageData.ageGroup);
      addEmail(myPageData.email);
      addPreferredTags(myPageData.preferredTags);
      addGender(myPageData.gender);
      addUserSocialTF(myPageData.userSocialTF);
      addTravelDistance(myPageData.travelDistance);
      addTravelBadgeCount(myPageData.travelBadgeCount);
      addVisitedCountryCount(myPageData.visitedCountryCount);
      const tags: string[] = [];
      for (const tag of myPageData.preferredTags) {
        const text = tag.split(" ");

        tags.push(text[text.length - 1]);
      }
      addPreferredTags(tags);
    }
    if (!isLoadingImage && profileImg) {
      addProfileUrl(profileImg.url);
    }
  }, [isLoading, myPageData, profileImage, isLoadingImage]); // 새로고침 시, 토큰이 다시 생겼을 때 정보 할당히 가능하도록.

  useEffect(() => {
    if (
      accessToken !== null &&
      !isLoadingImage &&
      !profileImg &&
      !isFirstProfileImagePostSuccess // 성공 여부 확인
    ) {
      // 이미 가입한 회원들의 경우. post 요청으로 첫 이미지 등록 요청.
      firstProfileImageMutation(accessToken);
    }
  }, [accessToken, isLoadingImage, profileImg, isFirstProfileImagePostSuccess]);

  useEffect(() => {
    // 컴포넌트가 렌더링될 때마다 토큰 갱신 시도(새로고침시 토큰 사라지는 문제해결 위해)
    if (!accessToken && !logoutCheck && !checkRoute.startsWith("/login/oauth")) {
      // 토큰이 없으면 리프레쉬 토큰 api 요청.
      const refreshAccessToken = async () => {
        userPostRefreshToken();
      };

      refreshAccessToken();
    }
  }, [accessToken]);

  const { splashOn } = splashOnStore();
  // 배경이 검색창 색인 경우 제외하고는 BG색. 노치 영역 색 지정해서 변경시키기.
  const backGroundGrey = ["/trip/detail", "/", "/myTrip", "/requestedTrip"];
  useEffect(() => {
    if (splashOn === true) return;
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeColorMetaTag) {
      themeColorMetaTag.setAttribute("content", backGroundGrey.includes(pathname ?? "") ? "#F5F5F5" : "var(--color-bg)");
    }
  }, [pathname]);

  const bodyBgColor =
    checkRoute.exact("/") ||
    checkRoute?.exact("/create/trip/detail") ||
    checkRoute?.startsWith("/notification") ||
    checkRoute?.startsWith("/community/detail")
      ? "#f5f5f5"
      : checkRoute?.startsWith("/trip/detail") ||
          checkRoute?.startsWith("/myTrip") ||
          checkRoute?.startsWith("/requestedTrip")
        ? "var(--color-search-bg)"
        : "var(--color-bg)";

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API || ""}>
      <div
        className="overflow-x-hidden flex justify-center items-center"
        style={{
          height: pathname !== "/" ? "100svh" : "auto",
          width: pathname !== "/" ? "100svw" : "auto",
        }}
      >
        <Splash />
        <div
          className="relative h-full overscroll-none no-scrollbar w-svw min-[440px]:w-[390px] min-[440px]:overflow-x-hidden"
          style={{ backgroundColor: bodyBgColor }}
        >
          {/* {isSignup && <Header />} */}
          {/* 홈 화면 헤더는 다른 형태. */}
          {pathname !== "/" &&
            !isOnboarding &&
            pathname !== "/registerDone" &&
            pathname !== "/login" &&
            pathname !== "/trip/list" &&
            pathname !== "/community" &&
            !checkRoute.exact(ROUTES.BLOCK) &&
            !checkRoute.startsWith(ROUTES.SEARCH.PLACE) && <Header />}
          {children}
          {/* {accessToken || isAccessTokenNoNeedpages(pathname) ? (
          <Outlet />
        ) : (
          <Navigate to="/login" />
        )} */}

          {/* 로그인을 해야만 보이는거 처리. */}
          <Navbar />
        </div>
      </div>
    </APIProvider>
  );
};

export default Layout;
