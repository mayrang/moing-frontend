'use client';
import CloseIcon from '@/components/icons/CloseIcon';
import ProfileMoreIcon from '@/components/icons/ProfileMoreIcon';
import ReportModal from '@/shared/ui/modal/ReportModal';
import { useEffect, useState } from 'react';
import useViewTransition from '@/shared/hooks/useViewTransition';

interface UserProfileOverlayHeaderProps {
  setIsClickedCloseBtn: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserProfileOverlayHeader = ({
  setIsClickedCloseBtn,
}: UserProfileOverlayHeaderProps) => {
  const closeOverlay = () => {
    setIsClickedCloseBtn(true);
  };
  const [isReportBtnClicked, setIsReportBtnClicked] = useState(false);
  const [reportThreeDotsClick, setReportThreeDotsClick] = useState(false);
  const [userNumber, setUserNumber] = useState(1);
  const navigateWithTransition = useViewTransition();

  useEffect(() => {
    if (isReportBtnClicked) {
      setIsReportBtnClicked(false);
      setIsClickedCloseBtn(true);
      setUserNumber(userNumber);
      document.documentElement.style.viewTransitionName = 'forward';
      navigateWithTransition(`/report/userProfile/${userNumber}`);
    }
  }, [isReportBtnClicked]);

  return (
    <header className="flex px-0 py-0 pt-10 pb-4 h-[100px] items-center gap-[22px] sticky top-0 bg-white z-[1000] justify-between w-full">
      <div className="flex items-center w-full justify-between">
        <button type="button" className="cursor-pointer" onClick={closeOverlay}>
          <CloseIcon />
        </button>
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => setReportThreeDotsClick(true)}
        >
          <ProfileMoreIcon />
        </button>
      </div>
      <ReportModal
        setIsReportBtnClicked={setIsReportBtnClicked}
        isOpen={reportThreeDotsClick}
        setIsOpen={setReportThreeDotsClick}
      />
    </header>
  );
};

export default UserProfileOverlayHeader;
