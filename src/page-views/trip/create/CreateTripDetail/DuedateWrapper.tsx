"use client";
import BottomModal from "@/components/BottomModal";
import Spacing from "@/components/Spacing";
import React, { useEffect, useState } from "react";
import Button from "@/components/designSystem/Buttons/Button";
import Vector from "@/components/icons/Vector";
import DuedatePickerView from "./DuedatePickerView";
import Calendar from "@/components/icons/Calendar";
import { tripDetailStore } from "@/store/client/tripDetailStore";
import { createTripStore } from "@/store/client/createTripStore";
import { usePathname } from "next/navigation";

interface DateValue {
  year: number;
  month: number;
  day: number;
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

export default function DuedateWrapper() {
  const { dueDate } = tripDetailStore();

  const { dueDate: dueDateForCreateTrip } = createTripStore();
  const [year, month, date] = dueDateForCreateTrip.split("-").map((e) => +e);

  const [showModal, setShowModal] = useState(false);
  const pathname = usePathname();
  const isCreateTripDetailPage = pathname === "/createTripDetail";
  const [duedate, setDuedate] = useState<DateValue>(
    isCreateTripDetailPage ? { year: year, month: month, day: date } : dueDate
  );

  const day = new Date(`${duedate.year}/${duedate.month}/${duedate.day}`);
  const dayOfWeek = WEEKDAY[day.getDay()];
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const duedateSubmitHandler = () => {
    setShowModal(false);
  };
  const newRightPosition = windowSize.width.toString() + "px";
  return (
    <>
      <div className="mt-6">
        <div className="text-lg font-semibold leading-[25.2px] text-left text-[var(--color-text-base)] h-[25px] px-[6px] gap-2">모집 마감일</div>
        <button
          type="button"
          className="flex items-center justify-between mt-2 w-full h-12 px-4 py-3 rounded-[20px] border border-[var(--color-muted3)] cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Calendar />
            <div className="text-base font-semibold leading-5 text-center ml-2">
              {duedate.year}. {duedate.month < 10 ? `0${duedate.month}` : duedate.month}.{" "}
              {duedate.day < 10 ? `0${duedate.day}` : duedate.day} ({dayOfWeek})
            </div>
          </div>
          <Vector />
        </button>
      </div>
      {showModal && (
        <BottomModal
          initialHeight={windowSize.height <= 700 ? 58 : 50}
          closeModal={handleCloseModal}
        >
          <div style={{ marginTop: "6px" }}>
            <div style={{ padding: "0px 24px" }}>
              <div className="text-lg font-semibold leading-[25.2px] text-left text-[var(--color-text-base)] h-[25px] px-[6px] gap-2">모집 마감일</div>
              <Spacing size={40} />
              <DuedatePickerView duedate={duedate} setDuedate={setDuedate} />
            </div>
          </div>
          <div
            style={{
              width: windowSize.width < 390 ? newRightPosition : "390px",
              position: "fixed",
              bottom: "4.7svh",
              padding: "0px 24px",
              zIndex: 10,
            }}
          >
            <Button
              text="완료"
              onClick={duedateSubmitHandler}
              addStyle={{
                backgroundColor: "rgba(62, 141, 0, 1)",
                color: "rgba(240, 240, 240, 1)",
                boxShadow: "rgba(170, 170, 170, 0.1)",
              }}
            />
          </div>
        </BottomModal>
      )}
    </>
  );
}
