"use client";
import BottomModal from "@/components/BottomModal";
import ButtonContainer from "@/components/ButtonContainer";
import Button from "@/components/designSystem/Buttons/Button";
import BoxLayoutTag from "@/components/designSystem/tag/BoxLayoutTag";
import React, { useState } from "react";
import TagList from "@/page-views/trip/create/component/TagList";
import Spacing from "@/components/Spacing";
import { TAG_LIST } from "@/constants/tags";
import WarningToast from "@/components/designSystem/toastMessage/WarningToast";

interface TagListWrapperProps {
  taggedArray: string[];
  addTags: (tags: string[]) => void;
}

const TagListWrapper = ({ taggedArray, addTags }: TagListWrapperProps) => {
  const [showModal, setShowModal] = useState(false);
  const [tempTaggedArray, setTampTaggedArray] = useState(taggedArray);
  const [limitCountToastShow, setLimitCountToastShow] = useState(false);

  const isActive = (tag: string) => {
    return taggedArray.includes(tag);
  };
  const clickTag = (index: number) => {
    if (tempTaggedArray.length === 5) {
      if (!isActive(TAG_LIST.value[index])) {
        setLimitCountToastShow(true);
        return;
      }
    }
    const newArray = taggedArray.includes(TAG_LIST.value[index])
      ? taggedArray.filter((v) => v !== TAG_LIST.value[index])
      : [...taggedArray, TAG_LIST.value[index]];
    addTags(newArray);
    setTampTaggedArray(newArray);
  };
  const handleCloseModal = () => {
    if (tempTaggedArray.length > 5) return;
    addTags(tempTaggedArray);
    setTampTaggedArray([]);
    setShowModal(false);
  };
  const handleBackdrop = () => {
    setShowModal(false);
  };
  return (
    <>
      <WarningToast
        height={120}
        isShow={limitCountToastShow}
        setIsShow={setLimitCountToastShow}
        text="최대 5개까지 설정할 수 있어요"
      />
      <div className="flex items-center gap-2 w-full">
        {taggedArray.map((tag) => (
          <BoxLayoutTag
            key={tag}
            text={tag}
            addStyle={{
              backgroundColor: "var(--color-muted4)",
              borderRadius: "20px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: "500",
              height: "22px",
              margin: "0",
              color: "var(--color-text-muted)",
            }}
          />
        ))}
        <div
          className="flex items-center justify-center w-[34px] h-[22px] bg-[var(--color-text-muted)] rounded-[20px] cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.18693 0.719026C8.40571 0.500309 8.7024 0.377441 9.01176 0.377441C9.32112 0.377441 9.61781 0.500309 9.83659 0.719026L11.2803 2.16278C11.3887 2.27112 11.4747 2.39975 11.5334 2.54133C11.592 2.6829 11.6222 2.83465 11.6222 2.9879C11.6222 3.14115 11.592 3.2929 11.5334 3.43447C11.4747 3.57605 11.3887 3.70468 11.2803 3.81303L4.34276 10.7506L0.621094 11.3783L1.24934 7.65661L8.18693 0.719026ZM8.05334 2.50228L9.49709 3.94603L10.4555 2.98761L9.01176 1.54444L8.05334 2.50228ZM8.67168 4.77144L7.22851 3.32769L2.33784 8.21836L2.04443 9.95494L3.78101 9.66211L8.67168 4.77144Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
      {showModal && (
        <BottomModal
          initialHeight={65}
          backdropClick={handleBackdrop}
          closeModal={handleCloseModal}
        >
          <div className="flex flex-col h-full relative overflow-y-auto overflow-x-hidden">
            <div className="grow px-6 pb-[104px]">
              <h2 className="text-xl font-semibold leading-7 ml-[6px] text-left">
                태그 수정 <span className="text-sm font-normal text-[var(--color-text-muted)]">(최대 5개)</span>
              </h2>
              <Spacing size={16} />
              <TagList taggedArray={tempTaggedArray} clickTag={clickTag} />
            </div>
          </div>
          <ButtonContainer>
            <Button
              onClick={handleCloseModal}
              disabled={tempTaggedArray.length > 5}
              addStyle={
                tempTaggedArray.length > 5
                  ? {
                      backgroundColor: "rgba(220, 220, 220, 1)",
                      color: "rgba(132, 132, 132, 1)",
                      boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
                    }
                  : undefined
              }
              text={"완료"}
            />
          </ButtonContainer>
        </BottomModal>
      )}
    </>
  );
};

export default TagListWrapper;
