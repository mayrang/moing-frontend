"use client";
import { SpotType } from "@/entities/trip";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/shared/lib/cn";

const TripCarouselItem = ({ spots }: { spots: SpotType[] }) => {
  const [topRef, topInview] = useInView();
  const [bottomRef, bottomInview] = useInView();
  const [inView, setInview] = useState({
    top: false,
    bottom: false,
  });
  useEffect(() => {
    if (topInview) {
      setInview((prev) => ({ ...prev, top: true }));
    } else {
      setInview((prev) => ({ ...prev, top: false }));
    }

    if (bottomInview) {
      setInview((prev) => ({ ...prev, bottom: true }));
    } else {
      setInview((prev) => ({ ...prev, bottom: false }));
    }
  }, [topInview, bottomInview]);

  const isOverThree = spots.length > 3;

  return (
    <div style={{ position: "relative" }}>
      {/* TopShadow */}
      <div
        className="absolute left-0 right-0 top-0 h-[14px] z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-bg), transparent)",
          opacity: isOverThree && inView.bottom ? 1 : 0,
        }}
      />
      {/* ContentContainer */}
      <div className="max-h-[260px] overflow-y-auto no-scrollbar px-5 relative">
        <div ref={topRef} style={{ width: "100%", height: 1 }} />
        {spots.map((spot, idx) => (
          <li
            key={idx}
            className={cn(
              "flex px-[10px] items-center justify-between transition-all duration-200 ease-out h-[58px] select-none touch-none",
              idx === spots.length - 1 ? "mb-0" : "mb-[15px]"
            )}
          >
            <div className="flex gap-6 items-center">
              <div className="flex items-center justify-center text-center w-[18px] rounded-full h-[18px] bg-[var(--color-text-base)] text-white font-semibold text-xs leading-[14px]">
                {idx + 1}
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold text-black leading-[19px]">
                  {spot.name}
                </div>
                <div className="text-xs font-normal text-[var(--color-text-muted)] leading-[14px]">
                  {spot.category} · {spot.region}
                </div>
              </div>
            </div>
          </li>
        ))}
        <div ref={bottomRef} style={{ width: "100%", height: 1 }} />
      </div>
      {/* BottomShadow */}
      <div
        className="absolute left-0 right-0 bottom-0 h-[14px] z-[1] pointer-events-none"
        style={{
          background: "linear-gradient(to top, var(--color-bg), transparent)",
          opacity: isOverThree && inView.top ? 1 : 0,
        }}
      />
    </div>
  );
};

export default TripCarouselItem;
