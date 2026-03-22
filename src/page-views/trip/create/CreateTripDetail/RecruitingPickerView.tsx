"use client";
import EveryBodyIcon from "@/components/icons/EveryBodyIcon";
import OnlyFemaleIcon from "@/components/icons/OnlyFemaleIcon";
import OnlyMaleIcon from "@/components/icons/OnlyMaleIcon";
import { createTripStore } from "@/store/client/createTripStore";
import { tripDetailStore } from "@/store/client/tripDetailStore";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import Picker from "react-mobile-picker";

const date = new Date();
const year: number = date.getFullYear();
const month: number = date.getMonth() + 1;
const day = date.getDate();

const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const getMaxDays = (year: number, month: number) => {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};

interface Recruiting {
  gender: string;
  count: number;
}
interface Props {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

const RecruitingPickerView = ({ count, setCount }: Props) => {
  const pathname = usePathname();
  const isCreateTripDetailPage = pathname === "/createTripDetail";

  const { maxPerson, addMaxPerson, genderType, addGenderType } = createTripStore();
  const {
    maxPerson: maxPersonForEdit,
    addMaxPerson: addMaxPersonForEdit,
    genderType: genderTypeEdit,
    addGenderType: addGenderTypeEdit,
  } = tripDetailStore();
  const pickerRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(
    isCreateTripDetailPage
      ? { gender: genderType || "모두", count: count }
      : {
          gender: genderTypeEdit,
          count: maxPersonForEdit,
        }
  );

  const selections: { [key: string]: number[] | string[] } = {
    gender: ["여자만", "모두", "남자만"],
    count: Array.from({ length: 20 }, (v, i) => i + 1),
  };
  useEffect(() => {
    if (pickerRef.current) {
      const divs = pickerRef.current.querySelector("div");
      const lastDiv = divs?.lastChild as HTMLDivElement;

      if (lastDiv) {
        const childDivs = lastDiv.querySelectorAll("div");

        childDivs.forEach((div) => {
          div.style.background = "none";
          div.style.display = "flex";
          div.style.justifyContent = "space-evenly";
          const numDivs = 2;
          for (let i = 0; i < numDivs; i++) {
            const newDiv = document.createElement("div");
            newDiv.style.width = "45%";
            newDiv.style.height = "1px";
            newDiv.style.background = "black";
            newDiv.style.display = "inline-block";
            newDiv.style.margin = "0";

            div.appendChild(newDiv);
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    setCount(value.count);

    addGenderType(value.gender || "모두");
    addGenderTypeEdit(value.gender || "모두");
    addMaxPerson(value.count);
    addMaxPersonForEdit(value.count);
  }, [value]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }} ref={pickerRef}>
      <Picker
        style={{ width: "270px" }}
        value={value}
        onChange={setValue}
        wheelMode="normal"
        className="custom-picker"
        itemHeight={50.3}
        height={160}
      >
        {Object.keys(selections).map((col, idx) => {
          return (
            <Picker.Column key={col} name={col}>
              {selections[col].map((option) => (
                <Picker.Item key={option} value={option}>
                  {({ selected }) => (
                    <div
                      style={{
                        color: selected ? "var(--color-text-base)" : "var(--color-muted3)",
                        padding: "14px 16px",
                        height: "52px",
                        fontWeight: 500,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        lineHeight: col === "gender" ? "22.4px" : "25.2px",
                        fontSize: col === "gender" ? "16px" : "18px",
                      }}
                    >
                      {col === "gender" ? (
                        idx === 0 ? (
                          <EveryBodyIcon selected={selected} />
                        ) : idx === 1 ? (
                          <OnlyFemaleIcon selected={selected} />
                        ) : (
                          <OnlyMaleIcon selected={selected} />
                        )
                      ) : (
                        <></>
                      )}
                      <div className="ml-1 text-base font-semibold leading-[22.4px] text-left">{option}</div>
                    </div>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
          );
        })}
      </Picker>
    </div>
  );
};

export default RecruitingPickerView;
