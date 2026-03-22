'use client';
import React, { useEffect, useState } from 'react';
import useViewTransition from '@/shared/hooks/useViewTransition';
import { userProfileOverlayStore } from '@/store/client/userProfileOverlayStore';
import HorizonBoxLayout from '@/shared/ui/layout/HorizonBoxLayout';
import { daysAgo } from '@/utils/time';
import { useInView } from 'react-intersection-observer';
import useUserProfile from '@/features/userProfile/hooks/useUserProfile';
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll';
import { IUserRelatedTravelList } from '@/model/userProfile';
import RoundedImage from '@/shared/ui/profile/RoundedImage';
import { cn } from '@/shared/lib/cn';

interface UserTravelTabMenuProps {
  tabHeight: number;
  setTabHeight: React.Dispatch<React.SetStateAction<number>>;
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
  selectedTab: number;
}

const BOX_LAYOUT_HEIGHT = 115;

export default function UserTravelTabMenu({
  tabHeight,
  setTabHeight,
  selectedTab,
  setSelectedTab,
}: UserTravelTabMenuProps) {
  const { setProfileShow } = userProfileOverlayStore();
  const navigateWithTransition = useViewTransition();
  const [isClickedCloseBtn, setIsClickedCloseBtn] = useState(false);

  const [createdTravelsRef, createdTravelsInView] = useInView();
  const [appliedTravelsRef, appliedTravelsInView] = useInView();

  const {
    userProfileCreatedTravelsData,
    isUserProfileCreatedTravelsLoading,
    fetchNextUserProfileCreatedTravelsPage,
    isUserProfileCreatedTravelsFetching,
    hasNextUserProfileCreatedTravelsPage,

    userProfileAppliedTravelsData,
    isUserProfileAppliedTravelsLoading,
    fetchNextUserProfileAppliedTravelsPage,
    isUserProfileAppliedTravelsFetching,
    hasNextUserProfileAppliedTravelsPage,

    userProfileInfo,
  } = useUserProfile();

  useEffect(() => {
    if (isClickedCloseBtn) {
      setTimeout(() => {
        setProfileShow(false);
        setIsClickedCloseBtn(false);
      }, 300);
    }
  }, [isClickedCloseBtn]);

  useEffect(() => {
    if (selectedTab === 0 && userProfileInfo) {
      setTabHeight(userProfileInfo?.createdTravelCount * BOX_LAYOUT_HEIGHT);
    } else if (selectedTab === 1 && userProfileInfo) {
      setTabHeight(userProfileInfo?.participatedTravelCount * BOX_LAYOUT_HEIGHT);
    }
  }, [selectedTab, hasNextUserProfileCreatedTravelsPage, hasNextUserProfileAppliedTravelsPage]);

  useInfiniteScroll(() => {
    if (createdTravelsInView) {
      !isUserProfileCreatedTravelsFetching &&
        hasNextUserProfileCreatedTravelsPage &&
        fetchNextUserProfileCreatedTravelsPage();
    }
  }, [
    createdTravelsInView,
    isUserProfileCreatedTravelsFetching,
    fetchNextUserProfileCreatedTravelsPage,
    hasNextUserProfileCreatedTravelsPage,
  ]);

  useInfiniteScroll(() => {
    if (appliedTravelsInView) {
      !isUserProfileAppliedTravelsFetching &&
        hasNextUserProfileAppliedTravelsPage &&
        fetchNextUserProfileAppliedTravelsPage();
    }
  }, [
    appliedTravelsInView,
    isUserProfileAppliedTravelsFetching,
    fetchNextUserProfileAppliedTravelsPage,
    hasNextUserProfileAppliedTravelsPage,
  ]);

  if (isUserProfileCreatedTravelsLoading || isUserProfileAppliedTravelsLoading) {
    return null;
  }

  const userProfileCreatedTravels =
    (userProfileCreatedTravelsData?.pages[0].content as IUserRelatedTravelList['content']) ?? [];

  const userProfileAppliedTravels =
    (userProfileAppliedTravelsData?.pages[0].content as IUserRelatedTravelList['content']) ?? [];

  const isCreatedTravelsNoData = userProfileCreatedTravels.length === 0;
  const isAppliedTravelsNoData = userProfileAppliedTravels.length === 0;

  const clickTrip = (travelNumber: number) => {
    navigateWithTransition(`/trip/detail/${travelNumber}`);
    setTimeout(() => {
      setProfileShow(false);
    }, 50);
  };

  const travelListHeight = () => {
    const MINIMUM_HEIGHT = 256;
    return tabHeight === 0 ? MINIMUM_HEIGHT : tabHeight;
  };

  return (
    <div className="w-full flex flex-col bg-white">
      <div className="sticky top-[100px] z-[1002] bg-white flex justify-between border-b border-[#e0e0e0] -mx-6">
        <button
          type="button"
          className={cn(
            'flex-1 py-4 cursor-pointer flex justify-center gap-1 text-sm font-semibold transition-all duration-[400ms]',
            selectedTab === 0
              ? 'border-b-2 border-[var(--color-text-base)] text-[var(--color-text-base)]'
              : 'border-b border-[var(--color-muted3)] text-[var(--color-text-muted2)]',
          )}
          onClick={() => setSelectedTab(0)}
        >
          <span className="text-sm">만든 여행</span>
          <span
            className={cn(
              selectedTab === 0
                ? 'text-[var(--color-keycolor)]'
                : 'text-[var(--color-text-muted2)]',
            )}
          >
            {userProfileInfo?.createdTravelCount}
          </span>
        </button>
        <button
          type="button"
          className={cn(
            'flex-1 py-4 cursor-pointer flex justify-center gap-1 text-sm font-semibold transition-all duration-[400ms]',
            selectedTab === 1
              ? 'border-b-2 border-[var(--color-text-base)] text-[var(--color-text-base)]'
              : 'border-b border-[var(--color-muted3)] text-[var(--color-text-muted2)]',
          )}
          onClick={() => setSelectedTab(1)}
        >
          <span>참가한 여행</span>
          <span
            className={cn(
              selectedTab === 1
                ? 'text-[var(--color-keycolor)]'
                : 'text-[var(--color-text-muted2)]',
            )}
          >
            {userProfileInfo?.participatedTravelCount}
          </span>
        </button>
      </div>
      <div
        className="w-full overflow-hidden relative"
        style={{ height: `${travelListHeight()}px` }}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: selectedTab === 0 ? 'translateX(0%)' : 'translateX(-100%)' }}
        >
          <div className="w-full flex-shrink-0">
            {isCreatedTravelsNoData && (
              <div className="fixed top-0 w-full flex flex-col items-center justify-center mt-20 mb-[88px]">
                <RoundedImage size={80} src="/images/noData.png" />
                <div className="mt-4 flex flex-col items-center justify-center text-center text-base font-semibold leading-[22.4px] tracking-[-0.025em] text-[var(--color-text-base)]">
                  <div>아직 만든 여행이 없어요</div>
                </div>
              </div>
            )}
            {!isUserProfileCreatedTravelsLoading &&
              userProfileCreatedTravelsData &&
              userProfileCreatedTravelsData.pages.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page.content?.map(
                    ({ travelNumber, location, userName, title, tags, maxPerson, createdAt, nowPerson }) => (
                      <div
                        key={title}
                        className="py-3 border-b border-[var(--color-muted4)]"
                        onClick={() => clickTrip(travelNumber)}
                      >
                        <HorizonBoxLayout
                          bookmarkNeed={false}
                          bookmarked={false}
                          travelNumber={travelNumber}
                          userName={userName}
                          title={title}
                          tags={tags}
                          total={maxPerson}
                          location={location}
                          daysAgo={daysAgo(createdAt)}
                          recruits={nowPerson}
                          userProfileType={true}
                        />
                      </div>
                    ),
                  )}
                </React.Fragment>
              ))}
            <div ref={createdTravelsRef} style={{ height: 1 }} />
          </div>

          <div className="w-full flex-shrink-0">
            {isAppliedTravelsNoData && (
              <div className="fixed top-0 w-full flex flex-col items-center justify-center mt-20 mb-[88px]">
                <RoundedImage size={80} src="/images/noData.png" />
                <div className="mt-4 flex flex-col items-center justify-center text-center text-base font-semibold leading-[22.4px] tracking-[-0.025em] text-[var(--color-text-base)]">
                  <div>아직 참가한 여행이 없어요</div>
                </div>
              </div>
            )}
            {!isUserProfileAppliedTravelsLoading &&
              userProfileAppliedTravelsData &&
              userProfileAppliedTravelsData.pages.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page.content?.map(
                    ({ travelNumber, location, userName, title, tags, maxPerson, createdAt, nowPerson }) => (
                      <div
                        key={title}
                        className="py-3 border-b border-[var(--color-muted4)]"
                        onClick={() => clickTrip(travelNumber)}
                      >
                        <HorizonBoxLayout
                          bookmarkNeed={false}
                          bookmarked={false}
                          travelNumber={travelNumber}
                          userName={userName}
                          title={title}
                          tags={tags}
                          total={maxPerson}
                          location={location}
                          daysAgo={daysAgo(createdAt)}
                          recruits={nowPerson}
                          userProfileType={true}
                        />
                      </div>
                    ),
                  )}
                </React.Fragment>
              ))}
            <div ref={appliedTravelsRef} style={{ height: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
