"use client";
import BottomModal from "@/components/BottomModal";
import ButtonContainer from "@/components/ButtonContainer";
import Button from "@/components/designSystem/Buttons/Button";
import ArrowIcon from "@/components/icons/ArrowIcon";
import EveryBodyIcon from "@/components/icons/EveryBodyIcon";
import OnlyFemaleIcon from "@/components/icons/OnlyFemaleIcon";
import OnlyMaleIcon from "@/components/icons/OnlyMaleIcon";
import React, { ChangeEvent, FocusEventHandler, useState } from "react";
import { selections } from "@/page-views/trip/create/CreateTripInfo";
import Spacing from "@/components/Spacing";

interface InfoWrapperProps {
  genderType?: string | null;
  maxPerson: number;
  addMaxPerson: (person: number) => void;
  addGenderType: (type: string) => void;
  nowPerson?: number;
}

const InfoWrapper = ({
  genderType,
  maxPerson,
  addMaxPerson,
  addGenderType,
  nowPerson = 0,
}: InfoWrapperProps) => {
  const [showModal, setShowModal] = useState(false);

  const [focused, setFocused] = useState(false);

  const bgColor = focused ? "var(--color-keycolor-bg)" : "var(--color-search-bg)";
  const borderColor = focused ? "var(--color-keycolor)" : bgColor;
  const color = focused ? "var(--color-keycolor)" : "#000";

  const clickGender = (genderType: string) => {
    addGenderType(genderType);
  };

  const handleFocus: FocusEventHandler<HTMLInputElement> = () => {
    setFocused(true);
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = () => {
    setFocused(false);
  };

  const onChangeCount = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "0") return;
    const value = Number(e.target.value);
    if (isNaN(value)) return;
    e.target.value = value.toString();
    addMaxPerson(value);
  };

  const onClickButton = (type: "plus" | "minus") => {
    if (type === "plus") {
      addMaxPerson(maxPerson + 1);
    } else {
      addMaxPerson(maxPerson === 0 ? 0 : maxPerson - 1);
    }
  };

  const handleCloseModal = () => {
    if (maxPerson <= 0) return;
    setShowModal(false);
  };

  return (
    <>
      <div
        className="py-[11px] cursor-pointer pl-2 flex items-center justify-between"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center">
          <div className="flex items-center w-[100px] gap-2 mr-3">
            {genderType === "모두" ? (
              <EveryBodyIcon selected size={24} />
            ) : genderType === "남자만" ? (
              <OnlyMaleIcon selected size={24} />
            ) : (
              <OnlyFemaleIcon selected size={24} />
            )}
            <div className="text-sm leading-5 text-[var(--color-text-muted)] font-semibold">{genderType}</div>
          </div>
          <div className="text-sm leading-5 text-[var(--color-text-base)] font-medium">
            {nowPerson} / {maxPerson}
          </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12">
          <ArrowIcon />
        </div>
      </div>
      {showModal && (
        <BottomModal
          initialHeight={44}
          closeModal={handleCloseModal}
        >
          <div className="flex flex-col h-full relative overflow-hidden">
            <div className="grow pb-[104px]">
              <Spacing size={24} />
              <div className="flex gap-4 items-center justify-center mt-2">
                {selections.map((item) => (
                  <div
                    key={item.gender}
                    className="flex flex-col items-center cursor-pointer gap-1 justify-center rounded-[20px] w-[90px] h-[84px]"
                    style={{
                      backgroundColor: genderType === item.gender ? "var(--color-keycolor-bg)" : "var(--color-search-bg)",
                      border: genderType === item.gender ? "1px solid var(--color-keycolor)" : "0px",
                      color: genderType === item.gender ? "var(--color-keycolor)" : "var(--color-text-base)",
                      fontWeight: genderType === item.gender ? 600 : 400,
                    }}
                    onClick={() => clickGender(item.gender)}
                  >
                    {item.icon(genderType === item.gender)}
                    <div className="text-sm leading-5">{item.gender}</div>
                  </div>
                ))}
              </div>
              <Spacing size={34} />
              <div className="flex gap-4 items-center justify-center mt-[6px]">
                <button
                  type="button"
                  className="w-[42px] h-[42px] rounded-full relative bg-[var(--color-text-muted)] cursor-pointer before:content-[''] before:w-4 before:h-[3px] before:bg-white before:rounded-lg before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2"
                  onClick={() => onClickButton("minus")}
                />
                <input
                  className="rounded-[40px] h-12 text-center w-[120px] text-base leading-[22px] outline-none appearance-none"
                  style={{
                    backgroundColor: bgColor,
                    color: color,
                    border: `1px solid ${borderColor}`,
                  }}
                  value={maxPerson}
                  onChange={onChangeCount}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  type="number"
                />
                <button
                  type="button"
                  className="w-[42px] h-[42px] rounded-full cursor-pointer relative bg-[var(--color-text-muted)] before:content-[''] before:w-4 before:h-[3px] before:bg-white before:rounded-lg before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 after:content-[''] after:w-[3px] after:h-4 after:bg-white after:rounded-lg after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2"
                  onClick={() => onClickButton("plus")}
                />
              </div>
            </div>
          </div>
          <ButtonContainer>
            <Button
              onClick={handleCloseModal}
              disabled={maxPerson <= 0}
              addStyle={
                maxPerson <= 0
                  ? {
                      backgroundColor: "rgba(220, 220, 220, 1)",
                      color: "rgba(132, 132, 132, 1)",
                      boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
                    }
                  : undefined
              }
              text={"다음"}
            />
          </ButtonContainer>
        </BottomModal>
      )}
    </>
  );
};

export default InfoWrapper;
