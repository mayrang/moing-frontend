"use client";
import React, { useState } from "react";
import Bookmark from "./Bookmark";
import HostTrip from "./HostTrip";
import ApplyTrip from "./ApplyTrip";

export default function MyTrip() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="tab-view">
            <Bookmark />
          </div>
        );

      case 1:
        return (
          <div className="tab-view">
            <HostTrip />
          </div>
        );
      case 2:
        return (
          <div className="tab-view">
            <ApplyTrip />
          </div>
        );
      default:
        return null;
    }
  };

  const tabClickHandler = (tab: number) => {
    setActiveTab(tab);
  };
  return (
    <div className="w-full">
      <div className="flex justify-center px-6 mb-6 h-[46px]">
        <div className="flex justify-between relative bg-[#f0f0f0] rounded-[20px] py-[10px] w-full">
          <div
            className="absolute top-0 w-[33%] h-full bg-white rounded-[20px] shadow-[0px_2px_4px_1px_#aaaaaa2e] transition-[left] duration-300 ease z-[1]"
            style={{ left: `${(activeTab * 100) / 3}%` }}
          />
          {["북마크", "만든 여행", "참가한 여행"].map((label, idx) => (
            <div
              key={label}
              className="flex-1 text-center text-sm leading-[19.6px] w-[33%] flex justify-center items-center relative z-[2] cursor-pointer"
              style={{
                color: activeTab === idx ? "var(--color-keycolor)" : "var(--color-text-muted)",
                fontWeight: activeTab === idx ? 600 : 400,
              }}
              onClick={() => tabClickHandler(idx)}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
}
