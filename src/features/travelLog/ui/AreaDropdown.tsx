'use client';
import React, { useState } from 'react';
import Accordion from '@/shared/ui/layout/Accordion';
import { countItems, getContinentToKorean } from '@/utils/travellog/travelLog';
import dayjs from 'dayjs';
import BottomModal from '@/shared/ui/layout/BottomModal';
import ButtonContainer from '@/shared/ui/layout/ButtonContainer';
import Button from '@/shared/ui/button/Button';

interface AreaItem {
  locationName?: string;
  countryName?: string;
  visitDates: string[];
}

interface AreaDropdownProps {
  data: {
    [key: string]: AreaItem[];
  };
  setTarget: React.Dispatch<React.SetStateAction<string[] | null>>;
}

const ClockIcon = () => (
  <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.3">
      <path
        d="M12 23C15.866 23 19 19.866 19 16C19 12.134 15.866 9 12 9C8.13401 9 5 12.134 5 16C5 19.866 8.13401 23 12 23Z"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11.8003V16.0003L14.8 17.4003"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const AreaDropdown = ({ data, setTarget }: AreaDropdownProps) => {
  const [showModal, setShowModal] = useState(false);
  const [targetData, setTargetData] = useState<AreaItem | null>(null);

  const openModal = (item: AreaItem) => {
    setShowModal(true);
    setTargetData(item);
  };

  const closeModal = () => {
    setShowModal(false);
    setTargetData(null);
  };

  return (
    <>
      {showModal && (
        <BottomModal initialHeight={40} closeModal={closeModal}>
          <div className="px-6">
            <div className="text-lg leading-[34px] py-3 pl-1 border-b border-[#e7e7e7]">
              {targetData?.locationName ?? targetData?.countryName}
            </div>
            <div className="p-1 flex flex-col max-h-[calc(40svh-212px)] overflow-y-auto gap-2">
              {[...(targetData?.visitDates ?? [])].reverse().map((date, idx) => (
                <div key={idx} className="flex gap-2 w-full items-center text-sm leading-[16px] font-normal">
                  <ClockIcon />
                  <div>{dayjs(date).format('YY.MM.DD')}</div>
                </div>
              ))}
            </div>
          </div>
          <ButtonContainer>
            <Button onClick={closeModal} text="닫기" />
          </ButtonContainer>
        </BottomModal>
      )}
      <div className="px-6">
        {Object.keys(data).map((item, index) => (
          <Accordion
            travelCount={countItems(item) ?? 1}
            title={getContinentToKorean(item)}
            count={data[item].length}
            id={item}
            key={item}
            handleOpen={() => setTarget((prev) => (prev ? [...prev, item] : [item]))}
            handleClose={() =>
              setTarget((prev) =>
                prev && prev?.length > 1
                  ? prev.filter((prevItem) => prevItem !== item)
                  : null,
              )
            }
            paddingTop="0"
            paddingBottom="13px"
            tabPadding="10px"
            paddingLeft="0"
            paddingRight="0"
            initialChecked={index === 0}
          >
            {data[item].map((region, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between w-full cursor-pointer py-[18px] gap-2"
                onClick={() => openModal(region)}
              >
                <div className="w-[18px] h-[18px] text-white bg-[var(--color-text-base)] rounded-full font-semibold text-xs text-center leading-[18px]">
                  {idx + 1}
                </div>
                <div className="text-base font-normal leading-[16px] flex-1">
                  {region.locationName ?? region.countryName}
                </div>
                <div className="leading-[16px] text-sm text-[var(--color-text-muted)]">
                  {dayjs(region.visitDates[region.visitDates.length - 1]).format('YY.MM.DD')}
                  {region.visitDates.length > 1 && (
                    <span className="ml-1 px-1 py-px rounded-[20px] bg-[var(--color-text-muted2)] text-white text-xs leading-[14px] font-semibold h-4">
                      +{region.visitDates.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </Accordion>
        ))}
      </div>
    </>
  );
};

export default AreaDropdown;
