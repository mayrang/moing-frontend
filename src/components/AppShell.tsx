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
import { useHeaderNavigation } from "@/hooks/useHeaderNavigation";

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { userPostRefreshToken } = useAuth();
  const { accessToken, logoutCheck } = authStore();

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
  }, [isLoading, myPageData, profileImage, isLoadingImage]);

  useEffect(() => {
    if (
      accessToken !== null &&
      !isLoadingImage &&
      !profileImg &&
      !isFirstProfileImagePostSuccess
    ) {
      firstProfileImageMutation(accessToken);
    }
  }, [accessToken, isLoadingImage, profileImg, isFirstProfileImagePostSuccess]);

  useEffect(() => {
    if (!accessToken && !logoutCheck && !checkRoute.startsWith("/login/oauth")) {
      const refreshAccessToken = async () => {
        userPostRefreshToken();
      };
      refreshAccessToken();
    }
  }, [accessToken]);

  const { splashOn } = splashOnStore();
  const backGroundGrey = ["/trip/detail", "/", "/myTrip", "/requestedTrip"];
  useEffect(() => {
    if (splashOn === true) return;
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeColorMetaTag) {
      themeColorMetaTag.setAttribute(
        "content",
        backGroundGrey.includes(pathname ?? "") ? "#F5F5F5" : "var(--color-bg)"
      );
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
    <div
      className="overflow-x-hidden flex justify-center items-center"
      style={{
        height: pathname !== "/" ? "100svh" : "auto",
        width: pathname !== "/" ? "100svw" : "auto",
      }}
    >
      <Splash />
      <main
        className="relative h-full overscroll-none no-scrollbar w-svw min-[440px]:w-[390px] min-[440px]:overflow-x-hidden"
        style={{ backgroundColor: bodyBgColor }}
      >
        {pathname !== "/" &&
          !isOnboarding &&
          pathname !== "/registerDone" &&
          pathname !== "/login" &&
          pathname !== "/trip/list" &&
          pathname !== "/community" &&
          !checkRoute.exact(ROUTES.BLOCK) &&
          !checkRoute.startsWith(ROUTES.SEARCH.PLACE) && <Header />}
        {children}
        <Navbar />
      </main>
    </div>
  );
};

export default AppShell;
