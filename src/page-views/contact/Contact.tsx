"use client";
import React, { useState } from "react";
import CreateContact from "./CreateContact";
import ContactList from "./ContactList";

const Contact = () => {
  const [activeTab, setActiveTab] = useState<number>(0); // 현재 선택된 탭을 상태로 관리
  const tabClickHandler = (tab: number) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <CreateContact />;

      case 1:
        return <ContactList />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* <TabWrapper>
        <TabContainer>
          <Slider index={activeTab} />
          <Tab active={activeTab === 0} onClick={() => tabClickHandler(0)}>
            문의하기
          </Tab>
          <Tab active={activeTab === 1} onClick={() => tabClickHandler(1)}>
            문의내역
          </Tab>
        </TabContainer>
      </TabWrapper>
      {renderTabContent()} */}
      <CreateContact />;
    </div>
  );
};

export default Contact;
