'use client';
import React, { useEffect, useRef, useState } from 'react';
import { userProfileOverlayStore } from '@/store/client/userProfileOverlayStore';
import UserProfileOverlayHeader from './UserProfileOverlayHeader';
import UserProfileDetail from './UserProfileDetail';
import UserTravelTabMenu from './UserTravelTabMenu';

const HEADER_DETAIL_HEIGHT = 529;
const TAB_NAVBAR_HEIGHT = 52;
const NO_DATA_COMPONENT_HEIGHT = 256;

export default function UserProfileOverlay() {
  const { setProfileShow, profileShow } = userProfileOverlayStore();
  const [isClickedCloseBtn, setIsClickedCloseBtn] = useState(false);

  useEffect(() => {
    if (isClickedCloseBtn) {
      setTimeout(() => {
        setProfileShow(false);
        setIsClickedCloseBtn(false);
      }, 300);
    }
  }, [isClickedCloseBtn]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [tabHeight, setTabHeight] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const parent = bottomRef.current?.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(() => {
      const scrollHeight = parent.scrollHeight;
      const windowHeight = window.innerHeight;
      const newHeight = Math.max(scrollHeight, windowHeight);
      setHeight(newHeight);
    });

    observer.observe(parent);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setProfileShow(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const BASIC_HEIGHT = tabHeight + HEADER_DETAIL_HEIGHT + TAB_NAVBAR_HEIGHT;
    const NO_DATA_INCLUDE_HEIGHT = BASIC_HEIGHT + NO_DATA_COMPONENT_HEIGHT;
    const isNoData = tabHeight === 0;
    if (isNoData) {
      setHeight(NO_DATA_INCLUDE_HEIGHT);
    } else {
      setHeight(BASIC_HEIGHT);
    }
  }, [tabHeight]);

  return (
    <>
      {profileShow && (
        <div
          className="w-full px-6 absolute z-[1001] top-0 right-0 bottom-0 bg-white min-[440px]:w-[390px] left-1/2"
          style={{
            height: `${height}px`,
            animation: `${isClickedCloseBtn ? 'slideDownProfile' : 'slideUpProfile'} 0.3s ease-out forwards`,
          }}
        >
          <UserProfileOverlayHeader setIsClickedCloseBtn={setIsClickedCloseBtn} />
          <UserProfileDetail />
          <UserTravelTabMenu
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            setTabHeight={setTabHeight}
            tabHeight={tabHeight}
          />
          <div ref={bottomRef} style={{ height: '1px' }} />
        </div>
      )}
    </>
  );
}
