'use client';
import BackIcon from '@/components/icons/BackIcon';
import TripDetailHeader from '@/page/TripDetail/TripDetailHeader';
import AlarmIcon from '../icons/AlarmIcon';
import CommunityHeader from '@/components/community/CommunityHeader';
import { useHeaderNavigation } from '@/hooks/useHeaderNavigation';
import { useBackPathStore } from '@/store/client/backPathStore';
import { isGuestUser } from '@/utils/user';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createTripStore } from '@/store/client/createTripStore';
import { cn } from '@/shared/lib/cn';

const Header = () => {
  const {
    getPageTitle,
    shouldShowAlarmIcon,
    shouldShowSkip,
    ROUTES,
    checkRoute,
    handleBack,
  } = useHeaderNavigation();
  const { addTags } = createTripStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setNotification } = useBackPathStore();

  const handleNotification = () => {
    setNotification(
      checkRoute.exact(ROUTES.MY.PAGE) ? ROUTES.MY.PAGE : ROUTES.MY.TRIP
    );
    router.push('/notification');
  };

  const headerBackgroundColorIsGrey = () =>
    checkRoute.exact(ROUTES.MY.TRIP) || checkRoute.startsWith(ROUTES.REQUESTED_TRIP);

  const headerBackgroundColorIsF5 = () =>
    checkRoute.exact(ROUTES.HOME) ||
    checkRoute?.startsWith(ROUTES.NOTIFICATION) ||
    checkRoute?.startsWith(ROUTES.COMMUNITY.DETAIL);

  const getBgColor = () => {
    if (headerBackgroundColorIsF5()) return '#F5F5F5';
    if (headerBackgroundColorIsGrey()) return 'var(--color-search-bg)';
    return 'var(--color-bg)';
  };

  return (
    <header
      className="flex px-6 pt-[52px] pb-4 h-[116px] items-center gap-[22px] sticky top-0 z-[1000] justify-between w-full"
      style={{ backgroundColor: getBgColor() }}
    >
      {!shouldShowAlarmIcon() && (
        <div className="flex items-center">
          <button type="button" className="cursor-pointer" onClick={handleBack}>
            <BackIcon />
          </button>
          {(checkRoute.startsWith(ROUTES.TRIP.DETAIL) ||
            checkRoute.startsWith(ROUTES.COMMUNITY.DETAIL)) &&
            searchParams?.get('share') === 'true' && (
              <Link href="/" style={{ marginLeft: 14 }}>
                <img src={'/images/homeLogo.png'} width={96} height={24} alt="홈 모잉의 로고입니다" />
              </Link>
            )}
        </div>
      )}

      <h2 className="text-xl font-bold">{getPageTitle()}</h2>

      {shouldShowSkip() && (
        <div
          className="font-normal text-sm text-[rgba(155,155,155,1)] underline cursor-pointer"
          onClick={() => {
            if (checkRoute.exact(ROUTES.CREATE_TRIP.TAG)) {
              addTags([]);
              router.push(ROUTES.CREATE_TRIP.INTRODUCE);
              return;
            }
            router.push('/');
          }}
        >
          건너뛰기
        </div>
      )}

      {!checkRoute.exact(ROUTES.REGISTER_PROCESS.TRIP_STYLE) &&
        !checkRoute.exact(ROUTES.CREATE_TRIP.TAG) && (
          <div className="w-6 h-6" aria-hidden="true" />
        )}

      {checkRoute.startsWith(ROUTES.TRIP.DETAIL) && <TripDetailHeader />}
      {checkRoute.startsWith(ROUTES.COMMUNITY.DETAIL) && <CommunityHeader />}

      {shouldShowAlarmIcon() &&
        !shouldShowSkip() &&
        (isGuestUser() ? (
          <div className="w-12 h-12" />
        ) : (
          <div
            className="w-12 h-12 flex cursor-pointer items-center justify-center"
            onClick={handleNotification}
          >
            <AlarmIcon size={23} stroke="var(--color-text-base)" />
          </div>
        ))}
    </header>
  );
};

export default Header;
