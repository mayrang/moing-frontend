'use client';
import { INotificationContent } from '@/model/notification';
import React from 'react';
import { formatTime } from '@/utils/time';
import Badge from '@/shared/ui/badge/Badge';
import CommunityNotification from '@/components/icons/CommunityNotification';
import TripNotificationIcon from '@/components/icons/TripNotificationIcon';
import { useRouter } from 'next/navigation';
import { useBackPathStore } from '@/store/client/backPathStore';

interface NotificationItemProps {
  data: INotificationContent;
}

const NotificationItem = ({ data }: NotificationItemProps) => {
  const router = useRouter();
  const { setTravelDetail } = useBackPathStore();

  const onclickLink = () => {
    if (data.title === '멤버 댓글 알림') {
      router.push(`/trip/comment/${data.travelNumber}`);
    } else if (data.title === '커뮤니티') {
      router.push(`/community/detail/${data.communityNumber}`);
    } else if (data?.title === '신고 접수 경고') {
      return;
    } else {
      router.push(`/trip/detail/${data.travelNumber}`);
      setTravelDetail('/notification');
    }
  };

  return (
    <div
      className="rounded-[20px] bg-white py-4 px-[15px] shadow-[0px_2px_4px_1px_rgba(170,170,170,0.1)] w-full cursor-pointer"
      onClick={onclickLink}
    >
      <div className="flex gap-2 items-start">
        {data?.title === '신고 접수 경고' ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#3E8D00" />
            <path
              d="M11.668 6.33333C11.668 6.14924 11.8172 6 12.0013 6V6C12.1854 6 12.3346 6.14924 12.3346 6.33333V12.8667C12.3346 13.0508 12.1854 13.2 12.0013 13.2V13.2C11.8172 13.2 11.668 13.0508 11.668 12.8667V6.33333Z"
              stroke="#FDFDFD"
              strokeWidth="2"
            />
            <path
              d="M10.5 17.5C10.5 16.6716 11.1716 16 12 16C12.8284 16 13.5 16.6716 13.5 17.5C13.5 18.3284 12.8284 19 12 19C11.1716 19 10.5 18.3284 10.5 17.5Z"
              fill="#FDFDFD"
            />
          </svg>
        ) : data.title === '커뮤니티' ? (
          <CommunityNotification />
        ) : Boolean(data.travelHostUser) ? (
          <TripNotificationIcon
            heartColor="var(--color-keycolor-bg)"
            circleColor="var(--color-keycolor)"
          />
        ) : (
          <TripNotificationIcon />
        )}
        <div className="flex flex-col gap-2 flex-1 justify-center">
          <div className="flex items-center justify-between text-[var(--color-text-muted2)] font-semibold text-xs leading-[12px]">
            <div>{data.title}</div>
            <div className="flex items-center gap-1 text-center">
              <div>{formatTime(data.createdAt)}</div>
              {!data.isRead && (
                <div className="bg-[#ea2a2a] h-2 w-2 rounded-full" />
              )}
            </div>
          </div>
          <div className="text-base font-normal leading-[22.4px]">{data.content}</div>
          {data?.title === '신고 접수 경고' && (
            <button
              type="button"
              className="bg-[var(--color-muted4)] rounded-[40px] h-[42px] w-full text-center py-[12.5px] leading-[17px] text-sm font-semibold text-[var(--color-text-muted)]"
              onClick={(e) => {
                e.stopPropagation();
                router.push('/explanation');
              }}
            >
              소명 사유 입력
            </button>
          )}
        </div>
      </div>
      {data?.title !== '멤버 댓글 알림' &&
        data?.title !== '커뮤니티' &&
        data?.title !== '신고 접수 경고' && (
          <div className="bg-[var(--color-search-bg)] p-4 flex gap-2 items-center mt-4 rounded-[20px]">
            <Badge
              text="마감"
              backgroundColor="var(--color-keycolor-bg)"
              color="var(--color-keycolor)"
              isDueDate={false}
            />
            <div className="text-base font-semibold leading-[22.4px] whitespace-nowrap overflow-hidden text-ellipsis">
              {data.title}
            </div>
          </div>
        )}
    </div>
  );
};

export default NotificationItem;
