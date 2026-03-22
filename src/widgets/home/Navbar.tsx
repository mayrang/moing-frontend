"use client";
import CommnunityIcon from "@/components/icons/CommnunityIcon";
import EmptyHeartIcon from "@/components/icons/EmptyHeartIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import NavCommunityIcon from "@/components/icons/NavCommunityIcon";
import NavPersonIcon from "@/components/icons/NavPersonIcon";
import SearchIcon from "@/components/icons/SearchIcon";
import { useClickTracking } from "@/hooks/useClickTracking";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { track } = useClickTracking();
  // const pages = ['/', '/search/travel', '/myTrip', '/community', '/mypage']
  const pages = ["/", "/trip/list", "/myTrip", "/community", "/myPage"];
  const icons = [
    <HomeIcon width={20} height={20} />,
    <SearchIcon width={22} height={19} />,
    <EmptyHeartIcon width={22} height={20} />,
    <NavCommunityIcon />,
    <NavPersonIcon width={20} height={20} />,
  ];
  const iconNames = ["홈", "여행 찾기", "내 여행", "커뮤니티", "MY"];

  const getIsActive = (page: string) => {
    if (
      page === "/myPage" &&
      (pathname === "/editMyInfo" ||
        pathname === "/announcement" ||
        pathname === "/requestedTrip" ||
        pathname === "/myCommunity")
    ) {
      return true;
    }

    return pathname === page;
  };
  const condition = () => {
    if (
      pathname === "/" ||
      pathname === "/myTrip" ||
      pathname === "/community" ||
      pathname === "/myPage" ||
      pathname === "/trip/list" ||
      pathname === "/editMyInfo" ||
      pathname === "/announcement" ||
      pathname === "/requestedTrip" ||
      pathname === "/myCommunity" ||
      pathname.startsWith("/contact/")
    )
      return true;
    return false;
  };

  const handleNavClick = (page: string) => {
    track(`하단 네비게이션 ${page} 버튼 클릭`);
    router.push(page);
  };

  return condition() ? (
    <div className="h-[92px] w-full left-0 max-[440px]:w-full min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 min-[440px]:overflow-x-hidden rounded-tl-[20px] rounded-tr-[20px] fixed bottom-0 border-t border-[var(--color-muted5)] bg-white z-[1000]">
      <div className="flex mt-3 justify-evenly">
        {pages.map((page, idx) => {
          const Icon = icons[idx];
          const isLinkActive = getIsActive(page);
          const activeColor = "var(--color-text-base)";
          const inactiveColor = "var(--color-muted3)";
          const iconProps = {
            stroke: isLinkActive ? activeColor : inactiveColor,
            fill: isLinkActive ? activeColor : "none",
          };
          return (
            <button
              key={page}
              type="button"
              onClick={() => handleNavClick(page)}
              className="w-[49px] h-12 cursor-pointer flex flex-col items-center justify-center"
            >
              {React.cloneElement(Icon, iconProps)}
              <div
                className="text-xs font-semibold leading-[16px] text-center w-full mt-[8.45px]"
                style={{ color: isLinkActive ? activeColor : inactiveColor }}
              >
                {iconNames[idx]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  ) : null;
};
export default Navbar;
