"use client";

import BoxLayoutTag from "@/components/designSystem/tag/BoxLayoutTag";
import Spacing from "@/components/Spacing";
import { daysAgo, formatTimeOnContact } from "@/utils/time";
import React from "react";

interface ContactItemProps {
  data: Data;
}

type Data = {
  status: "진행 중" | "답변 완료";
  date: string; // 2024-11-18 17:01;
  inquiryType: string;
  title: string;
  content: string;
};

const ContactItem = ({ data }: ContactItemProps) => {
  return (
    <div className="pt-[11px] pb-4 cursor-pointer">
      <div className="flex items-center justify-between">
        {data.status === "답변 완료" ? (
          <BoxLayoutTag
            addStyle={{
              backgroundColor: "var(--color-muted4)",
              padding: "4px 6px 4px 6px",
              color: "var(--color-text-muted)",
              height: "22px",
              borderRadius: "20px",
              fontSize: "12px",
            }}
            text={`답변 완료`}
          />
        ) : (
          <BoxLayoutTag
            text={"답변 중"}
            addStyle={{
              backgroundColor: "var(--color-keycolor-bg)",
              color: "var(--color-keycolor)",
              padding: "4px 10px 4px 10px",
              height: "22px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          />
        )}
        <div className="text-[var(--color-text-muted2)] text-xs tracking-[-0.025em] leading-[22px] font-normal">{formatTimeOnContact(data.date)}</div>
      </div>
      <Spacing size={8} />
      <div className="flex items-center gap-1">
        <div className="leading-[19px] text-base font-semibold tracking-[-0.025em] text-[var(--color-text-base)]">[{data.inquiryType}]</div>
        <div className="leading-[19px] text-base font-normal tracking-[-0.025em] text-[var(--color-text-base)]">{data.title}</div>
      </div>
    </div>
  );
};

export default ContactItem;
