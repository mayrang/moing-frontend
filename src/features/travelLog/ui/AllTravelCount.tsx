import React from 'react';

const AllTravelCount = ({ count }: { count: number }) => {
  return (
    <div className="p-6 mx-6 my-4 bg-[var(--color-search-bg)] text-base leading-[16px] font-normal rounded-[20px]">
      ✨ 총 <span className="text-base leading-[16px] text-[var(--color-keycolor)] font-semibold">{count}</span>개국을 여행했어요
    </div>
  );
};

export default AllTravelCount;
