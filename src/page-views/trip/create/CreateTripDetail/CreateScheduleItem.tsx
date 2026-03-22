"use client";
import DnDList from "@/components/DnDList";
import Spacing from "@/components/Spacing";
import { SpotType } from "@/model/trip";
import { tripPlanStore } from "@/store/client/tripPlanStore";
import { useRouter } from "next/navigation";
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

const CreateScheduleItem = ({
  title,
  idx,
  isOpen,
  onToggle,
  type,
  plans,
  addPlans,
  travelNumber,
}: {
  title: string;
  idx: number;
  type: "create" | "edit";
  isOpen: boolean;
  onToggle: () => void;
  plans: {
    planOrder: number;
    spots: SpotType[];
  }[];
  travelNumber?: number;
  addPlans: (
    plans: {
      planOrder: number;
      spots: SpotType[];
    }[]
  ) => void;
}) => {
  const {
    scrollTop,
    addScrollTop,
    planIndex,
    addPlanIndex,
    isChange,
    addIsChange,
  } = tripPlanStore();
  const [contentHeight, setContentHeight] = useState(0);
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const plan = plans.find(
    (plan) => plan.planOrder === (type === "create" ? idx : idx + 1)
  );
  const count = plan?.spots?.length ?? 0;
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight + 32);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollTop > 0 && isChange) {
      document.getElementById("container-scroll")?.scrollTo({
        top:
          scrollTop +
          (document.getElementById("top-scroll")?.clientHeight ?? 0),
      });
      setTimeout(() => {
        addScrollTop(0);
        addIsChange(false);
      }, 1000);
    }
  }, [scrollTop]);

  const clickPlans = () => {
    addScrollTop(document.getElementById("container-scroll")?.scrollTop ?? 0);
    addPlanIndex(idx);
    router.push(
      `/search/place/${idx}?type=${type}${type === "edit" ? `&travelNumber=${travelNumber}` : ""}`
    );
  };

  return (
    <div className="py-[13px] bg-white rounded-[20px]">
      <li className="overflow-hidden list-none">
        <input
          id={title}
          type="checkbox"
          style={{ display: "none" }}
          checked={isOpen}
          onChange={onToggle}
        />
        <label
          htmlFor={title}
          className="flex text-base leading-4 items-center justify-between h-[42px] px-4 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="font-semibold text-base text-black">Day {idx + 1}</div>
            <div className="font-normal text-xs text-[var(--color-text-muted)]">{title}</div>
          </div>
          <div className="flex items-center">
            {count > 0 && (
              <div className="w-[18px] h-4 bg-[var(--color-keycolor)] rounded-[20px] text-center flex items-center justify-center box-border text-xs font-semibold text-[var(--color-muted4)]">
                {count}
              </div>
            )}
            <div
              className="flex justify-center items-center w-[42px] h-[42px]"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0)",
              }}
            >
              <svg
                width="14"
                height="8"
                viewBox="0 0 14 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L7 7L13 1"
                  stroke="#848484"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </label>
        <div
          ref={contentRef}
          style={{
            height: isOpen ? `${contentHeight}px` : "0",
            overflow: "hidden",
            padding: isOpen ? "16px 6px" : "0",
            transition: "height 0.4s ease-in-out, padding 0.4s ease-in-out, transform 0.4s ease-in-out",
          }}
        >
          {plan?.planOrder !== undefined && (
            <DnDList
              plans={plans}
              addPlans={addPlans}
              planOrder={plan!.planOrder}
            />
          )}
          <Spacing size={16} />
          <button
            type="button"
            className="rounded-[40px] w-full h-[42px] cursor-pointer bg-[var(--color-muted4)] text-[var(--color-text-muted)] text-sm font-semibold leading-[17px] text-center"
            onClick={clickPlans}
          >
            +장소추가
          </button>
        </div>
      </li>
    </div>
  );
};

export default CreateScheduleItem;
