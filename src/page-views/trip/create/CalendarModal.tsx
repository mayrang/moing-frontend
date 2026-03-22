"use client";
import BottomModal from "@/components/BottomModal";
import ButtonContainer from "@/components/ButtonContainer";
import Button from "@/components/designSystem/Buttons/Button";
import Spacing from "@/components/Spacing";
import { createTripStore } from "@/store/client/createTripStore";
import { CalendarDay, Post, setCalendarArray } from "@/utils/calendar";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import Calendar from "@/components/calendar/CalendarView";
import ResultToast from "@/components/designSystem/toastMessage/resultToast";

interface CalendarModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  addDate: ({ startDate, endDate }: { startDate: string; endDate: string }) => void;
  initDate?: {
    startDate: string;
    endDate: string;
  } | null;
}

function isMoreThan90DaysApart(date1, date2) {
  const d1 = dayjs(date1);
  const d2 = dayjs(date2);

  // 두 날짜 사이의 차이를 일 단위로 계산
  const diffInDays = Math.abs(d1.diff(d2, "day"));

  return diffInDays > 90;
}

const CalendarModal = ({ showModal, setShowModal, addDate, initDate }: CalendarModalProps) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const [startTime, setStartTime] = useState<string | undefined>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [holidaysArray, setHollidaysArray] = useState<any[]>([]);
  const currentMonth = currentDate.getMonth() + 1;
  const [isToastShow, setIsToastShow] = useState(false); // 삭제 완료 메시지.

  const [calendarDataArray, setCalendarDataArray] = useState<
    { year: number; month: number; calendarData: CalendarDay[][] }[]
  >([]);

  useEffect(() => {
    if (initDate?.startDate) {
      setPosts([
        {
          calendarId: Math.random().toString(36).substr(2, 9),
          startTime: dayjs(initDate.startDate).format("YYYY-MM-DD HH:mm:ss"),
          endTime: dayjs(initDate.endDate).format("YYYY-MM-DD HH:mm:ss"),
          content: `${dayjs(initDate.startDate).format("YYYY-MM-DD")} ~ ${dayjs(initDate.endDate).format("YYYY-MM-DD")}`,
        },
      ]);
      const updatedCalendarDataArray = calendarDataArray.map(({ year, month, calendarData }) => ({
        year,
        month,
        calendarData: setCalendarArray(
          year,
          month,
          holidaysArray.find((h) => h.year === year && h.month === month)?.holidays || [],
          [
            {
              calendarId: Math.random().toString(36).substr(2, 9),
              startTime: dayjs(initDate.startDate).format("YYYY-MM-DD HH:mm:ss"),
              endTime: dayjs(initDate.endDate).format("YYYY-MM-DD HH:mm:ss"),
              content: `${dayjs(initDate.startDate).format("YYYY-MM-DD")} ~ ${dayjs(initDate.endDate).format("YYYY-MM-DD")}`,
            },
          ]
        ),
      }));

      setCalendarDataArray(updatedCalendarDataArray);
    }
  }, [initDate?.startDate, initDate?.endDate]);

  useEffect(() => {
    for (let i = 0; i < 6; i++) {
      let year = currentYear;
      let month = currentMonth + i;

      if (month > 12) {
        month -= 12;
        year += 1;
      }

      //  const holidays = await getHolidays(year, month);
      setHollidaysArray((prev) => [...prev, { year, month, holidays: [] }]);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    const initialCalendarDataArray = holidaysArray.map(({ year, month, holidays }) => ({
      year,
      month,
      calendarData: setCalendarArray(year, month, holidays, posts),
    }));
    setCalendarDataArray(initialCalendarDataArray);
  }, [holidaysArray.length]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDate = () => {
    if (posts.length === 0) return;
    addDate({
      startDate: `${dayjs(posts[0].startTime).format("YYYY-MM-DD")}`,
      endDate: `${dayjs(posts[0].endTime).format("YYYY-MM-DD")}`,
    });
    setShowModal(false);
  };

  const handleDateClick = (clickedDate: CalendarDay, year: number, month: number) => {
    if (clickedDate.type !== "now") return;
    const clickedDayjs = dayjs(`${year}-${month.toString().padStart(2, "0")}-${clickedDate.date}`);

    if (clickedDayjs.isBefore(dayjs(), "day")) {
      return;
    }
    let newPost: any = {};
    if (!startTime) {
      newPost = {
        calendarId: Math.random().toString(36).substr(2, 9),
        startTime: clickedDayjs.format("YYYY-MM-DD HH:mm:ss"),
        endTime: clickedDayjs.format("YYYY-MM-DD HH:mm:ss"),

        content: `${clickedDayjs.format("YYYY-MM-DD")}`,
      };

      setStartTime(clickedDayjs.format("YYYY-MM-DD HH:mm:ss"));
    } else {
      const startDayjs = dayjs(startTime);
      if (isMoreThan90DaysApart(startTime, clickedDayjs)) {
        setIsToastShow(true);
        return;
      }
      if (clickedDayjs.isBefore(startDayjs)) {
        newPost = {
          calendarId: Math.random().toString(36).substr(2, 9),
          startTime: clickedDayjs.format("YYYY-MM-DD HH:mm:ss"),
          endTime: startDayjs.format("YYYY-MM-DD HH:mm:ss"),
          content: `${clickedDayjs.format("YYYY-MM-DD")} ~ ${startDayjs.format("YYYY-MM-DD")}`,
        };
      } else {
        newPost = {
          calendarId: Math.random().toString(36).substr(2, 9),
          startTime: startTime,
          endTime: clickedDayjs.format("YYYY-MM-DD HH:mm:ss"),
          content: `${startDayjs.format("YYYY-MM-DD")} ~ ${clickedDayjs.format("YYYY-MM-DD")}`,
        };
      }
      setStartTime(undefined);
    }
    const updatedPosts = [newPost];
    setPosts(updatedPosts);
    const updatedCalendarDataArray = calendarDataArray.map(({ year, month, calendarData }) => ({
      year,
      month,
      calendarData: setCalendarArray(
        year,
        month,
        holidaysArray.find((h) => h.year === year && h.month === month)?.holidays || [],
        updatedPosts
      ),
    }));

    setCalendarDataArray(updatedCalendarDataArray);
  };
  if (!calendarDataArray.length) {
    return <></>; // 서버와 클라이언트 모두 동일한 HTML 출력
  }

  return (
    <>
      <ResultToast
        isShow={isToastShow}
        setIsShow={setIsToastShow}
        bottom="112px"
        text="최대 90일까지 선택할 수 있어요"
      />
      {showModal && (
        <BottomModal initialHeight={75} closeModal={handleCloseModal}>
          <div className="flex flex-col h-full relative overflow-hidden">
            <div className="grow overflow-y-auto px-5 mt-[45px] pb-[104px] no-scrollbar">
              <div className="absolute flex w-[calc(100%-48px)] top-0 pb-4 border-b border-[#e7e7e7] text-sm leading-7 font-semibold text-[var(--color-text-muted)] text-center">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div key={day} className="flex-1 h-7 text-center">{day}</div>
                ))}
              </div>
              <Spacing size={20} />
              {calendarDataArray.map((data, index) => (
                <>
                  <Calendar
                    calendarYear={data.year}
                    calendarMonth={data.month}
                    calendarData={data.calendarData}
                    clickNext={() => {}}
                    clickPrev={() => {}}
                    onDateClick={(date) => handleDateClick(date, data.year, data.month)}
                  />
                  <Spacing size={28} />
                </>
              ))}
            </div>
          </div>
          <ButtonContainer>
            <Button
              onClick={handleDate}
              disabled={posts.length === 0}
              addStyle={
                posts.length === 0
                  ? {
                      backgroundColor: "rgba(220, 220, 220, 1)",
                      color: "rgba(132, 132, 132, 1)",
                      boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
                    }
                  : undefined
              }
              text={"완료"}
            />
          </ButtonContainer>
        </BottomModal>
      )}
    </>
  );
};


export default CalendarModal;
