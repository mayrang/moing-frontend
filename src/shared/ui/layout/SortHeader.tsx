'use client';
import React, { useState } from 'react';
import SortIcon from '@/components/icons/SortIcon';
import BottomModal from './BottomModal';
import Spacing from './Spacing';

interface SortHeaderProps {
  list: string[];
  sort: string;
  clickSort: (value: string) => void;
  children: React.ReactNode;
  setFixed?: (bool: boolean) => void;
}

const SortHeader = ({ list, clickSort, sort, setFixed, children }: SortHeaderProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleSort = (value: string) => {
    clickSort(value);
    setShowModal(false);
  };

  const handleShowModal = (type: boolean) => {
    setShowModal(type);
    if (setFixed) setFixed(!type);
  };

  return (
    <>
      {showModal && (
        <BottomModal initialHeight={40} closeModal={() => handleShowModal(false)}>
          <div className="px-5">
            <Spacing size={24} />
            {list.map((value) => (
              <button
                type="button"
                key={value}
                className={[
                  'text-sm font-semibold leading-[19.09px] w-full flex items-center justify-between',
                  'py-5 border-b border-[rgba(240,240,240,1)]',
                  value === sort ? 'text-[rgb(62,141,0)]' : 'text-black',
                ].join(' ')}
                onClick={() => handleSort(value)}
              >
                <span>{value}</span>
                {sort === value && (
                  <svg style={{ paddingRight: 6 }} width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8L8.375 14L19 2" stroke="#3E8D00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
            <Spacing size={66} />
          </div>
        </BottomModal>
      )}
      <div className="flex justify-between items-center">
        {children}
        <div
          className="flex cursor-pointer gap-1 text-sm items-center"
          onClick={() => handleShowModal(true)}
        >
          <SortIcon />
          {sort}
        </div>
      </div>
    </>
  );
};

export default SortHeader;
