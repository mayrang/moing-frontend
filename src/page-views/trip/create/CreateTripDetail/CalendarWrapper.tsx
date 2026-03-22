"use client";
import Calendar from "@/components/icons/Calendar";
import React, { useState } from "react";
import { formatDateRange } from "@/page-views/trip/create/CalendarClient";
import ArrowIcon from "@/components/icons/ArrowIcon";
import CalendarModal from "@/page-views/trip/create/CalendarModal";

const CalendarWrapper = ({
  date,
  addDate,
}: {
  date?: {
    startDate: string;
    endDate: string;
  } | null;
  addDate: ({
    startDate,
    endDate,
  }: {
    startDate: string;
    endDate: string;
  }) => void;
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <CalendarModal
        addDate={addDate}
        showModal={showModal}
        initDate={date}
        setShowModal={setShowModal}
      />
      <div
        className="py-[11px] pl-2 flex cursor-pointer items-center justify-between"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center">
          <div className="flex items-center w-[100px] gap-2 mr-3">
            <Calendar />
            <div className="text-sm leading-5 text-[var(--color-text-muted)] font-semibold">여행 날짜</div>
          </div>
          <div className="text-sm leading-5 text-[var(--color-text-base)] font-medium">
            {date
              ? formatDateRange(date?.startDate ?? "", date?.endDate ?? "")
              : "날짜를 선택하세요."}
          </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12">
          <ArrowIcon />
        </div>
      </div>
    </>
  );
};

export default CalendarWrapper;
