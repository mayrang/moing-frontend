'use client';
import React from 'react';
import dayjs from 'dayjs';
import { CalendarDay } from '@/utils/calendar';
import isBetween from 'dayjs/plugin/isBetween';
import Spacing from '@/shared/ui/layout/Spacing';
import { cn } from '@/shared/lib/cn';

dayjs.extend(isBetween);

interface CalendarProps {
  calendarYear: number;
  calendarMonth: number;
  calendarData: CalendarDay[][];
  clickNext: () => void;
  clickPrev: () => void;
  onDateClick: (date: CalendarDay) => void;
}

const getPostContainerStyle = (
  isStart: boolean,
  isEnd: boolean,
  isMultiple: boolean,
  isSelect: boolean,
): React.CSSProperties => {
  if (isStart || isEnd) {
    if (isMultiple) {
      if (isStart) {
        return {
          border: '1px solid var(--color-keycolor)',
          width: '42px',
          borderRight: '0px',
          borderTopLeftRadius: '50%',
          borderBottomLeftRadius: '50%',
        };
      } else {
        return {
          border: '1px solid var(--color-keycolor)',
          width: '42px',
          borderLeft: '0px',
          borderTopRightRadius: '50%',
          borderBottomRightRadius: '50%',
        };
      }
    } else {
      return {
        width: '42px',
        borderRadius: '50%',
        border: '1px solid var(--color-keycolor)',
      };
    }
  } else if (isSelect) {
    return {
      width: '100%',
      borderTop: '1px solid var(--color-keycolor)',
      borderBottom: '1px solid var(--color-keycolor)',
    };
  }
  return {};
};

const getMultipleBorderStyle = (
  isStart: boolean,
  isEnd: boolean,
  isMultiple: boolean,
): React.CSSProperties => {
  if ((isStart || isEnd) && isMultiple) {
    if (isStart) {
      return {
        right: 0,
        borderTop: '1px solid var(--color-keycolor)',
        borderBottom: '1px solid var(--color-keycolor)',
      };
    } else {
      return {
        left: 0,
        borderTop: '1px solid var(--color-keycolor)',
        borderBottom: '1px solid var(--color-keycolor)',
      };
    }
  }
  return {};
};

const Calendar: React.FC<CalendarProps> = ({
  calendarYear,
  calendarMonth,
  calendarData,
  clickNext,
  clickPrev,
  onDateClick,
}) => {
  return (
    <div className="flex flex-col h-auto items-center justify-center">
      <div className="pl-1 font-semibold text-lg leading-[25px] text-[var(--color-text-base)] mb-2 w-full">
        {calendarYear}년 {calendarMonth}월
      </div>
      <div className="w-full bg-white flex flex-col">
        {calendarData.map((week, weekIdx) => (
          <React.Fragment key={weekIdx}>
            <div className="flex items-center flex-1 w-full">
              {week.map((date, dateIdx) => {
                const isStart = !!(date.posts && date.posts[0]?.start);
                const isEnd = !!(
                  date.posts &&
                  date.posts[0]?.endTime &&
                  dayjs(date.dayFormat).isSame(dayjs(date.posts[0].endTime), 'day')
                );
                const isMultiple = !!(date.posts && date.posts[0]?.multiple);
                const isPrevDay = dayjs(date.dayFormat).isBefore(dayjs(), 'day');
                const isOtherMonth = date.type === 'prev' || date.type === 'next';
                const isToday = date.dayFormat === dayjs().format('YYYYMMDD');
                const isSelected = date.type === 'now';
                const isSelect = !!(date.posts && date.posts[0]?.startTime);

                return (
                  <div
                    key={dateIdx}
                    className="relative w-full h-[42px] flex-1 flex items-center justify-center overflow-hidden whitespace-nowrap text-ellipsis"
                    onClick={() => onDateClick(date)}
                  >
                    <div
                      className={cn(
                        'text-sm font-medium w-full h-[42px] leading-[42px] text-center z-10 relative',
                        isPrevDay ? 'cursor-auto' : 'cursor-pointer',
                        isToday ? 'w-[42px] bg-[var(--color-muted5)] rounded-full' : '',
                        isOtherMonth
                          ? 'text-transparent'
                          : isPrevDay
                            ? 'text-[var(--color-text-muted2)]'
                            : isSelected
                              ? 'text-[var(--color-keycolor)]'
                              : 'text-[var(--color-text-base)]',
                      )}
                    >
                      {date.date}
                    </div>
                    <div
                      className="absolute w-full h-[42px]"
                      style={getPostContainerStyle(isStart, isEnd, isMultiple, isSelect)}
                    />
                    <div
                      className="w-1/2 absolute h-[42px] top-0"
                      style={getMultipleBorderStyle(isStart, isEnd, isMultiple)}
                    />
                  </div>
                );
              })}
            </div>
            {weekIdx !== calendarData.length - 1 && <Spacing size={16} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
