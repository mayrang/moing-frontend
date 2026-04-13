"use client";
import BottomModal from "@/components/BottomModal";
import PersonIcon from "@/components/icons/PersonIcon";
import Vector from "@/components/icons/Vector";
import React, {
  ChangeEvent,
  FocusEventHandler,
  useState,
} from "react";
import Button from "@/components/designSystem/Buttons/Button";
import { createTripStore } from "@/store/client/createTripStore";
import ButtonContainer from "@/components/ButtonContainer";

export default function RecruitingWrapper() {
  const { maxPerson: maxPersonForCreateTrip, addMaxPerson } = createTripStore();
  const [showModal, setShowModal] = useState(false);
  const [focused, setFocused] = useState(false);
  const [isCountSeleted, setIsCountSelected] = useState(false);
  const bgColor = focused ? "var(--color-keycolor-bg)" : "var(--color-search-bg)";
  const borderColor = focused ? "var(--color-keycolor)" : bgColor;
  const color = focused ? "var(--color-keycolor)" : "#000";

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
    setIsCountSelected(true);
  };

  const onClickButton = (type: "plus" | "minus") => {
    if (type === "plus") {
      addMaxPerson(maxPersonForCreateTrip + 1);
    } else {
      addMaxPerson(
        maxPersonForCreateTrip === 0 ? 0 : maxPersonForCreateTrip - 1
      );
    }
    setIsCountSelected(true);
  };

  const handleCloseModal = () => {
    if (maxPersonForCreateTrip <= 0) return;
    setShowModal(false);
    setIsCountSelected(true);
  };

  return (
    <>
      <div>
        <div className="text-base font-semibold leading-[22px] text-left text-[var(--color-text-muted)] px-[6px] gap-2">모집 인원</div>
        <button
          type="button"
          className="flex items-center justify-between mt-2 cursor-pointer h-12 px-4 py-3 rounded-[30px] border border-[var(--color-muted3)] w-full"
          onClick={() => setShowModal(true)}
        >
          <div className="flex items-center gap-2">
            <PersonIcon stroke="var(--color-keycolor)" width={24} height={20} />
            <div
              className="text-base font-medium leading-5"
              style={{
                color: isCountSeleted ? "var(--color-text-base)" : "var(--color-text-muted2)",
              }}
            >
              {maxPersonForCreateTrip}
            </div>
          </div>
          <Vector />
        </button>
      </div>
      {showModal && (
        <BottomModal initialHeight={"224px"} closeModal={handleCloseModal}>
          <div className="flex flex-col h-full relative overflow-hidden">
            <div className="grow pb-[104px]">
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
                  value={maxPersonForCreateTrip}
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
              disabled={maxPersonForCreateTrip <= 0}
              addStyle={
                maxPersonForCreateTrip <= 0
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
}
