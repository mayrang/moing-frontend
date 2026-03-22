'use client';
import { INotification } from '@/model/notification';
import React from 'react';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  data: { pages: INotification[] };
}

const NotificationList = ({ data }: NotificationListProps) => {
  let newNotificationDivider = false;
  let prevNotificationDivider = false;

  return (
    <div className="px-6 bg-[#f5f5f5]">
      {data.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.content.map((item, itemIndex) => {
            const isFirstUnread = !newNotificationDivider && !item.isRead;
            const isFirstRead = !prevNotificationDivider && item.isRead;

            if (isFirstUnread) {
              newNotificationDivider = true;
            }
            if (isFirstRead) {
              prevNotificationDivider = true;
            }

            return (
              <div key={itemIndex}>
                {isFirstRead && (
                  <div className="mt-10 text-base font-semibold leading-[19.09px]">
                    지난 알림
                  </div>
                )}
                {isFirstUnread && (
                  <div className="mt-2 text-base font-semibold leading-[19.09px]">
                    새로운 알림
                  </div>
                )}
                <div className="pt-4">
                  <NotificationItem data={item} />
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default NotificationList;
