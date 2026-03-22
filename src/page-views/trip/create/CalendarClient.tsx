"use client";
import React, { useState, useEffect } from "react";
import { CalendarDay, Holiday, Post, setCalendarArray } from "@/utils/calendar";
import dayjs from "dayjs";
import Spacing from "@/components/Spacing";
import ButtonContainer from "@/components/ButtonContainer";
import Button from "@/components/designSystem/Buttons/Button";
import { createTripStore } from "@/store/client/createTripStore";
import CalendarIcon from "@/components/icons/Calendar";
import SecondStepIcon from "@/components/icons/step/trip/SecondStepIcon";
import useViewTransition from "@/hooks/useViewTransition";
import CalendarModal from "./CalendarModal";
interface CalendarClientProps {
  holidaysArray: {
    year: number;
    month: number;
    holidays: Holiday[];
  }[];
}

export function formatDateRange(startDate, endDate) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (start.isSame(end, "month")) {
    // 같은 달일 경우
    return `${start.format("M월 D일")} - ${end.format("D일")}`;
  } else {
    // 다른 달일 경우
    return `${start.format("M월 D일")} - ${end.format("M월 D일")}`;
  }
}

const CalendarClient: React.FC<CalendarClientProps> = ({ holidaysArray }) => {
  const [showModal, setShowModal] = useState(false);

  const navigateWithTransition = useViewTransition();
  const { addDate } = createTripStore();
  const { date } = createTripStore();

  const handleNextStep = () => {
    if (!date) return;
    document.documentElement.style.viewTransitionName = "instant";
    navigateWithTransition("/create/trip/info");
  };

  return (
    <>
      <CalendarModal
        addDate={addDate}
        showModal={showModal}
        setShowModal={setShowModal}
      />
      <div className="px-6">
        <div className="mt-2 mb-10">
          <SecondStepIcon />
        </div>
        <h2 className="text-xl font-semibold leading-7 ml-[6px] text-left">여행 날짜를 선택해 주세요</h2>
        <Spacing size={8} />
        <button
          type="button"
          className="flex items-center justify-between bg-[var(--color-search-bg)] w-full h-12 px-4 py-3 rounded-[20px] cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <CalendarIcon />

            <div
              className="text-base leading-5 text-center ml-2"
              style={{
                fontWeight: date ? 500 : 400,
                color: date ? "var(--color-text-base)" : "var(--color-text-muted2)",
              }}
            >
              {date
                ? formatDateRange(date.startDate, date.endDate)
                : "날짜를 선택하세요."}
            </div>
          </div>
        </button>
        <ButtonContainer>
          <Button
            onClick={handleNextStep}
            disabled={date === null}
            addStyle={
              date === null
                ? {
                    backgroundColor: "rgba(220, 220, 220, 1)",
                    color: "rgba(132, 132, 132, 1)",
                    boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
                  }
                : undefined
            }
            text={"다음"}
          />
        </ButtonContainer>
      </div>
    </>
  );
};

export default CalendarClient;
