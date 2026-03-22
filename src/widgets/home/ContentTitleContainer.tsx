"use client";
import ArrowIcon from "@/components/icons/ArrowIcon";
import { useRouter } from "next/navigation";
import { useClickTracking } from "@/hooks/useClickTracking";

interface TitleContainerProps {
  text: React.ReactNode;
  minWidth?: string;
  detailLink?: string;
  linkText?: string;
}

const TitleContainer = ({
  text,
  minWidth = "auto",
  detailLink = "/",
  linkText = "",
}: TitleContainerProps) => {
  const router = useRouter();
  const { track } = useClickTracking();
  const clickHandler = () => {
    track(`${linkText} 버튼 클릭`);
    router.push(`${detailLink}`);
  }; // 후에 보여줄 페이지 부분.
  return (
    <div className="flex justify-between items-center">
      <span
        className="text-xl font-semibold leading-[28px] text-left"
        style={{ minWidth }}
      >
        {text}
      </span>
      <div
        className="w-12 h-12 flex cursor-pointer items-center justify-center"
        onClick={clickHandler}
      >
        <ArrowIcon />
      </div>
    </div>
  );
};

export default TitleContainer;
