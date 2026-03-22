import React, { useEffect } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { getDateByPlanOrder } from "@/utils/time";
import Spacing from "@/components/Spacing";
import { SpotType } from "@/entities/trip";
import TripCarouselItem from "./TripCarouselItem";

type PropType = {
  slides: { planOrder: number; spots: SpotType[] }[];
  options?: EmblaOptionsType;
  startDate: string;
  inView?: React.ReactNode;
  openItemIndex: number;
  setOpenItemIndex: React.Dispatch<React.SetStateAction<number>>;
};

const TripCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const updateSelectedIndex = () => {
    if (emblaApi) {
      props.setOpenItemIndex(emblaApi.selectedScrollSnap());
    }
  };

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", updateSelectedIndex); // 슬라이드 변경 시 호출
      updateSelectedIndex(); // 초기값 설정
    }
  }, [emblaApi]);

  return (
    <div
      className="max-w-[48rem]"
      style={
        {
          "--slide-height": "19rem",
          "--slide-size": "70%",
        } as React.CSSProperties
      }
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div
          className="flex -ml-3"
          style={{ touchAction: "pan-y pinch-zoom" }}
        >
          {slides?.map((item, index) => (
            <div
              key={index}
              className="flex-[0_0_87%] min-w-0 pl-3"
              style={{ transform: "translate3d(0, 0, 0)" }}
            >
              <div className="py-5 bg-white rounded-[20px] select-none">
                <label className="block text-base leading-[16px] h-[42px] px-5">
                  <div className="flex items-center gap-2 px-5">
                    <div className="font-semibold text-base text-black">
                      Day {item.planOrder}
                    </div>
                    <div className="font-normal text-xs text-[var(--color-text-muted)]">
                      {getDateByPlanOrder(props.startDate, item.planOrder)}
                    </div>
                    <div className="w-[18px] h-4 bg-[var(--color-keycolor)] rounded-[20px] flex items-center justify-center text-xs font-semibold text-[var(--color-muted4)]">
                      {item.spots.length}
                    </div>
                  </div>
                  <Spacing size={16} />
                  <TripCarouselItem spots={item.spots} />
                </label>
              </div>
              {index === slides.length - 1 && props.inView}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripCarousel;
