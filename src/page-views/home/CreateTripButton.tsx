"use client";
import AddIcon from "@/components/icons/AddIcon";
import useViewTransition from "@/hooks/useViewTransition";
import { useBackPathStore } from "@/store/client/backPathStore";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isGuestUser } from "@/utils/user";

interface CreateTripButtonProps {
  type?: "trip" | "community";
}

export default function CreateTripButton({
  type = "trip",
}: CreateTripButtonProps) {
  const [isClicked, setIsClicked] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null); // 버튼 참조
  const pathname = usePathname();
  const router = useRouter();
  const { setCreateTripPlace } = useBackPathStore();
  const createButtonRef = useRef<HTMLButtonElement>(null); // 버튼 참조
  const toggleRotation = () => {
    setIsClicked(!isClicked);
  };
  const navigateWithTransition = useViewTransition();
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 초기값 설정
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // resize 이벤트 핸들러
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);

    // 클린업
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  //가로화면 길이가 좁아질 경우 right 조절.
  const newRightPosition = (24 + 390 - windowSize.width).toString() + "px";
  const buttonRight =
    windowSize.width > 0 && windowSize.width < 390 ? newRightPosition : "24px";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 만약 클릭한 곳이 버튼이 아닌 경우
      if (
        createButtonRef.current &&
        !createButtonRef.current.contains(event.target as Node) &&
        addRef.current &&
        !addRef.current.contains(event.target as Node)
      ) {
        setIsClicked(false); // 상태를 false로 변경
      }
    };

    // 문서에 click 이벤트를 등록
    document.addEventListener("click", handleClickOutside);

    // cleanup 함수: 이벤트 해제
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const onClickCreate = () => {
    if (isGuestUser()) {
      router.push("/login");
      return;
    }
    setCreateTripPlace(pathname === "/trip/list" ? "/trip/list" : "/");
    document.documentElement.style.viewTransitionName = "forward";

    if (type === "community") {
      navigateWithTransition("/community/create");
    } else {
      navigateWithTransition("/create/trip/region");
    }
  };

  return (
    <div className="h-svh w-[390px] pointer-events-none fixed top-0 z-[1001]">
      {/* CreateBtn */}
      <button
        className="absolute bottom-[210px] pointer-events-auto h-12 py-[14px] px-6 rounded-[20px] cursor-pointer bg-white flex justify-center items-center text-base font-semibold leading-[19.09px] text-[var(--color-text-base)] z-[1003] transition-[transform,opacity] duration-200 ease-in-out"
        style={{
          right: buttonRight,
          opacity: isClicked ? 1 : 0,
          transform: isClicked ? "translateY(-5px)" : "translateY(35px)",
        }}
        onClick={onClickCreate}
        ref={createButtonRef}
      >
        <img
          src={
            type === "community"
              ? "/images/createCommunityBtn.png"
              : "/images/createTripBtn.png"
          }
          alt=""
          style={{ marginRight: "13px" }}
        />
        {type === "trip" ? "여행 만들기" : "글쓰기"}
      </button>

      {/* IconContainer */}
      <button
        type="button"
        ref={addRef}
        onClick={toggleRotation}
        className="absolute pointer-events-auto bottom-[124px] cursor-pointer w-[70px] h-[70px] rounded-full flex justify-center items-center text-white bg-[var(--color-text-base)] z-[1003] text-[32px] transition-transform duration-300"
        style={{
          right: buttonRight,
          transform: isClicked ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        <AddIcon />
      </button>

      {isClicked && (
        <div className="absolute w-full h-svh z-[1001] top-0 bottom-0 bg-[rgba(26,26,26,0.3)] opacity-80 min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 min-[440px]:overflow-x-hidden" />
      )}
    </div>
  );
}
