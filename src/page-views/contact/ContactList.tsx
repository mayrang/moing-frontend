"use client";
import React from "react";
import ContactInfinite from "./ContactInfinite";

const ContactList = () => {
  return (
    <>
      <div className="px-6 pt-[22px] pb-4 sticky top-[172px] z-[1001] bg-[var(--color-bg)] box-border">
        <div className="text-sm font-medium leading-[16.71px] tracking-[-0.025em]">
          총&nbsp;
          {/* <Count>{data?.pages[0].page.totalElements ?? 0}건</Count> */}
          <span className="text-[#3e8d00] font-bold">{0}건</span>
        </div>
      </div>
      <div className="px-6 min-h-full overflow-y-auto w-full">
        <ContactInfinite />
      </div>
    </>
  );
};

export default ContactList;
