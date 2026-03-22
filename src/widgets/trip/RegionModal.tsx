'use client';
import React from 'react';
import { createPortal } from 'react-dom';
import TripRegion from '@/widgets/trip/TripRegion';
import Spacing from '@/shared/ui/layout/Spacing';

interface RegionModalProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addLocationName: ({
    locationName,
    mapType,
    countryName,
  }: {
    locationName: string;
    mapType: 'google' | 'kakao';
    countryName: string;
  }) => void;
  locationName: {
    locationName: string;
    mapType: 'google' | 'kakao';
    countryName: string;
  };
}

const RegionModal = ({
  isModalOpen,
  setIsModalOpen,
  addLocationName,
  locationName,
}: RegionModalProps) => {
  const handleClose = () => {
    setIsModalOpen(false);
  };

  if (!isModalOpen) return null;

  return createPortal(
    <div className="h-svh w-svw fixed top-0 left-0 z-[1010] bg-[var(--color-bg)] px-6 min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 min-[440px]:w-[390px]">
      <div className="w-full h-[116px] top-0 relative">
        <div
          className="w-12 h-12 absolute top-[52px] cursor-pointer flex items-center justify-center"
          onClick={handleClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.7782 2.22202L2.22183 17.7784M17.7782 17.7784L2.22183 2.22202"
              stroke="#343434"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <Spacing size={8} />
      <TripRegion
        addLocationName={addLocationName}
        initLocationName={locationName}
        nextFunc={handleClose}
      />
    </div>,
    document.getElementById('region-modal') as HTMLElement,
  );
};

export default RegionModal;
