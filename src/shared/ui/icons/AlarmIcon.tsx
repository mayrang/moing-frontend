"use client";
import useNotification from "@/hooks/notification/useNotification";
import Image from "next/image";

interface AlarmProps {
  size?: number;
  stroke?: string;
}

const AlarmIcon = ({
  size = 24,
  stroke = "var(--color-text-base)",
}: AlarmProps) => {
  const { data } = useNotification();
  const hasUnread = data?.pages.some((page) =>
    page.content.some((item) => !item.isRead)
  );
  return (
    <div className="relative w-5 h-[23px]">
      <Image alt="alarm icon" height={23} width={20} src="/images/alarm.svg" priority />
      {hasUnread && (
        <div className="bg-[#ea2a2a] absolute top-[-1px] right-[-1px] h-2 w-2 rounded-full" />
      )}
    </div>
  );
};

export default AlarmIcon;
